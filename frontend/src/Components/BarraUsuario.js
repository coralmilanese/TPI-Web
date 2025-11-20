import React from "react";

export default function BarraUsuario({ user, onLogout, onLogin, onRegister }) {
  return user ? (
    <>
      <span className="me-2">
        Hola, {user.nombre} ({user.rol})
      </span>
      <button
        className="btn btn-sm btn-outline-secondary me-2"
        onClick={onLogout}
      >
        Cerrar sesión
      </button>
    </>
  ) : (
    <>
      <button className="btn btn-sm btn-primary me-2" onClick={onLogin}>
        Iniciar sesión
      </button>
      <button className="btn btn-sm btn-outline-primary" onClick={onRegister}>
        Registrarse
      </button>
    </>
  );
}
