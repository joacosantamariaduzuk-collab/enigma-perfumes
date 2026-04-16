const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.magicgirl.com.ar/perfumeria/page/";
const GANANCIA = 20000;

function limpiarNombre(nombre) {
  return nombre
    .replace(/AF\d+\/AF\d+/g, "")
    .replace(/\d{3,}/g, "")
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
          let nombre = limpiarNombre(json.name || "");
          let nombreLower = nombre.toLowerCase();

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

          // ❌ SOLO perfumes y body splash
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
            nombreLower.includes("10ml") ||
            nombreLower.includes("35ml") ||
            nombreLower.includes("50ml") ||
            nombreLower.includes("beauty") ||
            nombreLower.includes("diviloo") ||
            nombreLower.includes("luca") ||
            nombreLower.includes("asad ml a aa") ||
            nombreLower.includes("vip men are you on the list") ||
            nombreLower.includes("xerjoff opera ml ab-1 12")
          ) {
            return;
          }

          // 💰 PRECIO
          let precioFinal;

          if (nombreLower.includes("xerjoff")) {
            precioFinal = 350000; // precio fijo
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