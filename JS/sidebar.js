// ─── SIDEBAR: USUARIO DINÁMICO ────────────────────────────────────────────────

function cargarUsuarioSidebar() {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) return;

    const usuario = JSON.parse(sessionData);

    const nombre   = document.getElementById('sidebarNombre');
    const correo   = document.getElementById('sidebarCorreo');
    const rol      = document.getElementById('sidebarRol');

    if (nombre) nombre.textContent = usuario.nombre  || 'Usuario';
    if (correo) correo.textContent = usuario.correo  || '';
    if (rol)    rol.textContent    = usuario.rol     || '';
}

function abrirModalUsuario() {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) return;

    const u = JSON.parse(sessionData);

    document.getElementById('modalNombre').textContent    = u.nombre    || '-';
    document.getElementById('modalRol').textContent       = u.rol       || '-';
    document.getElementById('modalCorreo').textContent    = u.correo    || '-';
    document.getElementById('modalTelefono').textContent  = u.telefono  || '-';
    document.getElementById('modalDocumento').textContent = u.documento || '-';

    // Avatar con inicial del nombre
    const avatar = document.getElementById('modalAvatar');
    if (avatar) avatar.textContent = (u.nombre || 'U')[0].toUpperCase();

    document.getElementById('modalUsuario').classList.add('visible');

}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('visible');}

function cerrarSesion() {
    // Limpiar solo la sesión, no todos los datos del sistema
    localStorage.removeItem('session');
    window.location.href = 'login.html';
}

// Cerrar modal al hacer clic fuera
document.getElementById('modalUsuario').addEventListener('click', function(e) {
    if (e.target === this) cerrarModalUsuario();
});

document.addEventListener('DOMContentLoaded', cargarUsuarioSidebar);