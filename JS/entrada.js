// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY    = 'celdas_db';
const ENTRADAS_KEY  = 'registros_entrada';
const RECIENTES_KEY = 'vehiculos_recientes';

const MINUTOS_RECIENTES = 5;


// ─── UTILIDADES DE FECHA Y HORA LOCAL ─────────────────────────────────────────
// Nunca usar toISOString() — convierte a UTC y en Colombia (UTC-5)
// las horas nocturnas saltan al día siguiente.

// Retorna "YYYY-MM-DD" en hora local (para el input type="date")
function fechaLocalISO(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

// Retorna "HH:MM" en hora local (para el input type="time")
function horaLocalHHMM(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
}

// Formatea fecha+hora para mostrar: "18/03/2026 9:32pm"
function formatearFechaHora(fechaISO, horaHHMM) {
    // fechaISO: "YYYY-MM-DD", horaHHMM: "HH:MM"
    const [yy, mm, dd] = fechaISO.split('-');
    const [hh, mi] = horaHHMM.split(':');
    const h = parseInt(hh);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 || 12;
    return `${dd}/${mm}/${yy} ${h12}:${mi}${ampm}`;
}


// ─── INICIALIZAR CELDAS SI localStorage ESTÁ VACÍO ───────────────────────────

function inicializarCeldas() {
    if (localStorage.getItem(CELDAS_KEY)) return;

    const inicial = [
        { numero: 'A-10', zona: 'A', tipo: 'Carro',     estado: 'disponible', placa: null },
        { numero: 'A-11', zona: 'A', tipo: 'Carro',     estado: 'disponible', placa: null },
        { numero: 'A-12', zona: 'A', tipo: 'Carro',     estado: 'mantenimiento', placa: null },
        { numero: 'A-13', zona: 'A', tipo: 'Carro',     estado: 'disponible', placa: null },
        { numero: 'A-14', zona: 'A', tipo: 'Carro',     estado: 'disponible', placa: null },
        { numero: 'A-15', zona: 'A', tipo: 'Carro',     estado: 'disponible', placa: null },
        { numero: 'B-01', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'B-02', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'B-03', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'B-04', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'B-05', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'B-06', zona: 'B', tipo: 'Moto',      estado: 'disponible', placa: null },
        { numero: 'C-01', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-02', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-03', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-04', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-05', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-06', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
    ];
    localStorage.setItem(CELDAS_KEY, JSON.stringify(inicial));
}


// ─── CARGAR CELDAS DISPONIBLES EN EL SELECT ──────────────────────────────────

function actualizarCeldas() {
    const tipo   = document.getElementById('tipo').value;
    const select = document.getElementById('espacio');
    const celdas = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');

    const disponibles = celdas.filter(c => {
        if (c.estado !== 'disponible') return false;
        if (!c.tipo || c.tipo === '') return true;
        return c.tipo === tipo;
    });

    select.innerHTML = '';

    if (disponibles.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `No hay espacios disponibles para ${tipo}`;
        select.appendChild(opt);
        return;
    }

    const def = document.createElement('option');
    def.value = '';
    def.textContent = 'Seleccione un espacio';
    select.appendChild(def);

    disponibles.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.numero;
        opt.textContent = `${c.numero} — Zona ${c.zona} (${c.tipo || 'Cualquier tipo'})`;
        select.appendChild(opt);
    });
}


// ─── REGISTRO DE ENTRADA ──────────────────────────────────────────────────────

document.getElementById('formEntrada').addEventListener('submit', function (e) {
    e.preventDefault();

    const placa       = document.getElementById('placa').value.trim().toUpperCase();
    const tipo        = document.getElementById('tipo').value;
    const propietario = document.getElementById('propietario').value.trim();
    const telefono    = document.getElementById('telefono').value.trim();
    const espacio     = document.getElementById('espacio').value;
    const modalidad   = document.getElementById('modalidad').value;
    const obs         = document.getElementById('obs').value.trim();

    // Leer fecha y hora del formulario (siempre local, nunca ISO)
    const ahora      = new Date();
    const fechaInput = document.getElementById('fecha').value || fechaLocalISO(ahora);
    const horaInput  = document.getElementById('hora').value  || horaLocalHHMM(ahora);

    if (!placa) { alert('Ingrese la placa del vehículo.'); return; }
    if (!espacio) { alert('Seleccione un espacio de parqueo disponible.'); return; }

    const celdas     = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const celdaIndex = celdas.findIndex(c => c.numero === espacio);

    if (celdaIndex === -1 || celdas[celdaIndex].estado !== 'disponible') {
        alert('El espacio seleccionado ya no está disponible. Por favor seleccione otro.');
        actualizarCeldas();
        return;
    }

    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const yaActiva = entradas.find(r => r.placa === placa && r.estado === 'activo');
    if (yaActiva) {
        alert(`La placa ${placa} ya tiene una entrada activa en el espacio ${yaActiva.espacio}.`);
        return;
    }

    const registro = {
        id:        Date.now(),
        placa,
        tipo,
        propietario,
        telefono,
        espacio,
        modalidad,
        fecha:     fechaInput,   // "YYYY-MM-DD" local
        hora:      horaInput,    // "HH:MM" local (24h, para cálculos)
        obs,
        estado:    'activo'
    };

    entradas.push(registro);
    localStorage.setItem(ENTRADAS_KEY, JSON.stringify(entradas));

    celdas[celdaIndex].estado = 'ocupado';
    celdas[celdaIndex].placa  = placa;
    localStorage.setItem(CELDAS_KEY, JSON.stringify(celdas));

    guardarReciente(registro);

    alert(`Vehículo ${placa} registrado correctamente en el espacio ${espacio}.`);
    document.getElementById('formEntrada').reset();
    setFechaHoraActual();
    actualizarCeldas();
});


// ─── RECIENTES PARA DASHBOARD ─────────────────────────────────────────────────

function guardarReciente(registro) {
    const recientes = obtenerRecientesValidos();
    recientes.unshift({
        ...registro,
        expira: Date.now() + MINUTOS_RECIENTES * 60 * 1000
    });
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(recientes.slice(0, 20)));
}

function obtenerRecientesValidos() {
    const datos = JSON.parse(localStorage.getItem(RECIENTES_KEY) || '[]');
    return datos.filter(r => r.expira > Date.now());
}


// ─── FECHA Y HORA ACTUAL AUTOMÁTICA ──────────────────────────────────────────

function setFechaHoraActual() {
    const ahora      = new Date();
    const fechaInput = document.getElementById('fecha');
    const horaInput  = document.getElementById('hora');

    if (fechaInput) fechaInput.value = fechaLocalISO(ahora);
    if (horaInput)  horaInput.value  = horaLocalHHMM(ahora);
}


// ─── INICIO ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    inicializarCeldas();
    setFechaHoraActual();
    actualizarCeldas();
});