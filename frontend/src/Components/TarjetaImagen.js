import React from "react";

export default function TarjetaImagen({
  img,
  onView,
  onFavorite,
  isFavorite,
  isAdmin,
  onEdit,
  onDelete,
  user,
}) {
  return (
    <div className="card h-100 shadow-sm">
      <img
        src={img.url}
        alt={img.titulo}
        className="card-img-top img-fluid w-100"
        style={{ objectFit: "cover", height: "180px", cursor: "pointer" }}
        onClick={onView}
      />
      <div className="card-body">
        <h5 className="card-title">{img.titulo}</h5>
        <p>
          <strong>Autor:</strong> {img.autor || "Anónimo"}
        </p>
        <p>
          <strong>Categoría:</strong> {img.categoria || "Sin categoría"}
        </p>
        <p className="text-muted">{img.descripcion?.slice(0, 80)}</p>
        <div className="d-flex justify-content-between mt-2">
          <div>
            <button
              className="btn btn-outline-primary btn-sm me-2"
              onClick={onView}
            >
              Ver
            </button>
            {user && (
              <button
                className={`btn btn-sm me-2 ${
                  isFavorite ? "btn-warning" : "btn-outline-warning"
                }`}
                onClick={onFavorite}
                aria-pressed={!!isFavorite}
              >
                {isFavorite ? "★ Favorito" : "☆ Favorito"}
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  className="btn btn-outline-warning btn-sm me-2"
                  onClick={onEdit}
                >
                  Editar
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={onDelete}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
          <small className="text-muted">
            {new Date(img.creado_en).toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );
}
