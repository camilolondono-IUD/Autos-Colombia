// ─── DATOS INICIALES ───────────────────────────────────────────────────────────

const USUARIOS_KEY = 'usuarios_db';

// Carga usuarios del localStorage o inicializa con datos de ejemplo
function cargarUsuarios() {
    const datos = localStorage.getItem(USUARIOS_KEY);
    if (datos) return JSON.parse(datos);

    // Datos de ejemplo para la primera carga
    const inicial = [
        {
            id: 1,
            nombre: 'Carlos Administrador',
            documento: '1000000001',
            correo: 'admin@autoscolombia.com',
            telefono: '300 000 0001',
            rol: 'Administrador',
            contrasena: '12345',
            estado: 'activo'
        },
        {
            id: 2,
            nombre: 'María Operaria',
            documento: '1000000002',
            correo: 'operario@autoscolombia.com',
            telefono: '300 000 0002',
            rol: 'Operario',
            contrasena: 'op123',
            estado: 'activo'
        }
    ];
    guardarUsuarios(inicial);
    return inicial;
}

function guardarUsuarios(lista) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(lista));
}

function generarId() {
    const lista = cargarUsuarios();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(u => u.id)) + 1;
}


// ─── ESTADO DE LA VISTA ────────────────────────────────────────────────────────

let modoEdicion = false;
let idEdicion = null;
let accionModal = null;
let idAccionModal = null;


// ─── RENDERIZADO DE LA TABLA ───────────────────────────────────────────────────

