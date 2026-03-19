// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY   = 'celdas_db';
const ENTRADAS_KEY = 'registros_entrada';
const SALIDAS_KEY  = 'registros_salida';


// ─── TARIFAS ─────────────────────────────────────────────────────────────────

const TARIFAS = {
    'Carro':     { hora: 3000,  dia: 25000 },
    'Camioneta': { hora: 3000,  dia: 25000 },
    'Moto':      { hora: 2000,  dia: 15000 },
    'Van':       { hora: 4000,  dia: 30000 },
};

function getTarifa(tipo) {
    return TARIFAS[tipo] || { hora: 3000, dia: 25000 };
}


// ─── UTILIDADES DE FECHA Y HORA LOCAL ────────────────────────────────────────
// fecha: "YYYY-MM-DD", hora: "HH:MM" (24h) — ambos en hora local

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
    const [hh, mi]     = horaHHMM.split(':');
    const h    = parseInt(hh);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 || 12;
    return `${dd}/${mm}/${yy} ${h12}:${mi}${ampm}`;
}

function formatearPesos(valor) {
    return '$' + valor.toLocaleString('es-CO');
}

function formatearTiempo(minutos) {
    const d = Math.floor(minutos / 1440);
    const h = Math.floor((minutos % 1440) / 60);
    const m = minutos % 60;
    let r = '';
    if (d > 0) r += `${d}d `;
    if (h > 0) r += `${h}h `;
    r += `${m}min`;
    return r.trim();
}


// ─── CÁLCULO DE COBRO ────────────────────────────────────────────────────────

function calcularCobro(registro) {
    const tarifa    = getTarifa(registro.tipo);
    const modalidad = registro.modalidad;

    // Construir Date desde fecha+hora LOCAL del formulario
    // "YYYY-MM-DDThh:mm:00" sin Z = hora local del navegador
    const fechaHoraEntrada = new Date(`${registro.fecha}T${registro.hora}:00`);
    const fechaHoraSalida  = new Date();

    const diffMs      = fechaHoraSalida - fechaHoraEntrada;
    const diffMinutos = Math.max(0, Math.floor(diffMs / 60000));
    const diffHoras   = diffMinutos / 60;

    const diasCompletos  = Math.floor(diffHoras / 24);
    const horasRestantes = diffHoras % 24;
    const horasCobradas  = horasRestantes > 0 ? Math.ceil(horasRestantes) : 0;

    let total     = 0;
    let detalle   = '';
    let esMensual = false;

    if (modalidad === 'mensual') {
        esMensual = true;
        total     = 0;
        detalle   = 'Cliente con mensualidad activa.';

    } else if (diasCompletos >= 1) {
        const costoDias  = diasCompletos * tarifa.dia;
        const costoHoras = horasCobradas * tarifa.hora;
        total = costoDias + costoHoras;
        const parteDias  = `${diasCompletos} día${diasCompletos > 1 ? 's' : ''}`;
        const parteHoras = horasCobradas > 0
            ? ` + ${horasCobradas} hora${horasCobradas > 1 ? 's' : ''}`
            : '';
        detalle = parteDias + parteHoras;

    } else {
        const horasACobrar = Math.ceil(diffHoras) || 1;
        total   = horasACobrar * tarifa.hora;
        detalle = `${horasACobrar} hora${horasACobrar > 1 ? 's' : ''}`;
    }

    return { total, detalle, esMensual, diffMinutos, fechaHoraEntrada, fechaHoraSalida };
}


// ─── BUSCAR VEHÍCULO ─────────────────────────────────────────────────────────

