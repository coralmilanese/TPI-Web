// src/Pages/Galeria.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./gallery-advanced.css"; 

function Galeria() {
  const [imagenes, setImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [filters, setFilters] = useState({
    categoria: "",
    autor: "",
    q: "",
    date_from: "",
    date_to: "",
    page: 1,
    pageSize: 12,
  });

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const token = localStorage.getItem("token") || null;
  const isAdmin = user?.rol === "admin";

  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [editData, setEditData] = useState({
    id: null, titulo: "", categoria_id: "", autor: "", descripcion: "", palabras_clave: "", archivo: null
  });
  const [showEditModal, setShowEditModal] = useState(false);

 
  
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [pendingComments, setPendingComments] = useState([]);
  const [favoritos, setFavoritos] = useState({});
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  useEffect(() => {
    loadCategorias();
    loadImagenes();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) loadFavoritos();
    else setFavoritos({});
    // eslint-disable-next-line
  }, [user]);

  async function loadCategorias() {
    try {
      const res = await axios.get("http://localhost:4000/api/categorias");
      setCategorias(res.data);
    } catch (err) { console.error("Error categorias", err); }
  }

  async function loadImagenes() {
    try {
      const res = await axios.get("http://localhost:4000/api/imagenes");
      setImagenes(res.data || []);
    } catch (err) { console.error("Error cargando imágenes", err); }
  }

  async function loadFavoritos() {
    try {
      setLoadingFavoritos(true);
      const res = await axios.get("http://localhost:4000/api/favoritos", { headers: { Authorization: `Bearer ${token}` }});
      const rows = res.data || [];
      const map = {};
      rows.forEach(r => { if (r.imagen_id) map[r.imagen_id] = r.id; });
      setFavoritos(map);
    } catch (err) { console.error("Error cargando favoritos", err); setFavoritos({}); }
    finally { setLoadingFavoritos(false); }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value, page: 1 }));
  };

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  function authHeaders() {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  const openDetail = (index) => setSelectedIndex(index);
  const closeDetail = () => setSelectedIndex(null);

  useEffect(() => {
    if (selectedIndex === null) return;
    const img = imagenes[selectedIndex];
    if (!img) return;
    loadComments(img.id);
    // eslint-disable-next-line
  }, [selectedIndex]);

  async function loadComments(imagenId) {
    try {
      const res = await axios.get(`http://localhost:4000/api/comentarios/imagen/${imagenId}`);
      setComments(res.data || []);
    } catch (err) { console.error("Error cargando comentarios", err); setComments([]); }

    if (isAdmin) {
      try {
        const res2 = await axios.get("http://localhost:4000/api/comentarios/pendientes", authHeaders());
        const allPending = res2.data || [];
        const filtered = allPending.filter(c => c.imagen_id === imagenId);
        setPendingComments(filtered);
      } catch (err) { console.error("Error pendientes", err); setPendingComments([]); }
    } else setPendingComments([]);
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText || commentText.trim().length === 0) return alert("Escribe un comentario");
    if (commentText.length > 250) return alert("Máx 250 caracteres");
    const imagen = imagenes[selectedIndex];
    if (!imagen) return;
    try {
      const payload = { imagen_id: imagen.id, contenido: commentText.trim() };
      if (user && user.id) payload.usuario_id = user.id;
      await axios.post("http://localhost:4000/api/comentarios", payload);
      setCommentText("");
      loadComments(imagen.id);
      alert("Comentario enviado y pendiente de aprobación");
    } catch (err) { console.error(err); alert("No se pudo enviar comentario"); }
  }

  async function handleModerate(commentId, estado) {
    if (!isAdmin) return alert("Solo administradores");
    if (!window.confirm(`Confirmar ${estado}`)) return;
    try {
      await axios.put(`http://localhost:4000/api/comentarios/${commentId}`, { estado }, authHeaders());
      const img = imagenes[selectedIndex];
      if (img) loadComments(img.id);
    } catch (err) { console.error(err); alert("Error moderando comentario"); }
  }

  async function toggleFavorito(imagenId) {
    if (!user) return alert("Debes iniciar sesión");
    try {
      if (favoritos[imagenId]) {
        await axios.delete(`http://localhost:4000/api/favoritos/imagen/${imagenId}`, authHeaders());
        setFavoritos(prev => { const copy = {...prev}; delete copy[imagenId]; return copy; });
      } else {
        await axios.post("http://localhost:4000/api/favoritos", { imagen_id: imagenId }, authHeaders());
        loadFavoritos();
      }
    } catch (err) { console.error(err); alert("No se pudo actualizar favorito"); }
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo administradores pueden eliminar.");
    if (!window.confirm("¿Seguro que desea eliminar?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/imagenes/${id}`, authHeaders());
      loadImagenes();
    } catch (err) { console.error(err); alert("No se pudo eliminar"); }
  }

  function openEditModal(img) {
    if (!isAdmin) return alert("Solo administradores");
    setEditData({ id: img.id, titulo: img.titulo || "", categoria_id: img.categoria_id || "", autor: img.autor || "", descripcion: img.descripcion || "", palabras_clave: img.palabras_clave || "", archivo: null });
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
      await axios.put(`http://localhost:4000/api/imagenes/${editData.id}`, form, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }});
      setShowEditModal(false);
      loadImagenes();
      alert("Imagen actualizada");
    } catch (err) { console.error(err); alert("Error editando imagen"); }
  }

  // Filtering logic (client-side)
  const filtered = imagenes.filter(imagen => {
    if (filters.categoria && String(imagen.categoria_id) !== String(filters.categoria)) return false;
    if (filters.autor && !imagen.autor?.toLowerCase().includes(filters.autor.toLowerCase())) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const inTitle = imagen.titulo?.toLowerCase().includes(q);
      const inDesc = imagen.descripcion?.toLowerCase().includes(q);
      const inTags = imagen.palabras_clave?.toLowerCase().includes(q);
      if (!(inTitle || inDesc || inTags)) return false;
    }
    if (filters.date_from) {
      const dFrom = new Date(filters.date_from).getTime();
      const dImg = new Date(imagen.creado_en || imagen.created_at || 0).getTime();
      if (dImg < dFrom) return false;
    }
    if (filters.date_to) {
      const dTo = new Date(filters.date_to).getTime();
      const dImg = new Date(imagen.creado_en || imagen.created_at || 0).getTime();
      if (dImg > dTo) return false;
    }
    return true;
  });

  return (
    <div className="page-wrap container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Galería</h1>
        <div className="user-area">
          {user ? (
            <>
              <span className="me-2 user-greet">Hola, {user.nombre} <span className="role-tag">({user.rol})</span></span>
              <button className="btn btn-sm btn-ghost" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            // <-- eliminado el botón "Iniciar sesión" cuando no hay usuario, tal como pediste
            null
          )}
        </div>
      </div>

      <form className="row g-2 mb-3 filters-card" onSubmit={(e)=>e.preventDefault()}>
        <div className="col-md-3">
          <label className="form-label">Categoría</label>
          <select name="categoria" className="form-select" value={filters.categoria} onChange={handleFilterChange}>
            <option value="">Todas</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Autor</label>
          <input name="autor" className="form-control" value={filters.autor} onChange={handleFilterChange} />
        </div>

        <div className="col-md-3">
          <label className="form-label">Buscar</label>
          <input name="q" className="form-control" value={filters.q} onChange={handleFilterChange} placeholder="Título, descripción o palabra clave" />
        </div>

        <div className="col-md-3">
          <label className="form-label">Fecha (desde / hasta)</label>
          <div className="d-flex">
            <input type="date" name="date_from" className="form-control me-2" value={filters.date_from} onChange={handleFilterChange} />
            <input type="date" name="date_to" className="form-control" value={filters.date_to} onChange={handleFilterChange} />
          </div>
        </div>
      </form>

      <div className="gallery-grid">
        {filtered.length === 0 && <div className="card p-4 center"><p className="small" style={{margin:0}}>No se encontraron imágenes.</p></div>}
        {filtered.map((img, idx) => (
          <article key={img.id || idx} className="card art-card reveal">
            <div className="art-media">
              <img src={img.url} alt={img.titulo || `Imagen ${idx+1}`} className="art-thumb" onClick={() => openDetail(idx)} />
            </div>

            <div className="art-meta">
              <h5>{img.titulo || "Untitled"}</h5>
              <p className="small muted">{img.autor || "Anónimo"} • {img.categoria || "Sin categoría"}</p>

              <div className="art-actions">
                <div className="left">
                  <button className="btn btn-sm btn-primary-outline" onClick={() => openDetail(idx)}>Ver</button>

                  {user && <button className={`btn btn-sm ${favoritos[img.id] ? "btn-warning" : "btn-outline-warning"}`} onClick={() => toggleFavorito(img.id)} aria-pressed={!!favoritos[img.id]}>{favoritos[img.id] ? "★" : "☆"}</button>}

                  {isAdmin && <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(img)}>Editar</button>}
                  {isAdmin && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(img.id)}>Eliminar</button>}
                </div>

                <small className="small date">{new Date(img.creado_en).toLocaleDateString()}</small>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal detalle */}
      {selectedIndex !== null && (
        <div className="modal show d-block" role="dialog" aria-modal="true" aria-label="Detalle de imagen">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{imagenes[selectedIndex].titulo}</h5>
                <button className="btn-close" onClick={closeDetail} aria-label="Cerrar"></button>
              </div>

              <div className="modal-body">
                <img src={imagenes[selectedIndex].url} alt={imagenes[selectedIndex].titulo} className="img-fluid mb-3 modal-img" />

                <p><strong>Autor:</strong> {imagenes[selectedIndex].autor}</p>
                <p><strong>Categoría:</strong> {imagenes[selectedIndex].categoria}</p>
                <p><strong>Descripción:</strong> {imagenes[selectedIndex].descripcion}</p>
                <p><strong>Palabras clave:</strong> {imagenes[selectedIndex].palabras_clave}</p>

                <hr />

                <div>
                  <h6>Comentarios</h6>

                  {isAdmin && (
                    <div className="mb-3">
                      <h6>Comentarios pendientes</h6>
                      {pendingComments.length === 0 ? <p className="small">No hay comentarios pendientes.</p> : (
                        <div className="list-group mb-2">
                          {pendingComments.map(c => (
                            <div key={c.id} className="list-group-item">
                              <div className="d-flex w-100 justify-content-between">
                                <strong>{c.usuario || "Anónimo"}</strong>
                                <small className="small">{c.creado_en ? new Date(c.creado_en).toLocaleString() : ""}</small>
                              </div>
                              <p className="mb-2">{c.contenido}</p>
                              <div style={{ display:"flex", gap:8 }}>
                                <button className="btn btn-sm btn-success" onClick={()=>handleModerate(c.id, "aprobado")}>Aprobar</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={()=>handleModerate(c.id, "rechazado")}>Rechazar</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {comments.length === 0 ? <p className="small text-muted">Aún no hay comentarios aprobados.</p> : (
                    <div className="list-group mb-3">
                      {comments.map(c => (
                        <div key={c.id} className="list-group-item">
                          <div className="d-flex w-100 justify-content-between">
                            <strong>{c.usuario || "Anónimo"}</strong>
                            <small className="small">{c.creado_en ? new Date(c.creado_en).toLocaleString() : ""}</small>
                          </div>
                          <p className="mb-0">{c.contenido}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleCommentSubmit}>
                    <label className="form-label">Dejar un comentario</label>
                    <textarea className="form-control mb-2" rows={3} maxLength={250} value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="Tu comentario (máx. 250 caracteres)" />
                    <div style={{ display:"flex", justifyContent:"flex-end" }}>
                      <button className="btn btn-primary" type="submit">Enviar comentario</button>
                    </div>
                  </form>

                </div>

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedIndex((i)=> (i===0?imagenes.length-1:i-1))}>Anterior</button>
                <button className="btn btn-secondary" onClick={() => setSelectedIndex((i)=> (i===imagenes.length-1?0:i+1))}>Siguiente</button>
                <button className="btn btn-danger" onClick={closeDetail}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {showEditModal && (
        <div className="modal show d-block" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Imagen</h5>
                <button className="btn-close" onClick={()=>setShowEditModal(false)} aria-label="Cerrar"></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <label className="form-label">Título</label>
                  <input className="form-control" value={editData.titulo} onChange={(e)=>setEditData({...editData,titulo:e.target.value})} required />

                  <label className="form-label mt-3">Categoría</label>
                  <select className="form-select" value={editData.categoria_id} onChange={(e)=>setEditData({...editData,categoria_id:e.target.value})}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>

                  <label className="form-label mt-3">Autor</label>
                  <input className="form-control" value={editData.autor} onChange={(e)=>setEditData({...editData,autor:e.target.value})} required />

                  <label className="form-label mt-3">Descripción</label>
                  <textarea className="form-control" value={editData.descripcion} onChange={(e)=>setEditData({...editData,descripcion:e.target.value})} />

                  <label className="form-label mt-3">Palabras clave</label>
                  <input className="form-control" value={editData.palabras_clave} onChange={(e)=>setEditData({...editData,palabras_clave:e.target.value})} />

                  <label className="form-label mt-3">Reemplazar imagen (opcional)</label>
                  <input type="file" className="form-control" accept=".jpg,.jpeg,.png" onChange={(e)=>setEditData({...editData,archivo:e.target.files[0]})} />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={()=>setShowEditModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" type="submit">Guardar cambios</button>
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
