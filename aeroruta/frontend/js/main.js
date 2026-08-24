document.addEventListener('DOMContentLoaded', cargarDestinosSelects);

async function buscarServicios() {
    const origen = document.getElementById('origen').value;
    const destino = document.getElementById('destino').value;
    const fecha = document.getElementById('fecha').value;
    const pasajeros = document.getElementById('pasajeros').value;
    const cont = document.getElementById('resultados');

    if(!origen || !destino) { alert('Selecciona origen y destino'); return; }

    cont.innerHTML = '<p style="text-align:center;color:white">Buscando...</p>';

    const params = new URLSearchParams({origen, destino});
    if(fecha) params.append('fecha', fecha);

    const res = await fetch(`${API_URL}/servicios?${params}`);
    const data = await res.json();

    if(!data.length) {
        cont.innerHTML = '<div class="card" style="text-align:center"><p>No se encontraron servicios para esta ruta.</p></div>';
        return;
    }

    cont.innerHTML = '<h2 style="color:white;margin-bottom:1rem">Resultados</h2>' + data.map(s => `
        <div class="service-card" style="margin-bottom:1rem">
            <div class="service-route">
                <div class="origin"><div class="city">${s.origen_ciudad}</div></div>
                <div class="arrow">→</div>
                <div class="destiny"><div class="city">${s.destino_ciudad}</div></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                <span>📅 ${s.fecha.split('T')[0]}</span>
                <span>🕐 ${s.hora_salida} - ${s.hora_llegada}</span>
                <span>⏱️ ${s.duracion}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:1rem;border-top:1px solid #f3f4f6">
                <div>
                    <div class="service-price">$${parseFloat(s.precio).toLocaleString()}</div>
                    <small style="color:var(--gray)">${s.asientos_disponibles} asientos disponibles</small>
                </div>
                <a href="reserva.html?servicio=${s.id_servicio}&pasajeros=${pasajeros}" class="btn btn-primary">Reservar</a>
            </div>
        </div>
    `).join('');
}