// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const SALIDAS_KEY      = 'registros_salida';
const PAGOS_MENS_KEY   = 'pagos_db';          // exclusivo para mensualidades


// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function horaLocalHHMM(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
}

function fechaLocalISO(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function formatearPesos(v) {
    return '$' + Math.round(v).toLocaleString('es-CO');
}

function formatearMostrar(fechaISO, horaHHMM) {
    if (!fechaISO) return '-';
    const [yy, mm, dd] = fechaISO.split('-');
    if (!horaHHMM) return `${dd}/${mm}/${yy}`;
    const [hh, mi] = horaHHMM.split(':');
    const h    = parseInt(hh);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 || 12;
    return `${dd}/${mm}/${yy} ${h12}:${mi}${ampm}`;
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

// Agrega días a una fecha ISO y devuelve nueva fecha ISO
function sumarDias(fechaISO, dias) {
    const d = new Date(fechaISO + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    return fechaLocalISO(d);
}

// Diferencia en días entre hoy y una fecha ISO (positivo = futuro, negativo = pasado)
function diasHastaVencimiento(fechaISO) {
    const hoy   = new Date(fechaLocalISO(new Date()) + 'T00:00:00');
    const vence = new Date(fechaISO + 'T00:00:00');
    return Math.round((vence - hoy) / (1000 * 60 * 60 * 24));
}

function estadoMensualidad(fechaVencimiento) {
    const dias = diasHastaVencimiento(fechaVencimiento);
    if (dias < 0)  return 'vencida';
    if (dias <= 5) return 'proxima';
    return 'activa';
}

// Tarifa mensual por tipo
function tarifaMensual(tipo) {
    const tarifas = { 'Carro': 80000, 'Camioneta': 80000, 'Moto': 70000, 'Van': 100000 };
    return tarifas[tipo] || 80000;
}


// ─── TAB NAVIGATION ──────────────────────────────────────────────────────────

function cambiarTab(tab) {
    document.getElementById('vistaHistorial').style.display     = tab === 'historial'     ? 'block' : 'none';
    document.getElementById('vistaMensualidades').style.display = tab === 'mensualidades' ? 'block' : 'none';

    document.getElementById('tabHistorial').classList.toggle('active',     tab === 'historial');
    document.getElementById('tabMensualidades').classList.toggle('active', tab === 'mensualidades');

    if (tab === 'historial')     cargarHistorial();
    if (tab === 'mensualidades') cargarMensualidades();
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — HISTORIAL DE PAGOS
// Lee directamente de registros_salida
// ═══════════════════════════════════════════════════════════════════════════════

function inicializarFiltrosHistorial() {
    const hoy   = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 6);
    document.getElementById('hDesde').value = fechaLocalISO(hace7);
    document.getElementById('hHasta').value = fechaLocalISO(hoy);
}

function aplicarFiltrosHistorial() {
    cargarHistorial();
}

function cargarHistorial() {
    const desde  = document.getElementById('hDesde').value;
    const hasta  = document.getElementById('hHasta').value;
    const tipo   = document.getElementById('hTipo').value;
    const metodo = document.getElementById('hMetodo').value;

    const salidas = JSON.parse(localStorage.getItem(SALIDAS_KEY) || '[]');

    let filtradas = salidas.filter(r => {
        const fecha = r.fechaSalida || r.fecha || '';
        const dentroRango = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
        const tipoOk   = !tipo   || (tipo === 'mensual' ? r.esMensual : !r.esMensual);
        const metodoOk = !metodo || r.metodoPago === metodo;
        return dentroRango && tipoOk && metodoOk;
    });

    // Ordenar de más reciente a más antiguo
    filtradas.sort((a, b) => b.id - a.id);

    // Stats
    const totalRec = filtradas.reduce((s, r) => s + (r.totalCobrado || 0), 0);
    const count    = filtradas.length;
    const promedio = count > 0 ? Math.round(totalRec / count) : 0;

    document.getElementById('statTotal').textContent   = formatearPesos(totalRec);
    document.getElementById('statCount').textContent   = count;
    document.getElementById('statPromedio').textContent = formatearPesos(promedio);

    // Tabla
    const tbody      = document.getElementById('tablaHistorial');
    const sinPagos   = document.getElementById('sinPagos');
    tbody.innerHTML  = '';

    if (filtradas.length === 0) {
        sinPagos.style.display = 'block';
        return;
    }
    sinPagos.style.display = 'none';

    filtradas.forEach(r => {
        const numRecibo = `#SAL-${String(r.id).slice(-6)}`;
        const badgeTipo = r.esMensual
            ? `<span class="badge badge-mens">Mensualidad</span>`
            : `<span class="badge badge-tiempo">Por tiempo</span>`;
        const metodoMap = {
            'Efectivo':     '<span class="badge badge-efec">Efectivo</span>',
            'Transferencia':'<span class="badge badge-transf">Transferencia</span>',
            'Tarjeta':      '<span class="badge badge-tarj">Tarjeta</span>',
            'Sin cobro':    '<span class="badge badge-mens">Sin cobro</span>',
        };
        const badgeMetodo = metodoMap[r.metodoPago] || `<span class="badge">${r.metodoPago || '-'}</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted">${numRecibo}</td>
            <td><span class="placa-tag">${r.placa}</span></td>
            <td>${formatearMostrar(r.fechaSalida || r.fecha, null)}</td>
            <td>${badgeTipo}</td>
            <td>${badgeMetodo}</td>
            <td class="text-success font-bold">${r.totalCobrado > 0 ? formatearPesos(r.totalCobrado) : '$0'}</td>
            <td>
                <button class="btn-ver" onclick="verRecibo(${r.id})">Ver recibo</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function verRecibo(id) {
    const salidas = JSON.parse(localStorage.getItem(SALIDAS_KEY) || '[]');
    const r = salidas.find(s => s.id === id);
    if (!r) return;
    mostrarRecibo(r);
}


// ─── MODAL RECIBO (compartido con registrarsalida) ────────────────────────────

function mostrarRecibo(r) {
    const numRecibo = `#SAL-${String(r.id).slice(-6)}`;
    document.getElementById('reciboNumero').textContent    = `RECIBO  ${numRecibo}`;
    document.getElementById('recPlaca').textContent        = r.placa;
    document.getElementById('recTipoEspacio').textContent  = `${r.tipo}   ·   Espacio ${r.espacio}`;

    const filas = [
        ['Fecha de entrada', formatearMostrar(r.fechaEntrada, r.horaEntrada)],
        ['Fecha de salida',  formatearMostrar(r.fechaSalida,  r.horaSalida)],
        ['Tiempo total',     r.tiempoMin !== undefined ? formatearTiempo(r.tiempoMin) : '-'],
        ['Detalle cobro',    r.detalleCobro || '-'],
        ['Método de pago',   r.metodoPago   || '-'],
    ];

    document.getElementById('reciboFilas').innerHTML = filas.map(([lbl, val]) => `
        <div class="recibo-fila">
            <span class="rec-label">${lbl}</span>
            <span class="rec-val">${val}</span>
        </div>
    `).join('');

    if (r.esMensual && !r.esPagoMensualidad) {
        document.getElementById('reciboTotal').innerHTML =
            `<div class="total-mensual">Cliente con mensualidad activa — Sin cobro adicional</div>`;
    } else {
        document.getElementById('reciboTotal').innerHTML =
            `<div class="total-row"><span>Total cobrado</span><span>${formatearPesos(r.totalCobrado || 0)}</span></div>`;
    }

    document.getElementById('modalRecibo').style.display = 'flex';
}

function cerrarRecibo() {
    document.getElementById('modalRecibo').style.display = 'none';
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — MENSUALIDADES
// Lee / escribe en pagos_db
// ═══════════════════════════════════════════════════════════════════════════════

function cargarMensualidadesDB() {
    return JSON.parse(localStorage.getItem(PAGOS_MENS_KEY) || '[]');
}

function guardarMensualidadesDB(lista) {
    localStorage.setItem(PAGOS_MENS_KEY, JSON.stringify(lista));
}

function cargarMensualidades() {
    const lista = cargarMensualidadesDB();
    renderizarMensualidades(lista);
}

function filtrarMensualidades() {
    const texto = document.getElementById('buscadorMens').value.toLowerCase().trim();
    const lista = cargarMensualidadesDB();
    const filtradas = texto
        ? lista.filter(m =>
            m.placa.toLowerCase().includes(texto) ||
            (m.propietario || '').toLowerCase().includes(texto))
        : lista;
    renderizarMensualidades(filtradas);
}

function renderizarMensualidades(lista) {
    const tbody      = document.getElementById('tablaMensualidades');
    const sinMens    = document.getElementById('sinMensualidades');
    const alertaEl   = document.getElementById('alertaVencidas');
    tbody.innerHTML  = '';

    // Calcular stats
    const hoy = fechaLocalISO(new Date());
    let activas = 0, proximas = 0, vencidas = 0;
    lista.forEach(m => {
        const est = estadoMensualidad(m.fechaVencimiento);
        if (est === 'activa')  activas++;
        if (est === 'proxima') proximas++;
        if (est === 'vencida') vencidas++;
    });

    document.getElementById('mStatActivas').textContent  = activas;
    document.getElementById('mStatProximas').textContent = proximas;
    document.getElementById('mStatVencidas').textContent = vencidas;

    // Alerta vencidas
    if (vencidas > 0) {
        alertaEl.style.display = 'flex';
        alertaEl.textContent = `⚠  ${vencidas} mensualidad${vencidas > 1 ? 'es' : ''} vencida${vencidas > 1 ? 's' : ''} — Requieren atención para evitar bloqueo de acceso.`;
    } else {
        alertaEl.style.display = 'none';
    }

    if (lista.length === 0) {
        sinMens.style.display = 'block';
        return;
    }
    sinMens.style.display = 'none';

    // Ordenar: vencidas primero, luego próximas, luego activas
    const prioridad = { vencida: 0, proxima: 1, activa: 2 };
    const ordenada = [...lista].sort((a, b) =>
        prioridad[estadoMensualidad(a.fechaVencimiento)] -
        prioridad[estadoMensualidad(b.fechaVencimiento)]
    );

    ordenada.forEach(m => {
        const estado = estadoMensualidad(m.fechaVencimiento);
        const dias   = diasHastaVencimiento(m.fechaVencimiento);

        const badgeMap = {
            activa:  `<span class="badge badge-activa">Activa</span>`,
            proxima: `<span class="badge badge-proxima">Vence en ${dias} día${dias !== 1 ? 's' : ''}</span>`,
            vencida: `<span class="badge badge-vencida">Vencida</span>`,
        };

        const rowBg = estado === 'vencida' ? 'row-vencida' : estado === 'proxima' ? 'row-proxima' : '';

        const tr = document.createElement('tr');
        tr.className = rowBg;
        tr.innerHTML = `
            <td><span class="placa-tag">${m.placa}</span></td>
            <td>${m.propietario || '-'}</td>
            <td>${m.tipo}</td>
            <td>${formatearMostrar(m.fechaVencimiento, null)}</td>
            <td>${badgeMap[estado]}</td>
            <td>
                <button class="btn-ver"    onclick="verDetallesMensualidad('${m.id}')">Ver</button>
                <button class="btn-editar" onclick="editarMensualidad('${m.id}')">Editar</button>
                <button class="btn-renovar" onclick="renovarMensualidad('${m.id}')">Renovar</button>
                <button class="btn-borrar" onclick="borrarMensualidad('${m.id}')">Borrar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// ─── MODAL NUEVA / EDITAR / RENOVAR MENSUALIDAD ──────────────────────────────

let idMensEdicion = null;
let modoModal     = 'nueva'; // 'nueva' | 'renovar' | 'editar'

function abrirModalNuevaMensualidad() {
    idMensEdicion = null;
    modoModal     = 'nueva';
    document.getElementById('modalMensTitulo').textContent = 'Nueva Mensualidad';
    document.getElementById('mensPlaca').value       = '';
    document.getElementById('mensPropietario').value = '';
    document.getElementById('mensTipo').value        = 'Carro';
    document.getElementById('mensMetodo').value      = 'Efectivo';
    document.getElementById('mensPlaca').disabled    = false;
    document.getElementById('modalMensualidad').style.display = 'flex';
}

function cerrarModalMensualidad() {
    document.getElementById('modalMensualidad').style.display = 'none';
    idMensEdicion = null;
    modoModal     = 'nueva';
}

function registrarPagoEnHistorial(placa, tipo, metodo, esRenovacion) {
    const ahora = new Date();
    const hoy   = fechaLocalISO(ahora);
    const hora  = horaLocalHHMM(ahora);
    const monto = tarifaMensual(tipo);
    const salidas = JSON.parse(localStorage.getItem(SALIDAS_KEY) || '[]');
    salidas.push({
        id:                Date.now(),
        placa,
        tipo,
        espacio:           'N/A',
        modalidad:         'mensual',
        fechaEntrada:      hoy,
        horaEntrada:       hora,
        fechaSalida:       hoy,
        horaSalida:        hora,
        tiempoMin:         0,
        detalleCobro:      esRenovacion ? 'Renovación mensualidad — 30 días' : 'Pago mensualidad — 30 días',
        totalCobrado:      monto,
        metodoPago:        metodo,
        esMensual:         true,
        esPagoMensualidad: true
    });
    localStorage.setItem(SALIDAS_KEY, JSON.stringify(salidas));
}

function guardarMensualidad() {
    const placa       = document.getElementById('mensPlaca').value.trim().toUpperCase();
    const propietario = document.getElementById('mensPropietario').value.trim();
    const tipo        = document.getElementById('mensTipo').value;
    const metodo      = document.getElementById('mensMetodo').value;

    if (!placa || !propietario) {
        alert('Completa los campos obligatorios.');
        return;
    }

    const lista = cargarMensualidadesDB();

    if (modoModal === 'editar') {
        // Solo actualiza datos — sin cambiar fechas ni registrar pago
        const index = lista.findIndex(m => m.id === idMensEdicion);
        if (index !== -1) {
            lista[index].propietario = propietario;
            lista[index].tipo        = tipo;
            lista[index].metodoPago  = metodo;
            lista[index].monto       = tarifaMensual(tipo);
            guardarMensualidadesDB(lista);
            alert(`Datos de mensualidad de ${placa} actualizados.`);
        }

    } else if (modoModal === 'renovar') {
        // Extiende 30 días y registra pago en historial
        const index = lista.findIndex(m => m.id === idMensEdicion);
        if (index !== -1) {
            const hoy            = fechaLocalISO(new Date());
            const baseRenovacion = lista[index].fechaVencimiento > hoy
                ? lista[index].fechaVencimiento
                : hoy;
            lista[index].fechaVencimiento = sumarDias(baseRenovacion, 30);
            lista[index].metodoPago       = metodo;
            lista[index].propietario      = propietario;
            lista[index].tipo             = tipo;
            lista[index].monto            = tarifaMensual(tipo);
            guardarMensualidadesDB(lista);
            registrarPagoEnHistorial(placa, tipo, metodo, true);
            alert(`Mensualidad de ${placa} renovada hasta ${formatearMostrar(lista[index].fechaVencimiento, null)}.`);
        }

    } else {
        // Nueva mensualidad
        const duplicado = lista.find(m => m.placa === placa && estadoMensualidad(m.fechaVencimiento) !== 'vencida');
        if (duplicado) {
            alert(`Ya existe una mensualidad activa o próxima para la placa ${placa}.`);
            return;
        }
        const hoy = fechaLocalISO(new Date());
        const nueva = {
            id:               String(Date.now()),
            placa,
            propietario,
            tipo,
            metodoPago:       metodo,
            fechaInicio:      hoy,
            fechaVencimiento: sumarDias(hoy, 30),
            monto:            tarifaMensual(tipo)
        };
        lista.push(nueva);
        guardarMensualidadesDB(lista);
        registrarPagoEnHistorial(placa, tipo, metodo, false);
        alert(`Mensualidad registrada para ${placa}. Vence el ${formatearMostrar(nueva.fechaVencimiento, null)}.`);
    }

    cerrarModalMensualidad();
    cargarMensualidades();
}

function editarMensualidad(id) {
    const lista = cargarMensualidadesDB();
    const m = lista.find(x => x.id === id);
    if (!m) return;

    idMensEdicion = id;
    modoModal     = 'editar';
    document.getElementById('modalMensTitulo').textContent = 'Editar Mensualidad';
    document.getElementById('mensPlaca').value       = m.placa;
    document.getElementById('mensPropietario').value = m.propietario || '';
    document.getElementById('mensTipo').value        = m.tipo;
    document.getElementById('mensMetodo').value      = m.metodoPago || 'Efectivo';
    document.getElementById('mensPlaca').disabled    = true;
    document.getElementById('modalMensualidad').style.display = 'flex';
}

function borrarMensualidad(id) {
    const lista = cargarMensualidadesDB();
    const m = lista.find(x => x.id === id);
    if (!m) return;
    if (!confirm(`¿Eliminar la mensualidad de la placa ${m.placa}? Esta acción no se puede deshacer.`)) return;
    const nueva = lista.filter(x => x.id !== id);
    guardarMensualidadesDB(nueva);
    cargarMensualidades();
}

function renovarMensualidad(id) {
    const lista = cargarMensualidadesDB();
    const m = lista.find(x => x.id === id);
    if (!m) return;

    idMensEdicion = id;
    modoModal     = 'renovar';
    document.getElementById('modalMensTitulo').textContent = 'Renovar Mensualidad';
    document.getElementById('mensPlaca').value       = m.placa;
    document.getElementById('mensPropietario').value = m.propietario || '';
    document.getElementById('mensTipo').value        = m.tipo;
    document.getElementById('mensMetodo').value      = m.metodoPago || 'Efectivo';
    document.getElementById('mensPlaca').disabled    = true;
    document.getElementById('modalMensualidad').style.display = 'flex';
}

function verDetallesMensualidad(id) {
    const lista = cargarMensualidadesDB();
    const m = lista.find(x => x.id === id);
    if (!m) return;

    const estado = estadoMensualidad(m.fechaVencimiento);
    const etiquetas = { activa: 'Activa', proxima: 'Próxima a vencer', vencida: 'Vencida' };

    alert(
        `Mensualidad — ${m.placa}\n` +
        `Propietario: ${m.propietario || '-'}\n` +
        `Tipo: ${m.tipo}\n` +
        `Inicio: ${formatearMostrar(m.fechaInicio, null)}\n` +
        `Vencimiento: ${formatearMostrar(m.fechaVencimiento, null)}\n` +
        `Estado: ${etiquetas[estado]}\n` +
        `Monto: ${formatearPesos(m.monto)}\n` +
        `Último método de pago: ${m.metodoPago || '-'}`
    );
}


// ─── ALERTAS EN DASHBOARD (exportada para uso externo) ────────────────────────
// dashboard.js puede llamar a obtenerAlertasMensualidades() para mostrar alertas

function obtenerAlertasMensualidades() {
    const lista = cargarMensualidadesDB();
    const alertas = [];
    lista.forEach(m => {
        const estado = estadoMensualidad(m.fechaVencimiento);
        if (estado === 'vencida') {
            alertas.push(`Mensualidad vencida: ${m.placa} (venció ${formatearMostrar(m.fechaVencimiento, null)})`);
        } else if (estado === 'proxima') {
            const dias = diasHastaVencimiento(m.fechaVencimiento);
            alertas.push(`Mensualidad próxima: ${m.placa} (vence en ${dias} día${dias !== 1 ? 's' : ''})`);
        }
    });
    return alertas;
}


// ─── INICIO ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    inicializarFiltrosHistorial();
    cargarHistorial();
});
