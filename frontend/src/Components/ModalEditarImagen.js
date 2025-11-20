import React from "react";

export default function ModalEditarImagen({
  show,
  onClose,
  categorias,
  editData,
  setEditData,
  onSubmit,
}) {
  if (!show) return null;
  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Imagen</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                value={editData.titulo}
                onChange={(e) =>
                  setEditData({ ...editData, titulo: e.target.value })
                }
                required
              />
              <label className="form-label mt-3">Categoría</label>
              <select
                className="form-select"
                value={editData.categoria_id}
                onChange={(e) =>
                  setEditData({ ...editData, categoria_id: e.target.value })
                }
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <label className="form-label mt-3">Autor</label>
              <input
                className="form-control"
                value={editData.autor}
                onChange={(e) =>
                  setEditData({ ...editData, autor: e.target.value })
                }
                required
              />
              <label className="form-label mt-3">Descripción</label>
              <textarea
                className="form-control"
                value={editData.descripcion}
                onChange={(e) =>
                  setEditData({ ...editData, descripcion: e.target.value })
                }
              />
              <label className="form-label mt-3">Palabras clave</label>
              <input
                className="form-control"
                value={editData.palabras_clave}
                onChange={(e) =>
                  setEditData({ ...editData, palabras_clave: e.target.value })
                }
              />
              <label className="form-label mt-3">
                Reemplazar imagen (opcional)
              </label>
              <input
                type="file"
                className="form-control"
                accept=".jpg,.jpeg,.png"
                onChange={(e) =>
                  setEditData({ ...editData, archivo: e.target.files[0] })
                }
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
