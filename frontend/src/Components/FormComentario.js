import React from "react";

export default function FormComentario({
  user,
  commentText,
  setCommentText,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <label className="form-label">Dejar un comentario</label>
      {user ? (
        <div className="mb-2">
          <small className="text-muted">Comentando como {user.nombre}</small>
        </div>
      ) : (
        <div className="mb-2">
          <small className="text-muted">
            Puedes comentar como invitado; el comentario quedará pendiente de
            aprobación.
          </small>
        </div>
      )}
      <textarea
        className="form-control mb-2"
        rows={3}
        maxLength={250}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Escribe tu comentario (máx. 250 caracteres)"
      />
      <div className="d-flex justify-content-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!commentText || commentText.trim() === ""}
        >
          Enviar comentario
        </button>
      </div>
    </form>
  );
}
