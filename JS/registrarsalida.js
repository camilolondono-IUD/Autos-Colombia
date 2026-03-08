function buscarVehiculo(){

let placa = document.getElementById("placa").value.trim();

if(placa === ""){
alert("Ingrese una placa");
return;
}

/* simulación de entrada */

let entrada = new Date();
entrada.setHours(entrada.getHours() - 3);

let ahora = new Date();

let horas = Math.floor((ahora - entrada) / 3600000);

let tarifa = 2000;

let total = horas * tarifa;

document.getElementById("placeholder").style.display="none";
document.getElementById("info").style.display="block";

document.getElementById("vplaca").innerText = placa.toUpperCase();

document.getElementById("ventrada").innerText =
entrada.toLocaleTimeString();

document.getElementById("vtiempo").innerText =
horas + " horas";

document.getElementById("vpago").innerText =
"$" + total;

}


function registrarSalida(){

alert("Salida registrada correctamente");

document.getElementById("info").style.display="none";

document.getElementById("placeholder").style.display="block";

document.getElementById("placa").value="";

}

// Navegación del menú lateral
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.menu a');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            switch(text) {
                case 'Dashboard':
                    window.location.href = 'dashboard.html';
                    break;
                case 'Registrar Entrada':
                    window.location.href = 'entrada.html';
                    break;
                case 'Registrar Salida':
                    window.location.href = 'registrarsalida.html';
                    break;
                case 'Espacios':
                    window.location.href = 'espacios.html';
                    break;
                case 'Reportes':
                    window.location.href = 'reportes.html';
                    break;
            }
        });
    });
});