function renderizarTabla(lista) {
    const tbody = document.getElementById('tablaUsuarios');
    const sinResultados = document.getElementById('sinResultados');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        sinResultados.style.display = 'block';
        return;
    }

    sinResultados.style.display = 'none';

    lista.forEach(u => {
        const tr = document.createElement('tr');

        const badgeRol = u.rol === 'Administrador'
            ? `<span class="badge-admin">${u.rol}</span>`
            : `<span class="badge-operario">${u.rol}</span>`;

        const badgeEstado = u.estado === 'activo'
            ? `<span class="badge-activo">Activo</span>`
            : `<span class="badge-inactivo">Inactivo</span>`;

        const botonToggle = u.estado === 'activo'
            ? `<button class="btn-toggle-off" onclick="abrirModalDesactivar(${u.id})">Desactivar</button>`
            : `<button class="btn-toggle-on" onclick="abrirModalReactivar(${u.id})">Reactivar</button>`;

        tr.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.documento}</td>
            <td>${badgeRol}</td>
            <td>${u.correo}</td>
            <td>${badgeEstado}</td>
            <td>
                <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                ${botonToggle}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function cargarTabla() {
    renderizarTabla(cargarUsuarios());
}


// ─── BUSCADOR ─────────────────────────────────────────────────────────────────

function filtrarUsuarios() {
    const texto = document.getElementById('buscador').value.toLowerCase().trim();
    const lista = cargarUsuarios();

    if (texto === '') {
        renderizarTabla(lista);
        return;
    }

    const filtrados = lista.filter(u =>
        u.nombre.toLowerCase().includes(texto) ||
        u.documento.toLowerCase().includes(texto)
    );

    renderizarTabla(filtrados);
}


// ─── NAVEGACIÓN ENTRE VISTAS ───────────────────────────────────────────────────

function mostrarFormulario(modo = 'nuevo') {
    document.getElementById('vistaListado').style.display = 'none';
    document.getElementById('vistaFormulario').style.display = 'block';

    if (modo === 'nuevo') {
        document.getElementById('tituloFormulario').textContent = 'Registrar Usuario';
        document.getElementById('subtituloFormulario').textContent = 'Complete los datos del nuevo usuario del sistema';
        document.getElementById('campoContrasena').style.display = 'flex';
        document.getElementById('campoConfirmar').style.display = 'flex';
        limpiarFormulario();
        modoEdicion = false;
        idEdicion = null;
    }
}

function mostrarListado() {
    document.getElementById('vistaFormulario').style.display = 'none';
    document.getElementById('vistaListado').style.display = 'block';
    limpiarFormulario();
    cargarTabla();
}


// ─── GUARDAR USUARIO (crear o editar) ──────────────────────────────────────────

function guardarUsuario() {
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const rol = document.getElementById('rol').value;
    const contrasena = document.getElementById('contrasena').value.trim();
    const confirmar = document.getElementById('confirmar').value.trim();

    // Limpiar errores previos
    limpiarErrores();

    // Validaciones
    let valido = true;

    if (!nombre) { marcarError('nombre'); valido = false; }
    if (!documento) { marcarError('documento'); valido = false; }
    if (!correo || !correo.includes('@')) { marcarError('correo'); valido = false; }
    if (!rol) { marcarError('rol'); valido = false; }

    if (!modoEdicion) {
        if (!contrasena || contrasena.length < 6) { marcarError('contrasena'); valido = false; }
        if (contrasena !== confirmar) { marcarError('confirmar'); valido = false; }
    }

    if (!valido) {
        alert('Por favor completá correctamente los campos marcados en rojo.');
        return;
    }

    const lista = cargarUsuarios();

    // Verificar correo duplicado
    const duplicado = lista.find(u =>
        u.correo === correo && u.id !== idEdicion
    );
    if (duplicado) {
        marcarError('correo');
        alert('El correo electrónico ya está registrado en el sistema.');
        return;
    }

    if (modoEdicion) {
        // Actualizar usuario existente
        const index = lista.findIndex(u => u.id === idEdicion);
        if (index !== -1) {
            lista[index].nombre = nombre;
            lista[index].documento = documento;
            lista[index].correo = correo;
            lista[index].telefono = telefono;
            lista[index].rol = rol;
        }
        guardarUsuarios(lista);
        alert('Usuario actualizado correctamente.');
    } else {
        // Crear nuevo usuario
        const nuevo = {
            id: generarId(),
            nombre,
            documento,
            correo,
            telefono,
            rol,
            contrasena,
            estado: 'activo'
        };
        lista.push(nuevo);
        guardarUsuarios(lista);
        alert('Usuario registrado correctamente.');
    }

    mostrarListado();
}


// ─── EDITAR USUARIO ────────────────────────────────────────────────────────────

function editarUsuario(id) {
    const lista = cargarUsuarios();
    const usuario = lista.find(u => u.id === id);
    if (!usuario) return;

    modoEdicion = true;
    idEdicion = id;

    document.getElementById('tituloFormulario').textContent = 'Editar Usuario';
    document.getElementById('subtituloFormulario').textContent = 'Modificá los datos del usuario seleccionado';
    document.getElementById('campoContrasena').style.display = 'none';
    document.getElementById('campoConfirmar').style.display = 'none';

    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('documento').value = usuario.documento;
    document.getElementById('correo').value = usuario.correo;
    document.getElementById('telefono').value = usuario.telefono;
    document.getElementById('rol').value = usuario.rol;

    document.getElementById('vistaListado').style.display = 'none';
    document.getElementById('vistaFormulario').style.display = 'block';
}


// ─── MODAL DESACTIVAR / REACTIVAR ─────────────────────────────────────────────

function abrirModalDesactivar(id) {
    const lista = cargarUsuarios();
    const usuario = lista.find(u => u.id === id);
    if (!usuario) return;

    accionModal = 'desactivar';
    idAccionModal = id;

    document.getElementById('modalTitulo').textContent = '¿Desactivar usuario?';
    document.getElementById('modalMensaje').textContent =
        `El usuario "${usuario.nombre}" perderá acceso al sistema. Esta acción se puede revertir.`;
    document.getElementById('modalDesactivar').style.display = 'flex';
}

function abrirModalReactivar(id) {
    const lista = cargarUsuarios();
    const usuario = lista.find(u => u.id === id);
    if (!usuario) return;

    accionModal = 'reactivar';
    idAccionModal = id;

    document.getElementById('modalTitulo').textContent = '¿Reactivar usuario?';
    document.getElementById('modalMensaje').textContent =
        `El usuario "${usuario.nombre}" recuperará el acceso al sistema.`;
    document.getElementById('modalDesactivar').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalDesactivar').style.display = 'none';
    accionModal = null;
    idAccionModal = null;
}

function confirmarAccion() {
    const lista = cargarUsuarios();
    const index = lista.findIndex(u => u.id === idAccionModal);

    if (index !== -1) {
        if (accionModal === 'desactivar') {
            lista[index].estado = 'inactivo';
            alert('Usuario desactivado correctamente.');
        } else if (accionModal === 'reactivar') {
            lista[index].estado = 'activo';
            alert('Usuario reactivado correctamente.');
        }
        guardarUsuarios(lista);
    }

    cerrarModal();
    cargarTabla();
}


// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function limpiarFormulario() {
    ['nombre', 'documento', 'correo', 'telefono', 'contrasena', 'confirmar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('rol').value = '';
    limpiarErrores();
}

function marcarError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('error');
}

function limpiarErrores() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}


// ─── INICIO ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    cargarTabla();
});
