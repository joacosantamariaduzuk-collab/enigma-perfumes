const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const productosManual = require("./joya_manual.json");

const GANANCIA = 20000;

function detectarCategoria(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("body")) return "body";
  return "perfume";
}

async function scrapear() {
  let productos = [];

  for (const item of productosManual) {
    try {
      console.log("Joyita:", item.url);

      const { data } = await axios.get(item.url);
      const $ = cheerio.load(data);

      const nombre = $("h1").first().text().trim();

      let imagen =
        $('meta[property="og:image"]').attr("content") ||
        $("img").first().attr("src");

      productos.push({
        nombre,
        precio: item.costo + GANANCIA,
        imagen,
        categoria: detectarCategoria(nombre)
      });

    } catch (err) {
      console.log("❌ Error:", item.url);
    }
  }

  fs.writeFileSync("productos_joya.json", JSON.stringify(productos, null, 2));

  console.log("🔥 Joyita:", productos.length);
}

scrapear();