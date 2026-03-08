document.getElementById("loginForm").addEventListener("submit", function(event){

    event.preventDefault();

    let usuario = document.getElementById("usuario").value.trim();
    let password = document.getElementById("password").value.trim();
    let mensaje = document.getElementById("mensajeError");

    mensaje.textContent = "";

    if(usuario === "" || password === ""){
        mensaje.textContent = "Todos los campos son obligatorios";
        return;
    }

    const usuarioValido = "admin";
    const passwordValida = "12345";

    if(usuario === usuarioValido && password === passwordValida){

        // alert("Bienvenido al sistema Autos Colombia");

        window.location.href = "dashboard.html";

    } else {

        mensaje.textContent = "Usuario o contraseña incorrectos";

    }

});