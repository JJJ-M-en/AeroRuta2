// API_URL se define en config.js (cárgalo antes que este archivo)

function mostrarAlerta(tipo, mensaje) {
    const div = document.getElementById('alertas');
    if(!div) return;
    div.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    setTimeout(() => div.innerHTML = '', 4000);
}

async function cargarDestinosSelects() {
    const res = await fetch(`${API_URL}/destinos`);
    const data = await res.json();
    const origen = document.getElementById('origen');
    const destino = document.getElementById('destino');
    if(!origen) return;
    data.forEach(d => {
        origen.innerHTML += `<option value="${d.id_destino}">${d.ciudad}, ${d.pais}</option>`;
        destino.innerHTML += `<option value="${d.id_destino}">${d.ciudad}, ${d.pais}</option>`;
    });
}