function buscarVehiculo() {
    const placa = document.getElementById('placa').value.trim().toUpperCase();
    if (!placa) { alert('Ingrese una placa para buscar.'); return; }

    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const registro = entradas.find(r => r.placa === placa && r.estado === 'activo');

    document.getElementById('placeholder').style.display = 'none';

    if (!registro) {
        document.getElementById('info').style.display         = 'none';
        document.getElementById('noEncontrado').style.display = 'block';
        document.getElementById('msgNoEncontrado').textContent =
            `No se encontró ningún vehículo activo con la placa ${placa}.`;
        return;
    }

    document.getElementById('noEncontrado').style.display = 'none';

    const cobro   = calcularCobro(registro);
    const ahoraD  = cobro.fechaHoraSalida;

    // Poblar campos — todo en formato dd/mm/yyyy H:MMam/pm
    document.getElementById('vplaca').textContent     = registro.placa;
    document.getElementById('vtipo').textContent      = registro.tipo;
    document.getElementById('vespacio').textContent   = registro.espacio;
    document.getElementById('vmodalidad').textContent =
        registro.modalidad === 'hora' ? 'Por hora' :
        registro.modalidad === 'dia'  ? 'Por día'  : 'Mensual';

    document.getElementById('ventrada').textContent =
        formatearMostrar(registro.fecha, registro.hora);

    document.getElementById('vsalida').textContent =
        formatearMostrar(fechaLocalISO(ahoraD), horaLocalHHMM(ahoraD));

    document.getElementById('vtiempo').textContent  = formatearTiempo(cobro.diffMinutos);
    document.getElementById('vdetalle').textContent = cobro.detalle;

    const seccionCobro   = document.getElementById('seccionCobro');
    const seccionMensual = document.getElementById('seccionMensual');

    if (cobro.esMensual) {
        seccionCobro.style.display   = 'none';
        seccionMensual.style.display = 'block';
    } else {
        seccionMensual.style.display = 'none';
        seccionCobro.style.display   = 'block';
        document.getElementById('vpago').textContent = formatearPesos(cobro.total);
    }

    document.getElementById('info').style.display       = 'block';
    document.getElementById('info').dataset.placaActiva = placa;
}


// ─── REGISTRAR SALIDA ────────────────────────────────────────────────────────

function registrarSalida() {
    const placa = document.getElementById('info').dataset.placaActiva;
    if (!placa) return;

    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const index    = entradas.findIndex(r => r.placa === placa && r.estado === 'activo');
    if (index === -1) return;

    const registro = entradas[index];
    const cobro    = calcularCobro(registro);
    const ahora    = new Date();

    entradas[index].estado       = 'inactivo';
    entradas[index].fechaSalida  = fechaLocalISO(ahora);
    entradas[index].horaSalida   = horaLocalHHMM(ahora);
    entradas[index].totalCobrado = cobro.total;
    localStorage.setItem(ENTRADAS_KEY, JSON.stringify(entradas));

    const salidas = JSON.parse(localStorage.getItem(SALIDAS_KEY) || '[]');
    salidas.push({
        id:           Date.now(),
        placa:        registro.placa,
        tipo:         registro.tipo,
        espacio:      registro.espacio,
        modalidad:    registro.modalidad,
        fechaEntrada: registro.fecha,
        horaEntrada:  registro.hora,
        fechaSalida:  fechaLocalISO(ahora),
        horaSalida:   horaLocalHHMM(ahora),
        tiempoMin:    cobro.diffMinutos,
        detalleCobro: cobro.detalle,
        totalCobrado: cobro.total
    });
    localStorage.setItem(SALIDAS_KEY, JSON.stringify(salidas));

    const celdas = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const ci     = celdas.findIndex(c => c.numero === registro.espacio);
    if (ci !== -1) {
        celdas[ci].estado = 'disponible';
        celdas[ci].placa  = null;
        localStorage.setItem(CELDAS_KEY, JSON.stringify(celdas));
    }

    const msg = cobro.esMensual
        ? 'Salida registrada. Cliente con mensualidad — sin cobro adicional.'
        : `Salida registrada. Total cobrado: ${formatearPesos(cobro.total)}`;

    alert(msg);

    document.getElementById('info').style.display        = 'none';
    document.getElementById('placeholder').style.display = 'block';
    document.getElementById('placa').value               = '';
    document.getElementById('info').dataset.placaActiva  = '';
}


// ─── ENTER EN BUSCADOR ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('placa').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') buscarVehiculo();
    });
});