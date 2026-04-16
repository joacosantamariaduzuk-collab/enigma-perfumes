const express = require("express");
const app = express();

const productos = require("./productos_final.json");

app.get("/", (req, res) => {

  let html = `
  <html>
  <head>
    <title>Enigma Perfumes</title>
    <style>
      body {
        font-family: Arial;
        background: #111;
        color: white;
        text-align: center;
      }

      h1 {
        margin: 20px;
      }

      #buscador {
        width: 80%;
        max-width: 400px;
        padding: 10px;
        margin-bottom: 20px;
        font-size: 16px;
        border-radius: 5px;
        border: none;
      }

      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }

      .card {
        background: #1e1e1e;
        border-radius: 10px;
        margin: 10px;
        padding: 15px;
        width: 220px;
      }

      img {
        width: 100%;
        border-radius: 10px;
      }

      .precio {
        font-size: 20px;
        color: #00ff88;
        margin: 10px 0;
      }

      a {
        display: inline-block;
        padding: 8px 12px;
        background: #25D366;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>

  <h1>🔥 Enigma Perfumes 🔥</h1>

  <input type="text" id="buscador" placeholder="Buscar perfume...">

  <div class="grid">
  `;

  productos.forEach(p => {
    const link = "https://wa.me/541128450788?text=Hola quiero el " + p.nombre;

    html += `
      <div class="card">
        <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'">
        <p class="nombre">${p.nombre}</p>
        <div class="precio">$${p.precio}</div>
        <a href="${link}" target="_blank">Comprar</a>
      </div>
    `;
  });

  html += `
  </div>

  <script>
    const input = document.getElementById("buscador");

    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();

      document.querySelectorAll(".card").forEach((prod) => {
        const nombre = prod.querySelector(".nombre").textContent.toLowerCase();
        prod.style.display = nombre.includes(texto) ? "block" : "none";
      });
    });
  </script>

  </body>
  </html>
  `;

  res.send(html);
});

app.listen(3000, () => {
  console.log("🚀 Web en http://localhost:3000");
});