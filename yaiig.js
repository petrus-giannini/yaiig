// ─── CIN lookup tables (ABI standard) ───────────────────────────────────────

const ODD_VALUES = {
  '0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,
  'A':1,'B':0,'C':5,'D':7,'E':9,'F':13,'G':15,'H':17,'I':19,'J':21,
  'K':2,'L':4,'M':18,'N':20,'O':11,'P':3,'Q':6,'R':8,'S':12,'T':14,
  'U':16,'V':10,'W':22,'X':25,'Y':24,'Z':23
};

const EVEN_VALUES = {
  '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
  'A':0,'B':1,'C':2,'D':3,'E':4,'F':5,'G':6,'H':7,'I':8,'J':9,
  'K':10,'L':11,'M':12,'N':13,'O':14,'P':15,'Q':16,'R':17,'S':18,'T':19,
  'U':20,'V':21,'W':22,'X':23,'Y':24,'Z':25
};

const CIN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ABI_CODES = ["01030","02008","03069","05034","06230","08327","03225","06285","01005","05696"];
const CAB_CODES = ["01800","11101","01000","09400","32430","01234","56789","09800","11200","22100"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function computeCIN(abi, cab, account) {
  const chars = (abi + cab + account).toUpperCase().split("");
  let sum = 0;
  chars.forEach((c, i) => {
    sum += ((i + 1) % 2 === 1) ? ODD_VALUES[c] : EVEN_VALUES[c];
  });
  return CIN_LETTERS[sum % 26];
}

function generateIBAN() {
  const abi     = rand(ABI_CODES);
  const cab     = rand(CAB_CODES);
  const account = String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
  const cin     = computeCIN(abi, cab, account);
  const bban    = cin + abi + cab + account;

  // MOD 97 check digits
  const numeric = (bban + "IT00").split("").map(c =>
    c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55).toString() : c
  ).join("");

  let rem = 0n;
  for (const ch of numeric) rem = (rem * 10n + BigInt(ch)) % 97n;
  const checkDigits = String(98n - rem).padStart(2, "0");

  return { iban: "IT" + checkDigits + bban, abi, cab, checkDigits, cin };
}

function formatIBAN(raw) {
  return raw.replace(/(.{4})/g, "$1 ").trim();
}

// ─── Theme switcher ──────────────────────────────────────────────────────────

const THEMES = ["acido", "classico-chiaro", "classico-scuro", "circo", "stalingrado", "habana", "ho-chi-min"];

const THEME_LABELS = {
  "acido":            "Acido",
  "classico-chiaro":  "Classico Chiaro",
  "classico-scuro":   "Classico Scuro",
  "circo":            "Circo",
  "stalingrado":      "Stalingrado",
  "habana":           "Habana",
  "ho-chi-min":       "Ho Chi Min"
};

let currentThemeIndex = 0;

function applyTheme(index) {
  document.body.className = "theme-" + THEMES[index];
  document.getElementById("theme-label").textContent = THEME_LABELS[THEMES[index]];
  document.getElementById("theme-slider").value = index;
}

// ─── Copy logic ───────────────────────────────────────────────────────────────

let rawIBAN = "";
let copyTimeout;

function doCopy() {
  if (!rawIBAN) return;
  const copyBtn = document.getElementById("copy-btn");
  navigator.clipboard.writeText(rawIBAN).then(() => {
    clearTimeout(copyTimeout);
    copyBtn.classList.add("copied");
    copyBtn.textContent = "✓ Copiato!";
    copyTimeout = setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.textContent = "Copia negli appunti";
    }, 2000);
  }).catch(() => {
    const input = document.getElementById("iban-input");
    input.select();
    document.execCommand("copy");
    copyBtn.textContent = "✓ Copiato!";
    copyTimeout = setTimeout(() => { copyBtn.textContent = "Copia negli appunti"; }, 2000);
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const input   = document.getElementById("iban-input");
  const copyBtn = document.getElementById("copy-btn");
  const genBtn  = document.getElementById("gen-btn");
  const details = document.getElementById("details");
  const slider  = document.getElementById("theme-slider");

  // Slider setup
  slider.min   = 0;
  slider.max   = THEMES.length - 1;
  slider.value = 0;
  applyTheme(0);

  slider.addEventListener("input", () => {
    currentThemeIndex = parseInt(slider.value);
    applyTheme(currentThemeIndex);
  });

  // Generate
  genBtn.addEventListener("click", () => {
    const { iban, abi, cab, checkDigits } = generateIBAN();
    rawIBAN = iban;
    input.value = formatIBAN(iban);
    input.classList.add("has-value");
    copyBtn.classList.add("visible");
    copyBtn.classList.remove("copied");
    copyBtn.textContent = "Copia negli appunti";

    document.getElementById("d-paese").textContent = "IT";
    document.getElementById("d-check").textContent = checkDigits;
    document.getElementById("d-abi").textContent   = abi;
    document.getElementById("d-cab").textContent   = cab;
    details.classList.add("visible");
  });

  // Copy
  copyBtn.addEventListener("click", doCopy);
});
