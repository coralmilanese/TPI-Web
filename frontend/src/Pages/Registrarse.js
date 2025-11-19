import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Registrarse() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // El rol no debe poder seleccionarse en el frontend; siempre será 'visitante'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function validate() {
    setError("");
    if (!nombre.trim() || !email.trim() || !password) {
      setError("Completa los campos obligatorios.");
      return false;
    }
    // email simple
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) {
      setError("Introduce un email válido.");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        rol: "visitante",
      };
      const res = await axios.post(
        "http://localhost:4000/api/auth/register",
        payload
      );
      setSuccess(res.data?.mensaje || "Registro exitoso");
      // redirigir a login tras 1.2s
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Error registro:", err);
      const msg =
        err?.response?.data?.error || "Error al registrar. Intenta más tarde.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">Crear cuenta</h2>

          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && (
              <div className="alert alert-success">
                {success} — redirigiendo a login...
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar contraseña</label>
              <input
                className="form-control"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate("/login")}
              >
                Ya tengo cuenta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registrarse;
