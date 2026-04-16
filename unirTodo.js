const fs = require("fs");

const magic = require("./productos.json");
const joya = require("./productos_joya.json");

const todos = [...magic, ...joya];

// 🚫 palabras basura (doble seguridad)
const BLOQUEADOS = [
  "v.v.love",
  "vv",
  "love",
  "tubo",
  "only",
  "onlyyou",
  "onlyou",
  "you",
  "mini ro",
  "perfumero",
  "perfumer",
  "luca",
  "opera"
];

function esBasura(nombre) {
  const n = nombre.toLowerCase();
  return BLOQUEADOS.some(p => n.includes(p));
}

// 🧠 solo perfumes y body splash
function esValido(nombre) {
  const n = nombre.toLowerCase();
  return n.includes("perfume") || n.includes("body");
}

const filtrados = todos.filter(p => {
  if (!p.nombre) return false;
  if (esBasura(p.nombre)) return false;
  if (!esValido(p.nombre)) return false;
  return true;
});

// eliminar duplicados
const unicos = Array.from(
  new Map(filtrados.map(p => [p.nombre, p])).values()
);

fs.writeFileSync("productos_final.json", JSON.stringify(unicos, null, 2));

console.log("🔥 TOTAL LIMPIO:", unicos.length);