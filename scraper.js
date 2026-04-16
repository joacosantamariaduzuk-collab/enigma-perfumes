const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.magicgirl.com.ar/perfumeria/page/";
const GANANCIA = 20000;

const BLOQUEADOS = [
  "v.v.love","vv","love","tubo","only","onlyyou","onlyou","you",
  "mini ro","perfumero","perfumer","luca","opera",
  "mystical","diviloo","carnival"
];

const BLOQUEADOS_EXACTOS = [
  "PERFUME ASAD 100ML 7320A AA6923429173206"
];

const PERMITIDOS_U = [
  "ZAAFARAN",
  "AMEER AL OUDH",
  "AJWAD"
];

function limpiarNombre(nombre) {
  return nombre
    // eliminar ($15000/U)
    .replace(/\(\$.*?\/U\)/gi, "")

    // eliminar caracteres raros
    .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, " ")

    // eliminar códigos tipo AB058-21, B811-2, etc
    .replace(/\b[A-Z]+\d*-?\d+\b/g, "")

    // eliminar "NO 792" o similares
    .replace(/\bNO\s*\d+\b/gi, "")

    // eliminar números largos
    .replace(/\d{5,}/g, "")

    // 🔥 eliminar números sueltos cortos (1-4 dígitos) que quedan
    .replace(/\b\d{1,4}\b/g, "")

    // limpiar espacios
    .replace(/\s+/g, " ")
    .trim();
}

function esBasura(nombre) {
  const n = nombre.toLowerCase();
  return BLOQUEADOS.some(p => n.includes(p));
}

function esPermitidoU(nombre) {
  return PERMITIDOS_U.some(p => nombre.toUpperCase().includes(p));
}

function detectarCategoria(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("body splash")) return "body";
  if (n.includes("perfume")) return "perfume";
  return null;
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
        if (json["@type"] !== "Product") return;

        let nombreOriginal = (json.name || "").trim();

        if (BLOQUEADOS_EXACTOS.includes(nombreOriginal)) return;

        if (nombreOriginal.includes("/U") && !esPermitidoU(nombreOriginal)) return;

        if (esBasura(nombreOriginal)) return;

        const categoria = detectarCategoria(nombreOriginal);
        if (!categoria) return;

        let precioBase = Number(json.offers?.price || 0);
        if (!precioBase) return;

        let precioFinal =
          nombreOriginal.toLowerCase().includes("xerjoff")
            ? 350000
            : precioBase + GANANCIA;

        let nombre = limpiarNombre(nombreOriginal);

        productos.push({
          nombre,
          precio: precioFinal,
          imagen:
            json.image ||
            "https://via.placeholder.com/300x300?text=Perfume",
          categoria
        });

      } catch (e) {}
    });
  }

  const unicos = Array.from(
    new Map(productos.map(p => [p.nombre, p])).values()
  );

  fs.writeFileSync("productos.json", JSON.stringify(unicos, null, 2));

  console.log("🔥 Productos finales:", unicos.length);
}

scrapear();