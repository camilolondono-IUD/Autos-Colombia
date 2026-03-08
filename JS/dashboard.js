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

// Navegación del menú lateral
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('nav ul li');
    
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