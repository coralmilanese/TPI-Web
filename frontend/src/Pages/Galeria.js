// frontend/src/Pages/Galeria.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Galeria() {
  const [imagenes, setImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // filtros
  const [filters, setFilters] = useState({
    categoria: "",
    autor: "",
    q: "",
    date_from: "",
    date_to: "",
    page: 1,
    pageSize: 12,
  });

  // auth
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const token = localStorage.getItem("token") || null;
  const isAdmin = user?.rol === "admin";

  const navigate = useNavigate();

  // modal ver
  const [selectedIndex, setSelectedIndex] = useState(null);
  // comentarios
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [pendingComments, setPendingComments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // modal editar
  const [editData, setEditData] = useState({
    id: null,
    titulo: "",
    categoria_id: "",
    autor: "",
    descripcion: "",
    palabras_clave: "",
    archivo: null,
  });
  console.log(filters);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCategorias();
    loadImagenes();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadImagenes(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [filters]);

  async function loadCategorias() {
    try {
      const res = await axios.get("http://localhost:4000/api/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error("Error categorias", err);
    }
  }

  async function loadImagenes() {
    try {
      const res = await axios.get("http://localhost:4000/api/imagenes");
      setImagenes(res.data || []);
    } catch (err) {
      console.error("Error cargando imágenes", err);
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value, page: 1 }));
  };

  // ----------------- AUTH helpers -----------------
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  function authHeaders() {
    const t = localStorage.getItem("token") || null;
    return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
  }

  const [moderatingId, setModeratingId] = useState(null);

  // ----------------- VER / MODAL -----------------
  const openDetail = (index) => setSelectedIndex(index);
  const closeDetail = () => setSelectedIndex(null);
  const prevImage = () =>
    setSelectedIndex((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  const nextImage = () =>
    setSelectedIndex((i) => (i === imagenes.length - 1 ? 0 : i + 1));

  // cargar comentarios cuando se abre el modal de detalle
  useEffect(() => {
    if (selectedIndex === null) return;
    const img = imagenes[selectedIndex];
    if (!img) return;
    loadComments(img.id);
    // eslint-disable-next-line
  }, [selectedIndex]);

  async function loadComments(imagenId) {
    try {
      setLoadingComments(true);
      const res = await axios.get(
        `http://localhost:4000/api/comentarios/imagen/${imagenId}`
      );
      setComments(res.data || []);
    } catch (err) {
      console.error("Error cargando comentarios", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
    // si es admin, cargar pendientes para esta imagen
    if (isAdmin) {
      try {
        setLoadingPending(true);
        const res2 = await axios.get(
          "http://localhost:4000/api/comentarios/pendientes",
          authHeaders()
        );
        const allPending = res2.data || [];
        const filtered = allPending.filter((c) => c.imagen_id === imagenId);
        setPendingComments(filtered);
      } catch (err) {
        console.error("Error cargando comentarios pendientes", err);
        setPendingComments([]);
      } finally {
        setLoadingPending(false);
      }
    } else {
      setPendingComments([]);
    }
  }

  async function handleModerate(commentId, estado) {
    if (!isAdmin)
      return alert("Solo administradores pueden moderar comentarios.");
    if (!window.confirm(`¿Confirmar ${estado} del comentario?`)) return;
    try {
      setModeratingId(commentId);
      await axios.put(
        `http://localhost:4000/api/comentarios/${commentId}`,
        { estado },
        authHeaders()
      );
      alert("Comentario actualizado correctamente");
      // recargar listas para la imagen abierta
      const img = imagenes[selectedIndex];
      if (img) loadComments(img.id);
    } catch (err) {
      console.error("Error moderando comentario", err);
      alert("No se pudo actualizar el comentario");
    } finally {
      setModeratingId(null);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText || commentText.trim().length === 0)
      return alert("Escribe un comentario antes de enviar.");
    if (commentText.length > 250)
      return alert("El comentario no puede superar 250 caracteres.");

    const imagen = imagenes[selectedIndex];
    if (!imagen) return;

    try {
      const payload = {
        imagen_id: imagen.id,
        contenido: commentText.trim(),
      };
      if (user && user.id) payload.usuario_id = user.id;

      await axios.post("http://localhost:4000/api/comentarios", payload);
      setCommentText("");
      alert("Comentario enviado y pendiente de aprobación");
      // recargar (solo se mostrarán los aprobados)
      loadComments(imagen.id);
    } catch (err) {
      console.error("Error enviando comentario", err);
      alert("No se pudo enviar el comentario");
    }
  }

  // ----------------- ELIMINAR -----------------
  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo administradores pueden eliminar.");
    if (!window.confirm("¿Seguro que quiere eliminar esta imagen?")) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/imagenes/${id}`,
        authHeaders()
      );
      alert("Imagen eliminada correctamente");
      loadImagenes();
    } catch (err) {
      console.error("Error eliminando imagen", err);
      alert("No se pudo eliminar la imagen");
    }
  }

  // ----------------- EDITAR -----------------
  function openEditModal(img) {
    if (!isAdmin) return alert("Solo administradores pueden editar.");
    setEditData({
      id: img.id,
      titulo: img.titulo || "",
      categoria_id: img.categoria_id || "",
      autor: img.autor || "",
      descripcion: img.descripcion || "",
      palabras_clave: img.palabras_clave || "",
      archivo: null,
    });
    setShowEditModal(true);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return alert("Acceso denegado");

    try {
      const form = new FormData();
      form.append("titulo", editData.titulo);
      form.append("categoria_id", editData.categoria_id);
      form.append("autor", editData.autor);
      form.append("descripcion", editData.descripcion);
      form.append("palabras_clave", editData.palabras_clave);
      if (editData.archivo) form.append("imagen", editData.archivo);

      await axios.put(
        `http://localhost:4000/api/imagenes/${editData.id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Imagen actualizada correctamente");
      setShowEditModal(false);
      loadImagenes();
    } catch (err) {
      console.error("Error editando imagen", err);
      alert("Error al editar la imagen");
    }
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Galería</h1>
        <div>
          {user ? (
            <>
              <span className="me-2">
                Hola, {user.nombre} ({user.rol})
              </span>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <form className="row g-2 mb-3" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-3">
          <label className="form-label">Categoría</label>
          <select
            name="categoria"
            className="form-select"
            value={filters.categoria}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Autor</label>
          <input
            name="autor"
            className="form-control"
            value={filters.autor}
            onChange={handleFilterChange}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Buscar</label>
          <input
            name="q"
            className="form-control"
            value={filters.q}
            onChange={handleFilterChange}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Fecha (desde / hasta)</label>
          <div className="d-flex">
            <input
              type="date"
              name="date_from"
              className="form-control me-2"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="date_to"
              className="form-control"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </form>

      {/* GRID */}
      <div className="row">
        {imagenes.length === 0 && (
          <div className="col-12">
            <p>No hay imágenes.</p>
          </div>
        )}
        {imagenes
          .filter((imagen) => {
            return imagen.autor.includes(filters.autor) &&
              filters.categoria !== ""
              ? imagen.categoria_id === parseInt(filters.categoria)
              : true;
          })
          .map((img, idx) => (
            <div
              key={img.id}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={img.url}
                  alt={img.titulo}
                  className="card-img-top"
                  style={{
                    objectFit: "cover",
                    height: "180px",
                    cursor: "pointer",
                  }}
                  onClick={() => openDetail(idx)}
                />
                <div className="card-body">
                  <h5 className="card-title">{img.titulo}</h5>
                  <p>
                    <strong>Autor:</strong> {img.autor || "Anónimo"}
                  </p>
                  <p>
                    <strong>Categoría:</strong>{" "}
                    {img.categoria || "Sin categoría"}
                  </p>
                  <p className="text-muted">{img.descripcion?.slice(0, 80)}</p>

                  <div className="d-flex justify-content-between mt-2">
                    <div>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => openDetail(idx)}
                      >
                        Ver
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-outline-warning btn-sm me-2"
                          onClick={() => openEditModal(img)}
                        >
                          Editar
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(img.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <small className="text-muted">
                      {new Date(img.creado_en).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL VER */}
      {selectedIndex !== null && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {imagenes[selectedIndex].titulo}
                </h5>
                <button className="btn-close" onClick={closeDetail}></button>
              </div>
              <div className="modal-body">
                <img
                  src={imagenes[selectedIndex].url}
                  alt={imagenes[selectedIndex].titulo}
                  className="img-fluid mb-3"
                />
                <p>
                  <strong>Autor:</strong> {imagenes[selectedIndex].autor}
                </p>
                <p>
                  <strong>Categoría:</strong>{" "}
                  {imagenes[selectedIndex].categoria}
                </p>
                <p>
                  <strong>Descripción:</strong>{" "}
                  {imagenes[selectedIndex].descripcion}
                </p>
                <p>
                  <strong>Palabras clave:</strong>{" "}
                  {imagenes[selectedIndex].palabras_clave}
                </p>

                <hr />

                <div>
                  <h6>Comentarios</h6>

                  {isAdmin && (
                    <div className="mb-3">
                      <h6>Comentarios pendientes</h6>
                      {loadingPending ? (
                        <p className="text-muted">
                          Cargando comentarios pendientes...
                        </p>
                      ) : pendingComments.length === 0 ? (
                        <p className="text-muted">
                          No hay comentarios pendientes para esta imagen.
                        </p>
                      ) : (
                        <div className="list-group mb-2">
                          {pendingComments.map((c) => (
                            <div key={c.id} className="list-group-item">
                              <div className="d-flex w-100 justify-content-between">
                                <strong>{c.usuario || "Anónimo"}</strong>
                                <small className="text-muted">
                                  {c.creado_en
                                    ? new Date(c.creado_en).toLocaleString()
                                    : ""}
                                </small>
                              </div>
                              <p className="mb-2">{c.contenido}</p>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    handleModerate(c.id, "aprobado")
                                  }
                                  disabled={moderatingId === c.id}
                                >
                                  {moderatingId === c.id && "Procesando..."}
                                  {moderatingId !== c.id && "Aprobar"}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleModerate(c.id, "rechazado")
                                  }
                                  disabled={moderatingId === c.id}
                                >
                                  {moderatingId === c.id && "Procesando..."}
                                  {moderatingId !== c.id && "Rechazar"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {loadingComments ? (
                    <p className="text-muted">Cargando comentarios...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-muted">
                      Aún no hay comentarios aprobados.
                    </p>
                  ) : (
                    <div className="list-group mb-3">
                      {comments.map((c) => (
                        <div key={c.id} className="list-group-item">
                          <div className="d-flex w-100 justify-content-between">
                            <strong>{c.usuario || "Anónimo"}</strong>
                            <small className="text-muted">
                              {c.creado_en
                                ? new Date(c.creado_en).toLocaleString()
                                : ""}
                            </small>
                          </div>
                          <p className="mb-0">{c.contenido}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleCommentSubmit}>
                    <label className="form-label">Dejar un comentario</label>
                    {user ? (
                      <div className="mb-2">
                        <small className="text-muted">
                          Comentando como {user.nombre}
                        </small>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <small className="text-muted">
                          Puedes comentar como invitado; el comentario quedará
                          pendiente de aprobación.
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
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={prevImage}>
                  Anterior
                </button>
                <button className="btn btn-secondary" onClick={nextImage}>
                  Siguiente
                </button>
                <button className="btn btn-danger" onClick={closeDetail}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Imagen</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              <form onSubmit={handleEditSubmit}>
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
                      setEditData({
                        ...editData,
                        palabras_clave: e.target.value,
                      })
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
                    onClick={() => setShowEditModal(false)}
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
      )}
    </div>
  );
}

export default Galeria;
