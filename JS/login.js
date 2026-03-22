document.getElementById("loginForm").addEventListener("submit", function(event){

    event.preventDefault();

    let usuario  = document.getElementById("usuario").value.trim();
    let password = document.getElementById("password").value.trim();
    let mensaje  = document.getElementById("mensajeError");

    mensaje.textContent = "";

    if (usuario === "" || password === "") {
        mensaje.textContent = "Todos los campos son obligatorios";
        return;
    }

    // ─── INTENTAR LOGIN CON USUARIOS_DB ──────────────────────────────────────
    // Primero busca en los usuarios registrados en el sistema

    const usuarios     = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
    const userEncontrado = usuarios.find(u =>
        (u.correo === usuario || u.nombre === usuario) &&
        u.contrasena === password &&
        u.estado === 'activo'
    );

    if (userEncontrado) {
        localStorage.setItem('session', JSON.stringify({
            id:        userEncontrado.id,
            nombre:    userEncontrado.nombre,
            correo:    userEncontrado.correo,
            rol:       userEncontrado.rol,
            telefono:  userEncontrado.telefono  || '-',
            documento: userEncontrado.documento || '-'
        }));
        window.location.href = "dashboard.html";
        return;
    }

    // ─── FALLBACK: CREDENCIALES HARDCODEADAS ─────────────────────────────────
    // Si no hay usuarios en la DB todavía, permite entrar con admin/12345

    const usuarioValido  = "admin";
    const passwordValida = "12345";

    if (usuario === usuarioValido && password === passwordValida) {
        localStorage.setItem('session', JSON.stringify({
            id:        0,
            nombre:    'Administrador',
            correo:    'admin@autoscolombia.com',
            rol:       'Administrador',
            telefono:  '-',
            documento: '-'
        }));
        window.location.href = "dashboard.html";
        return;
    }

    // ─── CREDENCIALES INCORRECTAS ─────────────────────────────────────────────

    mensaje.textContent = "Usuario o contraseña incorrectos";

});