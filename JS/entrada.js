document.getElementById("formEntrada").addEventListener("submit", function(e){

e.preventDefault();

let placa = document.getElementById("placa").value;
let espacio = document.getElementById("espacio").value;

if(placa === "" || espacio === ""){
alert("Debe completar los campos obligatorios");
return;
}

let datos = {
placa: placa,
tipo: document.getElementById("tipo").value,
propietario: document.getElementById("propietario").value,
telefono: document.getElementById("telefono").value,
espacio: espacio,
fecha: document.getElementById("fecha").value,
hora: document.getElementById("hora").value,
obs: document.getElementById("obs").value
};

console.log("Vehículo registrado:", datos);

alert("Vehículo registrado correctamente");

document.getElementById("formEntrada").reset();

});