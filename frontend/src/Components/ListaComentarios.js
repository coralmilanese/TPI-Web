import React from "react";

export default function ListaComentarios({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="text-muted">Aún no hay comentarios aprobados.</p>;
  }
  return (
    <div className="list-group mb-3">
      {comments.map((c) => (
        <div key={c.id} className="list-group-item">
          <div className="d-flex w-100 justify-content-between">
            <strong>{c.usuario || "Anónimo"}</strong>
            <small className="text-muted">
              {c.creado_en ? new Date(c.creado_en).toLocaleString() : ""}
            </small>
          </div>
          <p className="mb-0">{c.contenido}</p>
        </div>
      ))}
    </div>
  );
}
