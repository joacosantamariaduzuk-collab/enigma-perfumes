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

      #buscador {
        width: 80%;
        max-width: 400px;
        padding: 10px;
        margin: 20px;
      }

      .menu button {
        padding: 10px;
        margin: 5px;
        background: #222;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }

      .card {
        background: #1e1e1e;
        margin: 10px;
        padding: 15px;
        width: 220px;
        border-radius: 10px;
      }

      img { width: 100%; border-radius: 10px; }

      .precio { color: #00ff88; font-size: 20px; }
    </style>
  </head>
  <body>

  <h1>🔥 Enigma Perfumes 🔥</h1>

  <input id="buscador" placeholder="Buscar...">

  <div class="menu">
    <button onclick="filtrar('todos')">Todos</button>
    <button onclick="filtrar('perfume')">Perfumes</button>
    <button onclick="filtrar('body')">Body Splash</button>
  </div>

  <div class="grid">
  `;

  productos.forEach(p => {
    const link = "https://wa.me/541128450788?text=Hola quiero el " + p.nombre;

    html += `
      <div class="card" data-cat="${p.categoria}">
        <img src="${p.imagen}">
        <p class="nombre">${p.nombre}</p>
        <div class="precio">$${p.precio}</div>
        <a href="${link}" target="_blank">Comprar</a>
      </div>
    `;
  });

  html += `
  </div>

  <script>
    let filtroActual = "todos";

    function filtrar(tipo) {
      filtroActual = tipo;
      aplicar();
    }

    document.getElementById("buscador").addEventListener("input", aplicar);

    function aplicar() {
      const texto = document.getElementById("buscador").value.toLowerCase();

      document.querySelectorAll(".card").forEach(card => {
        const nombre = card.querySelector(".nombre").textContent.toLowerCase();
        const cat = card.dataset.cat;

        let visible = true;

        if (!nombre.includes(texto)) visible = false;

        if (filtroActual !== "todos" && cat !== filtroActual) {
          visible = false;
        }

        card.style.display = visible ? "block" : "none";
      });
    }
  </script>

  </body>
  </html>
  `;

  res.send(html);
});

app.listen(3000, () => {
  console.log("🚀 http://localhost:3000");
});