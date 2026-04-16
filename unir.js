const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");

let productos = [];
let filtroActual = "todos"; // perfumes | bodysplash | todos

fetch("/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderProductos(productos);
  });

function crearMenu() {
  const menu = document.createElement("div");
  menu.style.display = "flex";
  menu.style.justifyContent = "center";
  menu.style.gap = "10px";
  menu.style.margin = "20px";

  const btnTodos = crearBoton("Todos", "todos");
  const btnPerfumes = crearBoton("Perfumes", "perfume");
  const btnBody = crearBoton("Body Splash", "body");

  menu.appendChild(btnTodos);
  menu.appendChild(btnPerfumes);
  menu.appendChild(btnBody);

  contenedor.parentNode.insertBefore(menu, contenedor);
}

function crearBoton(texto, filtro) {
  const btn = document.createElement("button");
  btn.innerText = texto;

  btn.style.padding = "10px 15px";
  btn.style.border = "none";
  btn.style.borderRadius = "8px";
  btn.style.cursor = "pointer";
  btn.style.background = "#222";
  btn.style.color = "#fff";

  btn.onclick = () => {
    filtroActual = filtro;
    aplicarFiltros();
  };

  return btn;
}

function aplicarFiltros() {
  let filtrados = productos;

  // filtro por categoría
  if (filtroActual === "perfume") {
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes("perfume")
    );
  }

  if (filtroActual === "body") {
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes("body splash")
    );
  }

  // filtro por búsqueda
  const texto = buscador.value.toLowerCase();
  filtrados = filtrados.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  renderProductos(filtrados);
}

buscador.addEventListener("input", aplicarFiltros);

function renderProductos(lista) {
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" />
      <h3>${p.nombre}</h3>
      <p>$${p.precio}</p>
      <button onclick="comprar('${p.nombre}')">Comprar</button>
    `;

    contenedor.appendChild(card);
  });
}

// función de compra (si ya la tenías, dejala igual)
function comprar(nombre) {
  const mensaje = `Hola, quiero comprar: ${nombre}`;
  const url = `https://wa.me/TUNUMERO?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// crear menú al iniciar
crearMenu();