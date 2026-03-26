// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY    = 'celdas_db';
const ENTRADAS_KEY  = 'registros_entrada';
const RECIENTES_KEY = 'vehiculos_recientes';
const SALIDAS_KEY   = 'registros_salida';
const PAGOS_MENS_KEY = 'pagos_db';


// ─── UTILIDADES DE FECHA Y HORA LOCAL ─────────────────────────────────────────

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

function formatearMostrar(fechaISO, horaHHMM) {
    const [yy, mm, dd] = fechaISO.split('-');
    const [hh, mi] = horaHHMM.split(':');
    const h    = parseInt(hh);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 || 12;
    return `${dd}/${mm}/${yy} ${h12}:${mi}${ampm}`;
}

function formatearPesos(valor) {
    return '$' + valor.toLocaleString('es-CO');
}


// ─── CARDS RESUMEN ────────────────────────────────────────────────────────────

function actualizarCards() {
    const celdas  = JSON.parse(localStorage.getItem(CELDAS_KEY)  || '[]');
    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const salidas  = JSON.parse(localStorage.getItem(SALIDAS_KEY)  || '[]');

    const ocupados = celdas.filter(c => c.estado === 'ocupado').length;
    const total    = celdas.length;
    const hoy      = fechaLocalISO(new Date());

    const vehiculosHoy = entradas.filter(r => r.fecha === hoy).length;

    const ingresosHoy = salidas
        .filter(r => r.fechaSalida === hoy)
        .reduce((acc, r) => acc + (r.totalCobrado || 0), 0);

    const cardEspacios = document.querySelector('.card:nth-child(1) .big');
    if (cardEspacios) cardEspacios.textContent = `${ocupados}/${total}`;

    const fill = document.querySelector('.fill');
    if (fill && total > 0) {
        fill.style.width = Math.round((ocupados / total) * 100) + '%';
    }

    const cardVehiculos = document.querySelector('.card:nth-child(2) .big');
    if (cardVehiculos) cardVehiculos.textContent = vehiculosHoy;

    const cardIngresos = document.querySelector('.card:nth-child(3) .big');
    if (cardIngresos) cardIngresos.textContent = formatearPesos(ingresosHoy);
}


// ─── ALERTAS (mantenimiento + mensualidades vencidas/próximas) ────────────────

function actualizarAlertas() {
    const celdas  = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const mensualidades = JSON.parse(localStorage.getItem(PAGOS_MENS_KEY) || '[]');
    const lista   = document.getElementById('listaAlertas');
    if (!lista) return;

    const alertas = [];

    // Celdas en mantenimiento
    celdas
        .filter(c => c.estado === 'mantenimiento')
        .forEach(c => alertas.push(`Celda ${c.numero} (Zona ${c.zona}) en mantenimiento`));

    // Mensualidades vencidas y próximas a vencer (≤5 días)
    const hoy = new Date(fechaLocalISO(new Date()) + 'T00:00:00');
    mensualidades.forEach(m => {
        const vence = new Date(m.fechaVencimiento + 'T00:00:00');
        const dias  = Math.round((vence - hoy) / (1000 * 60 * 60 * 24));
        if (dias < 0) {
            alertas.push(`Mensualidad vencida: ${m.placa} (venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''})`);
        } else if (dias <= 5) {
            alertas.push(`Mensualidad por vencer: ${m.placa} (vence en ${dias} día${dias !== 1 ? 's' : ''})`);
        }
    });

    if (alertas.length === 0) {
        lista.innerHTML = '<li>Sin alertas activas</li>';
        return;
    }

    lista.innerHTML = alertas.map(a => `<li>${a}</li>`).join('');
}


// ─── TABLA VEHÍCULOS RECIENTES ────────────────────────────────────────────────

function etiquetaModalidad(modalidad) {
    if (modalidad === 'hora')    return 'Por hora';
    if (modalidad === 'dia')     return 'Por día';
    if (modalidad === 'mensual') return 'Mensual';
    return modalidad || '-';
}

function cargarRecientes() {
    const tabla = document.getElementById('tablaVehiculos');
    if (!tabla) return;

    const ahora  = Date.now();
    const datos  = JSON.parse(localStorage.getItem(RECIENTES_KEY) || '[]');
    const validos = datos.filter(r => r.expira > ahora);

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
    actualizarAlertas();
    cargarRecientes();
    configurarBotones();

    setInterval(() => {
        cargarRecientes();
        actualizarCards();
        actualizarAlertas();
    }, 30000);
});
