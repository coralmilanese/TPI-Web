// src/Pages/DetalleImagen.js
import React from "react";

function DetalleImagen() {
  return (
    <div className="container py-5">
      <div className="card p-4">
        <h1>Detalle de imagen</h1>
        <p className="small" style={{ color: "var(--muted)" }}>Aquí se mostrará la vista ampliada de la obra con metadatos completos, comentarios y opciones de interacción (favoritos, compartir, 3D / video si corresponde).</p>
      </div>
    </div>
  );
}

export default DetalleImagen;
