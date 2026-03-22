// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY = 'celdas_db';
const ENTRADAS_KEY = 'registros_entrada';
const RECIENTES_KEY = 'vehiculos_recientes';


// ─── FECHA LOCAL  ────────────────────────────────────────────────────

function fechaLocalISO(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function horaLocalHHMM(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
}

// Muestra "18/03/2026 9:32pm"
function formatearMostrar(fechaISO, horaHHMM) {
    const [yy, mm, dd] = fechaISO.split('-');
    const [hh, mi] = horaHHMM.split(':');
    const h = parseInt(hh);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${dd}/${mm}/${yy} ${h12}:${mi}${ampm}`;
}


// ─── CARDS RESUMEN ────────────────────────────────────────────────────────────

function formatearPesos(valor) {
    return '$' + valor.toLocaleString('es-CO');
}

function actualizarCards() {
    const celdas = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const salidas = JSON.parse(localStorage.getItem('registros_salida') || '[]');

    const ocupados = celdas.filter(c => c.estado === 'ocupado').length;
    const total = celdas.length;
    const hoy = fechaLocalISO(new Date());

    // Vehículos que entraron hoy
    const vehiculosHoy = entradas.filter(r => r.fecha === hoy).length;

    // Ingresos del día: suma de totalCobrado de salidas registradas hoy
    const ingresosHoy = salidas
        .filter(r => r.fechaSalida === hoy)
        .reduce((acc, r) => acc + (r.totalCobrado || 0), 0);

    // Card 1 — Espacios ocupados
    const cardEspacios = document.querySelector('.card:nth-child(1) .big');
    if (cardEspacios) cardEspacios.textContent = `${ocupados}/${total}`;

    const fill = document.querySelector('.fill');
    if (fill && total > 0) {
        fill.style.width = Math.round((ocupados / total) * 100) + '%';
    }

    // Card 2 — Vehículos hoy
    const cardVehiculos = document.querySelector('.card:nth-child(2) .big');
    if (cardVehiculos) cardVehiculos.textContent = vehiculosHoy;

    // Card 3 — Ingresos hoy
    const cardIngresos = document.querySelector('.card:nth-child(3) .big');
    if (cardIngresos) cardIngresos.textContent = formatearPesos(ingresosHoy);

    // Card 4 — Alertas: celdas en mantenimiento
    const celdасMantenimiento = celdas.filter(c => c.estado === 'mantenimiento');
    const cardAlertas = document.querySelector('.card.alert .big');
    if (cardAlertas) cardAlertas.textContent = celdасMantenimiento.length;
}

function actualizarAlertas() {
    const celdas = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const lista  = document.getElementById('listaAlertas');
    if (!lista) return;

    const enMantenimiento = celdas.filter(c => c.estado === 'mantenimiento');

    if (enMantenimiento.length === 0) {
        lista.innerHTML = '<li>Sin alertas activas</li>';
        return;
    }

    lista.innerHTML = enMantenimiento
        .map(c => `<li>Celda ${c.numero} (Zona ${c.zona}) en mantenimiento</li>`)
        .join('');
}

// ─── TABLA DE VEHÍCULOS RECIENTES ─────────────────────────────────────────────

function etiquetaModalidad(modalidad) {
    if (modalidad === 'hora') return 'Por hora';
    if (modalidad === 'dia') return 'Por día';
    if (modalidad === 'mensual') return 'Mensual';
    return modalidad || '-';
}

function cargarRecientes() {
    const tabla = document.getElementById('tablaVehiculos');
    if (!tabla) return;

    const ahora = Date.now();
    const datos = JSON.parse(localStorage.getItem(RECIENTES_KEY) || '[]');
    const validos = datos.filter(r => r.expira > ahora);

    // Limpiar expirados del localStorage
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
            <td>${formatearMostrar(r.fecha, r.hora)}</td>
            <td>${r.tipo}</td>
            <td>
                <span class="estado">${etiquetaModalidad(r.modalidad)}</span>
                <span style="font-size:11px;color:#999;margin-left:6px">${minutosRestantes}min</span>
            </td>
        `;
        tabla.appendChild(tr);
    });
}


// ─── BOTONES ACCIONES RÁPIDAS ─────────────────────────────────────────────────

function configurarBotones() {
    const btnBlue = document.querySelector('.btn.blue');
    const btnOrange = document.querySelector('.btn.orange');
    const btnGreen = document.querySelector('.btn.green');
    const btnPurple = document.querySelector('.btn.purple');

    if (btnBlue) btnBlue.onclick = () => window.location.href = 'entrada.html';
    if (btnOrange) btnOrange.onclick = () => window.location.href = 'registrarsalida.html';
    if (btnGreen) btnGreen.onclick = () => window.location.href = 'espacios.html';
    if (btnPurple) btnPurple.onclick = () => window.location.href = 'reportes.html';
}


// ─── INICIO ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    actualizarCards();
    actualizarAlertas();
    cargarRecientes();
    configurarBotones();

    setInterval(() => {
        cargarRecientes();
        actualizarCards();
        actualizarAlertas();
    }, 30000);
});