// ─── CLAVE localStorage ────────────────────────────────────────────────────────

const CELDAS_KEY = 'celdas_db';

// ─── DATOS INICIALES ───────────────────────────────────────────────────────────

function cargarCeldas() {
    const datos = localStorage.getItem(CELDAS_KEY);
    if (datos) return JSON.parse(datos);

    // Datos de ejemplo para la primera carga (igual a tu código original)
    const inicial = [
        { numero: 'A-10', zona: 'A', tipo: 'Carro', estado: 'disponible', placa: null },
        { numero: 'A-11', zona: 'A', tipo: 'Carro', estado: 'disponible', placa: null },
        { numero: 'A-12', zona: 'A', tipo: 'Carro', estado: 'mantenimiento', placa: null },
        { numero: 'A-13', zona: 'A', tipo: 'Carro', estado: 'ocupado', placa: 'ABC-123' },
        { numero: 'A-14', zona: 'A', tipo: 'Carro', estado: 'ocupado', placa: 'DEF-456' },
        { numero: 'A-15', zona: 'A', tipo: 'Carro', estado: 'ocupado', placa: 'GHI-789' },
        { numero: 'B-01', zona: 'B', tipo: 'Moto',  estado: 'disponible', placa: null },
        { numero: 'B-02', zona: 'B', tipo: 'Moto',  estado: 'disponible', placa: null },
        { numero: 'B-03', zona: 'B', tipo: 'Moto',  estado: 'disponible', placa: null },
        { numero: 'B-04', zona: 'B', tipo: 'Moto',  estado: 'ocupado', placa: 'JKL-012' },
        { numero: 'B-05', zona: 'B', tipo: 'Moto',  estado: 'ocupado', placa: 'MNO-345' },
        { numero: 'B-06', zona: 'B', tipo: 'Moto',  estado: 'disponible', placa: null },
        { numero: 'C-01', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-02', zona: 'C', tipo: 'Camioneta', estado: 'ocupado', placa: 'PQR-678' },
        { numero: 'C-03', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-04', zona: 'C', tipo: 'Camioneta', estado: 'disponible', placa: null },
        { numero: 'C-05', zona: 'C', tipo: 'Camioneta', estado: 'ocupado', placa: 'STU-901' },
        { numero: 'C-06', zona: 'C', tipo: 'Camioneta', estado: 'ocupado', placa: 'FCS-766' },
    ];

    guardarCeldas(inicial);
    return inicial;
}

function guardarCeldas(lista) {
    localStorage.setItem(CELDAS_KEY, JSON.stringify(lista));
}


// ─── ESTADO ACTIVO ─────────────────────────────────────────────────────────────

let celdaSeleccionada = null;
let zonaActiva = 'todas';


// ─── RENDERIZADO ───────────────────────────────────────────────────────────────

function iconoPorEstado(estado) {
    if (estado === 'disponible')    return '✔';
    if (estado === 'ocupado')       return '🚗';
    if (estado === 'mantenimiento') return '🔧';
    return '';
}

function renderizar(lista) {
    const grid = document.getElementById('parkingGrid');
    grid.innerHTML = '';

    lista.forEach(celda => {
        const div = document.createElement('div');
        div.className = `parking-space ${celda.estado}`;
        div.onclick = () => abrirModalEstado(celda.numero);

        div.innerHTML = `
            <div class="icon">${iconoPorEstado(celda.estado)}</div>
            <div class="space-id">${celda.numero}</div>
            ${celda.placa ? `<div class="plate">${celda.placa}</div>` : ''}
        `;

        grid.appendChild(div);
    });

    actualizarContadores();
}

function actualizarContadores() {
    const todas = cargarCeldas();
    document.getElementById('total').textContent = todas.length;
    document.getElementById('disponibles').textContent  = todas.filter(c => c.estado === 'disponible').length;
    document.getElementById('ocupados').textContent     = todas.filter(c => c.estado === 'ocupado').length;
    document.getElementById('mantenimiento').textContent = todas.filter(c => c.estado === 'mantenimiento').length;
}


// ─── FILTRO POR ZONA ───────────────────────────────────────────────────────────

function filtrar(zona, boton) {
    zonaActiva = zona;

    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    const todas = cargarCeldas();
    const filtradas = zona === 'todas'
        ? todas
        : todas.filter(c => c.zona === zona);

    renderizar(filtradas);
}


// ─── MODAL: CAMBIAR ESTADO ─────────────────────────────────────────────────────

function abrirModalEstado(numero) {
    const lista = cargarCeldas();
    const celda = lista.find(c => c.numero === numero);
    if (!celda) return;

    celdaSeleccionada = numero;

    document.getElementById('modalCeldaId').textContent = numero;
    document.getElementById('modalEstadoActual').textContent = celda.estado;
    document.getElementById('modalEstado').style.display = 'flex';

    // Resaltar botón del estado actual
    document.querySelectorAll('.btn-estado').forEach(b => b.classList.remove('seleccionado'));
    const btnActual = document.querySelector(`.btn-estado.${celda.estado}`);
    if (btnActual) btnActual.classList.add('seleccionado');
}

function aplicarEstado(nuevoEstado) {
    const lista = cargarCeldas();
    const index = lista.findIndex(c => c.numero === celdaSeleccionada);
    if (index === -1) return;

    // Si pasa a disponible, limpiar placa
    if (nuevoEstado === 'disponible' || nuevoEstado === 'mantenimiento') {
        lista[index].placa = null;
    }

    lista[index].estado = nuevoEstado;
    guardarCeldas(lista);
    cerrarModal();

    // Re-renderizar con el filtro activo
    const filtradas = zonaActiva === 'todas'
        ? lista
        : lista.filter(c => c.zona === zonaActiva);

    renderizar(filtradas);
}

function cerrarModal() {
    document.getElementById('modalEstado').style.display = 'none';
    celdaSeleccionada = null;
}


// ─── MODAL: NUEVA CELDA ────────────────────────────────────────────────────────

function mostrarFormularioCelda() {
    document.getElementById('nuevaId').value = '';
    document.getElementById('nuevaZona').value = '';
    document.getElementById('nuevaTipo').value = 'Carro';
    document.querySelector('input[name="estadoInicial"][value="disponible"]').checked = true;

    // Limpiar errores previos
    document.getElementById('nuevaId').classList.remove('error');
    document.getElementById('nuevaZona').classList.remove('error');

    document.getElementById('modalNuevaCelda').style.display = 'flex';
}

function cerrarModalCelda() {
    document.getElementById('modalNuevaCelda').style.display = 'none';
}

function guardarNuevaCelda() {
    const id     = document.getElementById('nuevaId').value.trim().toUpperCase();
    const zona   = document.getElementById('nuevaZona').value;
    const tipo   = document.getElementById('nuevaTipo').value;
    const estado = document.querySelector('input[name="estadoInicial"]:checked').value;

    // Limpiar errores
    document.getElementById('nuevaId').classList.remove('error');
    document.getElementById('nuevaZona').classList.remove('error');

    let valido = true;
    if (!id) { document.getElementById('nuevaId').classList.add('error'); valido = false; }
    if (!zona) { document.getElementById('nuevaZona').classList.add('error'); valido = false; }

    if (!valido) {
        alert('Completá los campos obligatorios.');
        return;
    }

    const lista = cargarCeldas();

    // Verificar duplicado
    if (lista.find(c => c.numero === id)) {
        document.getElementById('nuevaId').classList.add('error');
        alert(`Ya existe una celda con el identificador "${id}".`);
        return;
    }

    lista.push({ numero: id, zona, tipo, estado, placa: null });
    guardarCeldas(lista);
    cerrarModalCelda();

    // Re-renderizar
    const filtradas = zonaActiva === 'todas'
        ? lista
        : lista.filter(c => c.zona === zonaActiva);

    renderizar(filtradas);
    alert(`Celda ${id} registrada correctamente.`);
}


// ─── INICIO ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const todas = cargarCeldas();
    renderizar(todas);
});
