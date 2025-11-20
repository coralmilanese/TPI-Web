import React from "react";

export default function ListaComentariosPendientes({
  pendingComments,
  loadingPending,
  onModerate,
  moderatingId,
}) {
  if (loadingPending)
    return <p className="text-muted">Cargando comentarios pendientes...</p>;
  if (!pendingComments || pendingComments.length === 0)
    return (
      <p className="text-muted">
        No hay comentarios pendientes para esta imagen.
      </p>
    );
  return (
    <div className="list-group mb-2">
      {pendingComments.map((c) => (
        <div key={c.id} className="list-group-item">
          <div className="d-flex w-100 justify-content-between">
            <strong>{c.usuario || "Anónimo"}</strong>
            <small className="text-muted">
              {c.creado_en ? new Date(c.creado_en).toLocaleString() : ""}
            </small>
          </div>
          <p className="mb-2">{c.contenido}</p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() => onModerate(c.id, "aprobado")}
              disabled={moderatingId === c.id}
            >
              {moderatingId === c.id ? "Procesando..." : "Aprobar"}
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onModerate(c.id, "rechazado")}
              disabled={moderatingId === c.id}
            >
              {moderatingId === c.id ? "Procesando..." : "Rechazar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
