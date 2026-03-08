const ingresosCtx = document.getElementById('ingresosChart');

new Chart(ingresosCtx,{
type:'bar',
data:{
labels:["1 Mar","2 Mar","3 Mar","4 Mar","5 Mar","6 Mar"],
datasets:[{
label:"Ingresos (COP)",
data:[420000,380000,520000,450000,400000,500000],
backgroundColor:"#3b82f6"
}]
}
});


const vehiculosCtx=document.getElementById('vehiculosChart');

new Chart(vehiculosCtx,{
type:'line',
data:{
labels:["1 Mar","2 Mar","3 Mar","4 Mar","5 Mar","6 Mar"],
datasets:[{
label:"Vehículos",
data:[150,135,175,150,140,160],
borderColor:"#10b981",
fill:false,
tension:0.4
}]
}
});


const tipoCtx=document.getElementById('tipoChart');

new Chart(tipoCtx,{
type:'pie',
data:{
labels:["Carros","Motos","Camionetas","Vans"],
datasets:[{
data:[45,28,18,9],
backgroundColor:[
"#3b82f6",
"#10b981",
"#f59e0b",
"#8b5cf6"
]
}]
}
});

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


const horaCtx=document.getElementById('horaChart');

new Chart(horaCtx,{
type:'bar',
data:{
labels:["06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"],
datasets:[{
label:"Vehículos",
data:[12,35,48,60,55,52,42,28,15],
backgroundColor:"#f59e0b"
}]
}
});