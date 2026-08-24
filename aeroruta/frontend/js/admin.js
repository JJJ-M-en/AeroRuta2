const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('usuario') || '{}');
if(!token || user.rol !== 'Administrador') location.href = 'login.html';

function mostrarSeccion(id) {
    ['dashboard','usuarios','rutas','servicios','reservas','destinos'].forEach(s => {
        document.getElementById('seccion-'+s).style.display = s===id ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    if(id==='dashboard') cargarDashboard();
    if(id==='usuarios') cargarUsuarios();
    if(id==='rutas') cargarRutas();
    if(id==='servicios') cargarServiciosAdmin();
    if(id==='reservas') cargarReservasAdmin();
    if(id==='destinos') cargarDestinosAdmin();
}

async function cargarDashboard() {
    const res = await fetch(`${API_URL}/dashboard/estadisticas`, { headers: { 'Authorization': 'Bearer '+token } });
    const data = await res.json();
    document.getElementById('stats-container').innerHTML = `
        <div class="stat-card"><div class="stat-value">${data.totales.clientes}</div><div class="stat-label">Clientes</div></div>
        <div class="stat-card"><div class="stat-value">${data.totales.reservas}</div><div class="stat-label">Reservas</div></div>
        <div class="stat-card"><div class="stat-value">$${parseFloat(data.totales.ventas).toLocaleString()}</div><div class="stat-label">Ventas</div></div>
        <div class="stat-card"><div class="stat-value">${data.totales.servicios}</div><div class="stat-label">Servicios</div></div>
    `;
    document.getElementById('chart-reservas').innerHTML = data.reservasPorMes.map(r => `<div>${r.mes}: ${r.total} reservas</div>`).join('');
    document.getElementById('chart-destinos').innerHTML = data.destinosTop.map(d => `<div>${d.ciudad}: ${d.total}</div>`).join('');
}

async function cargarUsuarios() {
    const res = await fetch(`${API_URL}/usuarios`, { headers: { 'Authorization': 'Bearer '+token } });
    const data = await res.json();
    document.getElementById('tabla-usuarios').innerHTML = data.map(u => `
        <tr>
            <td>${u.nombre} ${u.apellido}</td>
            <td>${u.correo}</td>
            <td>${u.rol}</td>
            <td><span class="badge badge-${u.estado?'success':'danger'}">${u.estado?'Activo':'Inactivo'}</span></td>
            <td><button class="btn btn-sm btn-warning" onclick="cambiarEstadoUsuario(${u.id_usuario},${u.estado?0:1})">${u.estado?'Desactivar':'Activar'}</button></td>
        </tr>
    `).join('');
}

async function cambiarEstadoUsuario(id, estado) {
    await fetch(`${API_URL}/usuarios/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify({estado})
    });
    cargarUsuarios();
}

async function cargarRutas() {
    const res = await fetch(`${API_URL}/rutas`, { headers: { 'Authorization': 'Bearer '+token } });
    const data = await res.json();
    document.getElementById('tabla-rutas').innerHTML = data.map(r => `
        <tr><td>${r.origen_ciudad}</td><td>${r.destino_ciudad}</td><td>${r.duracion}</td><td>${r.distancia}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarRuta(${r.id_ruta})">Eliminar</button></td></tr>
    `).join('');
}

async function cargarServiciosAdmin() {
    const res = await fetch(`${API_URL}/servicios`, { headers: { 'Authorization': 'Bearer '+token } });
    const data = await res.json();
    document.getElementById('tabla-servicios').innerHTML = data.map(s => `
        <tr><td>${s.origen_ciudad} → ${s.destino_ciudad}</td><td>${s.fecha.split('T')[0]}</td><td>${s.hora_salida}</td><td>${s.hora_llegada}</td>
        <td>$${parseFloat(s.precio).toLocaleString()}</td><td>${s.capacidad}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarServicio(${s.id_servicio})">Eliminar</button></td></tr>
    `).join('');
}

async function cargarReservasAdmin() {
    const res = await fetch(`${API_URL}/reservas`, { headers: { 'Authorization': 'Bearer '+token } });
    const data = await res.json();
    document.getElementById('tabla-reservas-admin').innerHTML = data.map(r => `
        <tr><td>${r.codigo_reserva}</td><td>${r.nombre} ${r.apellido}</td><td>${r.origen} → ${r.destino}</td>
        <td>${r.fecha.split('T')[0]}</td><td>$${parseFloat(r.valor_total).toLocaleString()}</td>
        <td><span class="badge badge-${r.estado==='pagada'?'success':r.estado==='pendiente'?'warning':'danger'}">${r.estado}</span></td>
        <td><button class="btn btn-sm btn-primary" onclick="verReserva(${r.id_reserva})">Ver</button></td></tr>
    `).join('');
}

async function cargarDestinosAdmin() {
    const res = await fetch(`${API_URL}/destinos`);
    const data = await res.json();
    document.getElementById('tabla-destinos').innerHTML = data.map(d => `
        <tr><td>${d.ciudad}</td><td>${d.pais}</td><td>${d.descripcion||'-'}</td>
        <td><span class="badge badge-${d.estado?'success':'danger'}">${d.estado?'Activo':'Inactivo'}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarDestino(${d.id_destino})">Eliminar</button></td></tr>
    `).join('');
}

async function eliminarRuta(id) { if(confirm('¿Eliminar ruta?')) { await fetch(`${API_URL}/rutas/${id}`, {method:'DELETE', headers:{'Authorization':'Bearer '+token}}); cargarRutas(); }}
async function eliminarServicio(id) { if(confirm('¿Eliminar servicio?')) { await fetch(`${API_URL}/servicios/${id}`, {method:'DELETE', headers:{'Authorization':'Bearer '+token}}); cargarServiciosAdmin(); }}
async function eliminarDestino(id) { if(confirm('¿Eliminar destino?')) { await fetch(`${API_URL}/destinos/${id}`, {method:'DELETE', headers:{'Authorization':'Bearer '+token}}); cargarDestinosAdmin(); }}

function logout() { localStorage.clear(); location.href='index.html'; }

// ---------- Modales ----------

function abrirModal(id) { document.getElementById(id).classList.add('active'); }
function cerrarModal(id) {
    document.getElementById(id).classList.remove('active');
    const alerta = document.getElementById('alertas-'+id);
    if(alerta) alerta.innerHTML = '';
}

function alertaModal(id, tipo, mensaje) {
    const div = document.getElementById('alertas-'+id);
    if(div) div.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
}

// ----- Usuario -----
function abrirModalUsuario() {
    ['u-nombre','u-apellido','u-documento','u-correo','u-telefono','u-password'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('u-rol').value = '3';
    abrirModal('modal-usuario');
}

async function guardarUsuario() {
    const body = {
        nombre: document.getElementById('u-nombre').value,
        apellido: document.getElementById('u-apellido').value,
        documento: document.getElementById('u-documento').value,
        correo: document.getElementById('u-correo').value,
        telefono: document.getElementById('u-telefono').value,
        password: document.getElementById('u-password').value,
        id_rol: parseInt(document.getElementById('u-rol').value)
    };
    if(!body.nombre || !body.apellido || !body.documento || !body.correo || !body.password) {
        alertaModal('modal-usuario', 'danger', 'Completa todos los campos obligatorios');
        return;
    }
    const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if(res.ok) {
        cerrarModal('modal-usuario');
        cargarUsuarios();
    } else {
        alertaModal('modal-usuario', 'danger', data.mensaje || 'Error al crear usuario');
    }
}

// ----- Destino -----
function abrirModalDestino() {
    ['d-ciudad','d-pais','d-descripcion','d-imagen'].forEach(id => document.getElementById(id).value = '');
    abrirModal('modal-destino');
}

async function guardarDestino() {
    const body = {
        ciudad: document.getElementById('d-ciudad').value,
        pais: document.getElementById('d-pais').value,
        descripcion: document.getElementById('d-descripcion').value,
        imagen: document.getElementById('d-imagen').value
    };
    if(!body.ciudad || !body.pais) {
        alertaModal('modal-destino', 'danger', 'Ciudad y país son obligatorios');
        return;
    }
    const res = await fetch(`${API_URL}/destinos`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if(res.ok) {
        cerrarModal('modal-destino');
        cargarDestinosAdmin();
    } else {
        alertaModal('modal-destino', 'danger', data.mensaje || 'Error al crear destino');
    }
}

// ----- Ruta -----
async function abrirModalRuta() {
    const res = await fetch(`${API_URL}/destinos`);
    const destinos = await res.json();
    const opciones = destinos.map(d => `<option value="${d.id_destino}">${d.ciudad}, ${d.pais}</option>`).join('');
    document.getElementById('r-origen').innerHTML = opciones;
    document.getElementById('r-destino').innerHTML = opciones;
    document.getElementById('r-duracion').value = '';
    document.getElementById('r-distancia').value = '';
    abrirModal('modal-ruta');
}

async function guardarRuta() {
    const body = {
        origen: parseInt(document.getElementById('r-origen').value),
        destino: parseInt(document.getElementById('r-destino').value),
        duracion: document.getElementById('r-duracion').value,
        distancia: document.getElementById('r-distancia').value
    };
    if(body.origen === body.destino) {
        alertaModal('modal-ruta', 'danger', 'El origen y el destino no pueden ser iguales');
        return;
    }
    const res = await fetch(`${API_URL}/rutas`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if(res.ok) {
        cerrarModal('modal-ruta');
        cargarRutas();
    } else {
        alertaModal('modal-ruta', 'danger', data.mensaje || 'Error al crear ruta');
    }
}

// ----- Servicio -----
async function abrirModalServicio() {
    const res = await fetch(`${API_URL}/rutas`);
    const rutas = await res.json();
    document.getElementById('s-ruta').innerHTML = rutas.map(r =>
        `<option value="${r.id_ruta}">${r.origen_ciudad} → ${r.destino_ciudad} (${r.duracion})</option>`
    ).join('');
    ['s-fecha','s-hora-salida','s-hora-llegada','s-precio'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('s-capacidad').value = 20;
    abrirModal('modal-servicio');
}

async function guardarServicio() {
    const body = {
        id_ruta: parseInt(document.getElementById('s-ruta').value),
        fecha: document.getElementById('s-fecha').value,
        hora_salida: document.getElementById('s-hora-salida').value,
        hora_llegada: document.getElementById('s-hora-llegada').value,
        precio: parseFloat(document.getElementById('s-precio').value),
        capacidad: parseInt(document.getElementById('s-capacidad').value)
    };
    if(!body.fecha || !body.hora_salida || !body.hora_llegada || !body.precio || !body.capacidad) {
        alertaModal('modal-servicio', 'danger', 'Completa todos los campos');
        return;
    }
    const res = await fetch(`${API_URL}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if(res.ok) {
        cerrarModal('modal-servicio');
        cargarServiciosAdmin();
    } else {
        alertaModal('modal-servicio', 'danger', data.mensaje || 'Error al crear servicio');
    }
}

// ----- Ver Reserva -----
async function verReserva(id) {
    const res = await fetch(`${API_URL}/reservas/${id}`, { headers: { 'Authorization': 'Bearer '+token } });
    const r = await res.json();
    if(!res.ok) { alert(r.mensaje || 'No se pudo cargar la reserva'); return; }

    const pasajerosHtml = r.pasajeros.map(p => `
        <li>${p.nombre} ${p.apellido} — Doc: ${p.documento}</li>
    `).join('');

    const pagosHtml = r.pagos.length
        ? r.pagos.map(p => `<li>${p.metodo_pago} — $${parseFloat(p.valor).toLocaleString()} — <span class="badge badge-${p.estado==='pagado'?'success':p.estado==='pendiente'?'warning':'danger'}">${p.estado}</span></li>`).join('')
        : '<li>Sin pagos registrados</li>';

    document.getElementById('detalle-reserva').innerHTML = `
        <div class="comprobante">
            <div class="comprobante-row"><span class="comprobante-label">Código:</span><span class="comprobante-value">${r.codigo_reserva}</span></div>
            <div class="comprobante-row"><span class="comprobante-label">Cliente:</span><span class="comprobante-value">${r.nombre} ${r.apellido} (${r.correo})</span></div>
            <div class="comprobante-row"><span class="comprobante-label">Ruta:</span><span class="comprobante-value">${r.origen} → ${r.destino}</span></div>
            <div class="comprobante-row"><span class="comprobante-label">Fecha:</span><span class="comprobante-value">${r.fecha.split('T')[0]} | ${r.hora_salida} - ${r.hora_llegada}</span></div>
            <div class="comprobante-row"><span class="comprobante-label">Estado:</span><span class="comprobante-value">${r.estado}</span></div>
            <div class="comprobante-total"><span>TOTAL</span><span>$${parseFloat(r.valor_total).toLocaleString()}</span></div>
        </div>
        <h4 style="margin-top:1rem">Pasajeros</h4>
        <ul>${pasajerosHtml}</ul>
        <h4 style="margin-top:1rem">Pagos</h4>
        <ul>${pagosHtml}</ul>
        <div style="display:flex;gap:0.5rem;margin-top:1rem">
            <button class="btn btn-sm btn-success" onclick="cambiarEstadoReserva(${r.id_reserva},'pagada')">Marcar pagada</button>
            <button class="btn btn-sm btn-warning" onclick="cambiarEstadoReserva(${r.id_reserva},'confirmada')">Confirmar</button>
            <button class="btn btn-sm btn-danger" onclick="cambiarEstadoReserva(${r.id_reserva},'cancelada')">Cancelar</button>
        </div>
    `;
    abrirModal('modal-reserva');
}

async function cambiarEstadoReserva(id, estado) {
    await fetch(`${API_URL}/reservas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
        body: JSON.stringify({estado})
    });
    verReserva(id);
    cargarReservasAdmin();
}

cargarDashboard();