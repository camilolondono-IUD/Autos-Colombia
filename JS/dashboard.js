function agregarVehiculo(){

let tabla = document.getElementById("tablaVehiculos");

let fila = document.createElement("tr");

fila.innerHTML = `
<td>NEW-001</td>
<td>C-20</td>
<td>${new Date().toLocaleTimeString()}</td>
<td>Carro</td>
<td><span class="estado">Activo</span></td>
`;

tabla.prepend(fila);

}

document.querySelector(".blue").addEventListener("click", agregarVehiculo);