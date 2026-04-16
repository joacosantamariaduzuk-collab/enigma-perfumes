const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const productosManual = require("./joya_manual.json");

async function scrapear() {
  let productos = [];

  for (const item of productosManual) {
    try {
      console.log("Procesando:", item.url);

      const { data } = await axios.get(item.url);
      const $ = cheerio.load(data);

      // 🧠 nombre
      const nombre = $("h1").first().text().trim();

      // 🖼️ imagen (mejorado)
      let imagen =
        $('meta[property="og:image"]').attr("content") ||
        $("img").first().attr("src") ||
        null;

      // 💰 precio = SOLO costo
      const precio = item.costo;

      productos.push({
        nombre,
        precio,
        imagen
      });

    } catch (err) {
      console.log("❌ Error con:", item.url);
    }
  }

  fs.writeFileSync("productos2.json", JSON.stringify(productos, null, 2));

  console.log("Productos JOYA manual:", productos.length);
}

scrapear();