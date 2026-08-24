async function login() {
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({correo, password})
    });
    const data = await res.json();

    if(res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        if(data.usuario.rol === 'Administrador') location.href = 'dashboard.html';
        else location.href = 'cliente.html';
    } else {
        mostrarAlerta('danger', data.mensaje);
    }
}

async function registro() {
    const body = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        documento: document.getElementById('documento').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        password: document.getElementById('password').value
    };

    const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json();

    if(res.ok) {
        mostrarAlerta('success', 'Registro exitoso. Redirigiendo...');
        setTimeout(() => location.href = 'login.html', 1500);
    } else {
        mostrarAlerta('danger', data.mensaje);
    }
}

function logout() {
    localStorage.clear();
    location.href = 'index.html';
}

// Verificar sesión en navbar
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
if(token && document.getElementById('link-login')) {
    document.getElementById('link-login').style.display = 'none';
    document.getElementById('link-registro').style.display = 'none';
    document.getElementById('link-cuenta').style.display = 'inline';
    document.getElementById('btn-logout').style.display = 'inline';
    if(usuario.rol === 'Administrador') {
        document.getElementById('link-admin').style.display = 'inline';
        document.getElementById('link-admin').href = 'dashboard.html';
    }
    document.getElementById('link-cuenta').href = usuario.rol === 'Administrador' ? 'dashboard.html' : 'cliente.html';
}