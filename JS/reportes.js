// ─── CLAVES localStorage ──────────────────────────────────────────────────────

const ENTRADAS_KEY = 'registros_entrada';
const SALIDAS_KEY  = 'registros_salida';


// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function fechaLocalISO(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function formatearPesos(valor) {
    return '$' + Math.round(valor).toLocaleString('es-CO');
}

// Retorna array de fechas "YYYY-MM-DD" entre desde y hasta (inclusive)
function rangoFechas(desde, hasta) {
    const fechas = [];
    const cur = new Date(desde + 'T00:00:00');
    const fin = new Date(hasta + 'T00:00:00');
    while (cur <= fin) {
        fechas.push(fechaLocalISO(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return fechas;
}

// Etiqueta corta para mostrar en gráfico "DD/MM"
function etiquetaCorta(fechaISO) {
    const [, mm, dd] = fechaISO.split('-');
    return `${dd}/${mm}`;
}


// ─── INICIALIZAR FECHAS DEL FILTRO ────────────────────────────────────────────

function inicializarFiltros() {
    const hoy    = new Date();
    const hace7  = new Date();
    hace7.setDate(hoy.getDate() - 6);

    document.getElementById('fechaDesde').value = fechaLocalISO(hace7);
    document.getElementById('fechaHasta').value = fechaLocalISO(hoy);
}


// ─── OBTENER DATOS FILTRADOS ──────────────────────────────────────────────────

function obtenerDatosFiltrados() {
    const desde   = document.getElementById('fechaDesde').value;
    const hasta   = document.getElementById('fechaHasta').value;

    const salidas  = JSON.parse(localStorage.getItem(SALIDAS_KEY)  || '[]');
    const entradas = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]');

    // Filtrar por rango de fechas
    const salidasFiltradas  = salidas.filter(r =>
        r.fechaSalida >= desde && r.fechaSalida <= hasta
    );
    const entradasFiltradas = entradas.filter(r =>
        r.fecha >= desde && r.fecha <= hasta
    );

    return { desde, hasta, salidasFiltradas, entradasFiltradas };
}


// ─── ACTUALIZAR CARDS ─────────────────────────────────────────────────────────

function actualizarCards(salidasFiltradas, entradasFiltradas, desde, hasta) {
    const ingresos  = salidasFiltradas.reduce((a, r) => a + (r.totalCobrado || 0), 0);
    const vehiculos = entradasFiltradas.length;

    const dias      = rangoFechas(desde, hasta).length || 1;
    const promedio  = Math.round(vehiculos / dias);

    document.getElementById('cardIngresos').textContent  = formatearPesos(ingresos);
    document.getElementById('cardVehiculos').textContent = vehiculos;
    document.getElementById('cardPromedio').textContent  = promedio;

    // Comparación con periodo anterior (mismo número de días antes)
    const desdePrev = new Date(desde + 'T00:00:00');
    desdePrev.setDate(desdePrev.getDate() - dias);
    const hastaPrev = new Date(desde + 'T00:00:00');
    hastaPrev.setDate(hastaPrev.getDate() - 1);

    const prevISO  = fechaLocalISO(desdePrev);
    const hastaISO = fechaLocalISO(hastaPrev);

    const salidasPrev  = JSON.parse(localStorage.getItem(SALIDAS_KEY)  || '[]')
        .filter(r => r.fechaSalida >= prevISO && r.fechaSalida <= hastaISO);
    const entradasPrev = JSON.parse(localStorage.getItem(ENTRADAS_KEY) || '[]')
        .filter(r => r.fecha >= prevISO && r.fecha <= hastaISO);

    const ingresosPrev  = salidasPrev.reduce((a, r) => a + (r.totalCobrado || 0), 0);
    const vehiculosPrev = entradasPrev.length;

    const compIngresos  = ingresosPrev > 0
        ? Math.round(((ingresos  - ingresosPrev)  / ingresosPrev)  * 100)
        : null;
    const compVehiculos = vehiculosPrev > 0
        ? Math.round(((vehiculos - vehiculosPrev) / vehiculosPrev) * 100)
        : null;

    const spanIngresos  = document.getElementById('cardIngresosComp');
    const spanVehiculos = document.getElementById('cardVehiculosComp');

    spanIngresos.textContent  = compIngresos  !== null
        ? `${compIngresos  >= 0 ? '+' : ''}${compIngresos}% vs periodo anterior`  : '';
    spanVehiculos.textContent = compVehiculos !== null
        ? `${compVehiculos >= 0 ? '+' : ''}${compVehiculos}% vs periodo anterior` : '';

    spanIngresos.style.color  = compIngresos  >= 0 ? '#16a34a' : '#dc2626';
    spanVehiculos.style.color = compVehiculos >= 0 ? '#16a34a' : '#dc2626';
}


// ─── INSTANCIAS DE CHARTS ─────────────────────────────────────────────────────

let chartIngresos  = null;
let chartVehiculos = null;
let chartTipo      = null;
let chartHora      = null;

function destruirCharts() {
    if (chartIngresos)  { chartIngresos.destroy();  chartIngresos  = null; }
    if (chartVehiculos) { chartVehiculos.destroy(); chartVehiculos = null; }
    if (chartTipo)      { chartTipo.destroy();      chartTipo      = null; }
    if (chartHora)      { chartHora.destroy();      chartHora      = null; }
}


// ─── GRÁFICO: INGRESOS DIARIOS ────────────────────────────────────────────────

function graficoIngresos(salidasFiltradas, desde, hasta) {
    const fechas  = rangoFechas(desde, hasta);
    const valores = fechas.map(f =>
        salidasFiltradas
            .filter(r => r.fechaSalida === f)
            .reduce((a, r) => a + (r.totalCobrado || 0), 0)
    );

    chartIngresos = new Chart(document.getElementById('ingresosChart'), {
        type: 'bar',
        data: {
            labels:   fechas.map(etiquetaCorta),
            datasets: [{
                label:           'Ingresos (COP)',
                data:            valores,
                backgroundColor: '#3b82f6',
                borderRadius:    4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { callback: v => '$' + v.toLocaleString('es-CO') } }
            }
        }
    });
}


// ─── GRÁFICO: VEHÍCULOS POR DÍA ──────────────────────────────────────────────

function graficoVehiculos(entradasFiltradas, desde, hasta) {
    const fechas  = rangoFechas(desde, hasta);
    const valores = fechas.map(f =>
        entradasFiltradas.filter(r => r.fecha === f).length
    );

    chartVehiculos = new Chart(document.getElementById('vehiculosChart'), {
        type: 'line',
        data: {
            labels:   fechas.map(etiquetaCorta),
            datasets: [{
                label:       'Vehículos',
                data:        valores,
                borderColor: '#10b981',
                fill:        false,
                tension:     0.4,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}


// ─── GRÁFICO: DISTRIBUCIÓN POR TIPO ──────────────────────────────────────────

function graficoTipo(entradasFiltradas) {
    const tipos   = ['Carro', 'Moto', 'Camioneta', 'Van'];
    const valores = tipos.map(t =>
        entradasFiltradas.filter(r => r.tipo === t).length
    );

    chartTipo = new Chart(document.getElementById('tipoChart'), {
        type: 'pie',
        data: {
            labels:   tipos,
            datasets: [{
                data:            valores,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}


// ─── GRÁFICO: OCUPACIÓN POR HORA ─────────────────────────────────────────────

function graficoHora(entradasFiltradas) {
    const horas   = Array.from({ length: 24 }, (_, i) => i);
    const valores = horas.map(h =>
        entradasFiltradas.filter(r => {
            if (!r.hora) return false;
            return parseInt(r.hora.split(':')[0]) === h;
        }).length
    );

    // Mostrar solo horas con datos o rango 6-22
    const etiquetas = horas.map(h => {
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12  = h % 12 || 12;
        return `${h12}${ampm}`;
    });

    chartHora = new Chart(document.getElementById('horaChart'), {
        type: 'bar',
        data: {
            labels:   etiquetas,
            datasets: [{
                label:           'Vehículos',
                data:            valores,
                backgroundColor: '#f59e0b',
                borderRadius:    4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize:  1,
                        precision: 0
                    }
                }
            }
        }
    });
}


// ─── APLICAR FILTROS Y RENDERIZAR TODO ───────────────────────────────────────

function aplicarFiltros() {
    const { desde, hasta, salidasFiltradas, entradasFiltradas } = obtenerDatosFiltrados();

    if (!desde || !hasta || desde > hasta) return;

    destruirCharts();
    actualizarCards(salidasFiltradas, entradasFiltradas, desde, hasta);
    graficoIngresos(salidasFiltradas, desde, hasta);
    graficoVehiculos(entradasFiltradas, desde, hasta);
    graficoTipo(entradasFiltradas);
    graficoHora(entradasFiltradas);
}


// ─── EXPORTAR PDF ────────────────────────────────────────────────────────────

async function exportarPDF() {
    const btn = document.querySelector('.export');
    const textoOriginal = btn.textContent;
    btn.textContent = 'Generando PDF...';
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf    = new jsPDF('p', 'mm', 'a4');
        const main   = document.querySelector('.main');
        const canvas = await html2canvas(main, {
            scale:            2,
            useCORS:          true,
            backgroundColor:  '#f5f7fb',
            scrollX:          0,
            scrollY:          -window.scrollY
        });

        const imgData   = canvas.toDataURL('image/png');
        const pdfW      = pdf.internal.pageSize.getWidth();
        const pdfH      = pdf.internal.pageSize.getHeight();
        const imgW      = pdfW;
        const imgH      = (canvas.height * imgW) / canvas.width;

        // Si el contenido es más alto que una página, dividir en páginas
        let yPos = 0;
        while (yPos < imgH) {
            if (yPos > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
            yPos += pdfH;
        }

        const desde = document.getElementById('fechaDesde').value;
        const hasta  = document.getElementById('fechaHasta').value;
        pdf.save(`reporte_autos_colombia_${desde}_${hasta}.pdf`);

    } catch (err) {
        console.error('Error generando PDF:', err);
        alert('Hubo un error al generar el PDF. Intentá de nuevo.');
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled    = false;
    }
}


// ─── INICIO ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    inicializarFiltros();
    aplicarFiltros();
});