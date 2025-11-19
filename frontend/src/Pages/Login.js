// src/Pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMensaje("Inicio de sesión exitoso ✔");
      setTimeout(()=> navigate("/galeria"), 600);
    } catch (error) {
      setMensaje("Credenciales incorrectas ❌");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "86vh" }}>
      <div style={{ width: 420 }}>
        <div className="card p-4">
          <h2 className="text-center mb-3">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>

            <button className="btn btn-primary w-100 mb-2" type="submit">Ingresar</button>
          </form>

          {mensaje && <p className="text-center small" style={{ marginTop: 8 }}>{mensaje}</p>}

          <div className="text-center mt-2">
            <small className="small">¿No tenés cuenta? <a href="/registrarse">Registrate</a></small>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
