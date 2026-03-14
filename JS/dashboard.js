// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY    = 'celdas_db';
const ENTRADAS_KEY  = 'registros_entrada';
const RECIENTES_KEY = 'vehiculos_recientes';


// ─── CARDS RESUMEN ────────────────────────────────────────────────────────────

function actualizarCards() {
    const celdas   = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');

    const ocupados    = celdas.filter(c => c.estado === 'ocupado').length;
    const total       = celdas.length;
    const vehiculosHoy = entradas.filter(r => {
        const hoy = new Date().toISOString().split('T')[0];
        return r.fecha === hoy;
    }).length;

    // Espacios ocupados
    const cardEspacios = document.querySelector('.card:nth-child(1) .big');
    if (cardEspacios) cardEspacios.textContent = `${ocupados}/${total}`;

    // Barra de progreso
    const fill = document.querySelector('.fill');
    if (fill && total > 0) {
        fill.style.width = Math.round((ocupados / total) * 100) + '%';
    }

    // Vehículos hoy
    const cardVehiculos = document.querySelector('.card:nth-child(2) .big');
    if (cardVehiculos) cardVehiculos.textContent = vehiculosHoy;
}


// ─── TABLA DE VEHÍCULOS RECIENTES ─────────────────────────────────────────────

function etiquetaModalidad(modalidad) {
    if (modalidad === 'hora')    return 'Por hora';
    if (modalidad === 'dia')     return 'Por día';
    if (modalidad === 'mensual') return 'Mensual';
    return modalidad || '-';
}

function cargarRecientes() {
    const tabla = document.getElementById('tablaVehiculos');
    if (!tabla) return;

    const ahora    = Date.now();
    const datos    = JSON.parse(localStorage.getItem(RECIENTES_KEY) || '[]');

    // Filtrar los que no han expirado
    const validos  = datos.filter(r => r.expira > ahora);

    // Actualizar localStorage eliminando los expirados
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(validos));

    tabla.innerHTML = '';

    if (validos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align:center;color:#999;padding:20px">
            No hay vehículos recientes (últimos 5 minutos)
        </td>`;
        tabla.appendChild(tr);
        return;
    }

    validos.forEach(r => {
        const minutosRestantes = Math.ceil((r.expira - ahora) / 60000);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.placa}</td>
            <td>${r.espacio}</td>
            <td>${r.hora}</td>
            <td>${r.tipo}</td>
            <td>
                <span class="estado">${etiquetaModalidad(r.modalidad)}</span>
                <span style="font-size:11px;color:#999;margin-left:6px">${minutosRestantes}min</span>
            </td>
        `;
        tabla.appendChild(tr);
    });
}


// ─── NAVEGACIÓN DE ACCIONES RÁPIDAS ──────────────────────────────────────────

function configurarBotones() {
    const btnBlue   = document.querySelector('.btn.blue');
    const btnOrange = document.querySelector('.btn.orange');
    const btnGreen  = document.querySelector('.btn.green');
    const btnPurple = document.querySelector('.btn.purple');

    if (btnBlue)   btnBlue.onclick   = () => window.location.href = 'entrada.html';
    if (btnOrange) btnOrange.onclick = () => window.location.href = 'registrarsalida.html';
    if (btnGreen)  btnGreen.onclick  = () => window.location.href = 'espacios.html';
    if (btnPurple) btnPurple.onclick = () => window.location.href = 'reportes.html';
}


// ─── INICIO ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    actualizarCards();
    cargarRecientes();
    configurarBotones();

    // Actualizar la tabla cada 30 segundos para reflejar expiración
    setInterval(() => {
        cargarRecientes();
        actualizarCards();
    }, 30000);
});
