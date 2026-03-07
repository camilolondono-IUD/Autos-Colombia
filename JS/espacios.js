const espacios = [
{numero:"A-10", estado:"disponible"},
{numero:"A-11", estado:"disponible"},
{numero:"A-12", estado:"mantenimiento"},
{numero:"A-13", estado:"ocupado", placa:"ABC-123"},
{numero:"A-14", estado:"ocupado", placa:"DEF-456"},
{numero:"A-15", estado:"ocupado", placa:"GHI-789"},

{numero:"B-01", estado:"disponible"},
{numero:"B-02", estado:"disponible"},
{numero:"B-03", estado:"disponible"},
{numero:"B-04", estado:"ocupado", placa:"JKL-012"},
{numero:"B-05", estado:"ocupado", placa:"MNO-345"},
{numero:"B-06", estado:"disponible"},

{numero:"C-01", estado:"disponible"},
{numero:"C-02", estado:"ocupado", placa:"PQR-678"},
{numero:"C-03", estado:"disponible"},
{numero:"C-04", estado:"disponible"},
{numero:"C-05", estado:"ocupado", placa:"STU-901"}
];

function render(lista){

const grid = document.getElementById("gridEspacios");
grid.innerHTML="";

lista.forEach(e=>{

const div=document.createElement("div");

div.className="space "+e.estado;

div.innerHTML=`
<div>${e.numero}</div>
${e.placa ? `<small>${e.placa}</small>` : ""}
`;

grid.appendChild(div);

});

actualizarContadores();

}

function actualizarContadores(){

let disponibles=espacios.filter(e=>e.estado==="disponible").length;
let ocupados=espacios.filter(e=>e.estado==="ocupado").length;
let mantenimiento=espacios.filter(e=>e.estado==="mantenimiento").length;

document.getElementById("disponibles").innerText=disponibles;
document.getElementById("ocupados").innerText=ocupados;
document.getElementById("mantenimiento").innerText=mantenimiento;

}

function filtrar(zona){

document.querySelectorAll(".filters button").forEach(b=>b.classList.remove("active"));
event.target.classList.add("active");

if(zona==="todas"){
render(espacios);
return;
}

const filtrados=espacios.filter(e=>e.numero.startsWith(zona));

render(filtrados);

}

render(espacios);