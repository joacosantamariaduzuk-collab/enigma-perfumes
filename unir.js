const fs = require("fs");

const p1 = require("./productos.json");   // proveedor Magic
const p2 = require("./productos2.json");  // JOYA manual

const GANANCIA = 20000;

function limpiarNombre(nombre) {
  return nombre
    .toLowerCase()
    .replace(/\d+ml/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const mapa = new Map();

// 👉 proveedor 1
p1.forEach(p => {
  const key = limpiarNombre(p.nombre);

  mapa.set(key, {
    nombre: p.nombre,
    precio: p.precio, // ya viene con ganancia
    imagen: p.imagen
  });
});

// 👉 JOYA (ahora sin ganancia)
p2.forEach(p => {
  const key = limpiarNombre(p.nombre);

  const precioConGanancia = (p.precio || 0) + GANANCIA;

  if (mapa.has(key)) {
    const existente = mapa.get(key);

    if (precioConGanancia < existente.precio) {
      mapa.set(key, {
        nombre: existente.nombre,
        precio: precioConGanancia,
        imagen: existente.imagen
      });
    }
  } else {
    mapa.set(key, {
      nombre: p.nombre,
      precio: precioConGanancia,
      imagen: p.imagen || "https://via.placeholder.com/300x300?text=Perfume"
    });
  }
});

// 👉 filtros
let productos = Array.from(mapa.values());

productos = productos.filter(p => {
  const n = p.nombre.toLowerCase();

if (
  n.includes("kit") ||
  n.includes("crema") ||
  n.includes("perfumero") ||
  n.includes("beauty") ||
  n.includes("diviloo") ||
  n.includes("luca") ||
  n.includes("mystical") ||
  n.includes("v.v. love") ||
  n.includes("vv love")
) return false;

  if (
    !n.includes("perfume") &&
    !n.includes("body splash")
  ) return false;

  return true;
});

fs.writeFileSync("productos_final.json", JSON.stringify(productos, null, 2));

console.log("Productos finales PRO:", productos.length);