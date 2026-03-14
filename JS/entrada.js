// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const CELDAS_KEY    = 'celdas_db';
const ENTRADAS_KEY  = 'registros_entrada';
const RECIENTES_KEY = 'vehiculos_recientes';

const MINUTOS_RECIENTES = 5; // tiempo en minutos que duran en el dashboard


// ─── INICIALIZAR CELDAS SI localStorage ESTÁ VACÍO ──────────────────────────

function inicializarCeldas() {
    const datos = localStorage.getItem(CELDAS_KEY);
    if (datos) return; // ya existen, no hacer nada

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


// ─── CARGAR CELDAS DISPONIBLES EN EL SELECT ───────────────────────────────────

function actualizarCeldas() {
    const tipo     = document.getElementById('tipo').value;
    const select   = document.getElementById('espacio');
    const celdas   = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');

    // Filtrar celdas disponibles Y compatibles con el tipo de vehículo.
    // La celda debe estar disponible y su tipo debe coincidir con el del vehículo.
    // Si la celda no tiene tipo definido, acepta cualquier vehículo.
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

    // Opción por defecto
    const def = document.createElement('option');
    def.value = '';
    def.textContent = 'Seleccione un espacio';
    select.appendChild(def);

    disponibles.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.numero;
        // Mostrar zona y tipo de vehículo permitido como referencia
        opt.textContent = `${c.numero} — Zona ${c.zona} (${c.tipo || 'Cualquier tipo'})`;
        select.appendChild(opt);
    });
}


// ─── REGISTRO DE ENTRADA ──────────────────────────────────────────────────────

document.getElementById('formEntrada').addEventListener('submit', function (e) {
    e.preventDefault();

    const placa      = document.getElementById('placa').value.trim().toUpperCase();
    const tipo       = document.getElementById('tipo').value;
    const propietario = document.getElementById('propietario').value.trim();
    const telefono   = document.getElementById('telefono').value.trim();
    const espacio    = document.getElementById('espacio').value;
    const modalidad  = document.getElementById('modalidad').value;
    const fecha      = document.getElementById('fecha').value;
    const hora       = document.getElementById('hora').value;
    const obs        = document.getElementById('obs').value.trim();

    // Validaciones
    if (!placa) {
        alert('Ingrese la placa del vehículo.');
        return;
    }

    if (!espacio) {
        alert('Seleccione un espacio de parqueo disponible.');
        return;
    }

    // Verificar nuevamente que la celda sigue disponible
    // (puede haber cambiado desde que se cargó la página)
    const celdas = JSON.parse(localStorage.getItem(CELDAS_KEY) || '[]');
    const celdaIndex = celdas.findIndex(c => c.numero === espacio);

    if (celdaIndex === -1 || celdas[celdaIndex].estado !== 'disponible') {
        alert('El espacio seleccionado ya no está disponible. Por favor seleccione otro.');
        actualizarCeldas();
        return;
    }

    // Verificar que la placa no esté ya registrada como activa
    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');
    const yaActiva = entradas.find(r => r.placa === placa && r.estado === 'activo');
    if (yaActiva) {
        alert(`La placa ${placa} ya tiene una entrada activa en el espacio ${yaActiva.espacio}.`);
        return;
    }

    // Fecha y hora automáticas si no se completaron
    const ahora    = new Date();
    const fechaFinal = fecha || ahora.toISOString().split('T')[0];
    const horaFinal  = hora  || ahora.toTimeString().slice(0, 5);

    // Crear registro de entrada
    const registro = {
        id:          Date.now(),
        placa,
        tipo,
        propietario,
        telefono,
        espacio,
        modalidad,
        fecha:       fechaFinal,
        hora:        horaFinal,
        horaTimestamp: ahora.getTime(),
        obs,
        estado:      'activo'
    };

    // Guardar en entradas
    entradas.push(registro);
    localStorage.setItem(ENTRADAS_KEY, JSON.stringify(entradas));

    // Marcar celda como ocupada y guardar placa
    celdas[celdaIndex].estado = 'ocupado';
    celdas[celdaIndex].placa  = placa;
    localStorage.setItem(CELDAS_KEY, JSON.stringify(celdas));

    // Guardar en recientes para el dashboard (con timestamp de expiración)
    guardarReciente(registro);

    alert(`Vehículo ${placa} registrado correctamente en el espacio ${espacio}.`);

    document.getElementById('formEntrada').reset();
    actualizarCeldas();
    setFechaHoraActual();
});


// ─── RECIENTES PARA DASHBOARD ─────────────────────────────────────────────────

function guardarReciente(registro) {
    const recientes = obtenerRecientesValidos();

    recientes.unshift({
        ...registro,
        expira: Date.now() + MINUTOS_RECIENTES * 60 * 1000
    });

    // Guardar solo los últimos 20 para no saturar
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(recientes.slice(0, 20)));
}

function obtenerRecientesValidos() {
    const datos = JSON.parse(localStorage.getItem(RECIENTES_KEY) || '[]');
    const ahora = Date.now();
    // Filtrar los que no han expirado
    return datos.filter(r => r.expira > ahora);
}


// ─── FECHA Y HORA ACTUAL AUTOMÁTICA ───────────────────────────────────────────

function setFechaHoraActual() {
    const ahora = new Date();

    const fechaInput = document.getElementById('fecha');
    const horaInput  = document.getElementById('hora');

    if (fechaInput && !fechaInput.value) {
        fechaInput.value = ahora.toISOString().split('T')[0];
    }
    if (horaInput && !horaInput.value) {
        horaInput.value = ahora.toTimeString().slice(0, 5);
    }
}


// ─── INICIO ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    inicializarCeldas();
    setFechaHoraActual();
    actualizarCeldas();
});
