const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.magicgirl.com.ar/perfumeria/page/";
const GANANCIA = 20000;

// ❌ LISTA NEGRA EXACTA
const BLOQUEADOS_EXACTOS = [
  "PERFUME XERJOFF OPERA",
  "U PERFUMER COLOR",
  "PERFUME ASAD A",
  "U PERFUME YARA CANDY L",
  "U PERFUME YARA MOI L",
  "U PERFUME ASAD NEGRO B",
  "PERFUME CLUB CARNIVAL INTENSE WOMEN NOL",
  "U PERFUME YARA TOUS B",
  "U PERFUME YARA TOUS L",
  "U PERFUME AMEERAT AL ARAB B",
  "U PERFUME LATTAFA ASAD NEGRO L",
  "U PERFUME KHAMRAH B",
  "U PERFUME LATTAFA ASAD AZUL L"
];

// ✅ EXCEPCIONES PERMITIDAS
const PERMITIDOS_U = [
  "U PERFUME ZAAFARAN MGB",
  "U PERFUME AMEER AL OUDH INTENSE OUD",
  "U PERFUME AJWAD LATTAFA"
];

function limpiarNombre(nombre) {
  return nombre
    // eliminar códigos tipo AA--11, MG-123, etc
    .replace(/\b[A-Z]{2,}[-–—]?\d+\b/g, "")

    // eliminar caracteres raros (chinos, símbolos, etc)
    .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, "")

    // eliminar números
    .replace(/\d+/g, "")

    // eliminar ML
    .replace(/\bML\b/gi, "")

    // espacios
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapear() {
  let productos = [];

  for (let page = 1; page <= 8; page++) {
    const url =
      page === 1
        ? "https://www.magicgirl.com.ar/perfumeria/"
        : BASE_URL + page;

    console.log("Scrapeando:", url);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $("script[type='application/ld+json']").each((i, el) => {
      try {
        const json = JSON.parse($(el).html());

        if (json["@type"] === "Product") {
          let nombreOriginal = (json.name || "").trim();
          let nombre = limpiarNombre(nombreOriginal);
          let nombreLower = nombre.toLowerCase();

          // ❌ eliminar exactos
          if (BLOQUEADOS_EXACTOS.includes(nombreOriginal.trim())) {
            return;
          }

          // ❌ eliminar "tubo"
          if (nombreLower.includes("tubo")) {
            return;
          }

          // ❌ eliminar todos los U PERFUME excepto permitidos
          if (
            nombreOriginal.startsWith("U PERFUME") &&
            !PERMITIDOS_U.includes(nombreOriginal.trim())
          ) {
            return;
          }

          let precioBase = 0;

          if (json.offers && json.offers.price) {
            precioBase = Number(json.offers.price);
          } else {
            const match = (json.description || "").match(/\$(\d[\d.,]+)/);
            if (match) {
              precioBase = Number(match[1].replace(/\./g, ""));
            }
          }

          if (!precioBase) return;

          // ❌ SOLO perfumes
          if (
            !nombreLower.includes("perfume") &&
            !nombreLower.includes("body splash")
          ) {
            return;
          }

          // ❌ FILTROS GENERALES
          if (
            nombreLower.includes("kit") ||
            nombreLower.includes("crema") ||
            nombreLower.includes("cream") ||
            nombreLower.includes("perfumero") ||
            nombreLower.includes("macaron") ||
            nombreLower.includes("v.v.love") ||
            nombreLower.includes("beauty") ||
            nombreLower.includes("diviloo") ||
            nombreLower.includes("luca")
          ) {
            return;
          }

          // 💰 PRECIO
          let precioFinal;

          if (nombreLower.includes("xerjoff")) {
            precioFinal = 350000;
          } else {
            precioFinal = precioBase + GANANCIA;
          }

          productos.push({
            nombre,
            precio: precioFinal,
            imagen:
              json.image ||
              `https://source.unsplash.com/300x300/?perfume`,
          });
        }
      } catch (e) {}
    });
  }

  // eliminar duplicados
  const unicos = Array.from(
    new Map(productos.map((p) => [p.nombre, p])).values()
  );

  fs.writeFileSync("productos.json", JSON.stringify(unicos, null, 2));

  console.log("Productos finales:", unicos.length);
}

scrapear();