// frontend/src/Pages/Galeria.js
import React, { useEffect, useState } from "react";
import TarjetaImagen from "../Components/TarjetaImagen";
import FiltrosGaleria from "../Components/FiltrosGaleria";
import ModalDetalleImagen from "../Components/ModalDetalleImagen";
import ListaComentarios from "../Components/ListaComentarios";
import FormComentario from "../Components/FormComentario";
import ListaComentariosPendientes from "../Components/ListaComentariosPendientes";
import ModalEditarImagen from "../Components/ModalEditarImagen";
// import FavoriteButton from "../Components/FavoriteButton";
import Cargador from "../Components/Cargador";
import axios from "axios";

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

  // mantener user sincronizado con localStorage (por si cambia desde otra pestaña)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "user") {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(parsed);
        } catch (_) {
          setUser(null);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line
  }, []);

  // modal ver
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [show3D, setShow3D] = useState(false);
  // comentarios
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [pendingComments, setPendingComments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  // favoritos
  const [favoritos, setFavoritos] = useState({}); // mapa imagen_id -> favorito.id
  // const [loadingFavoritos, setLoadingFavoritos] = useState(false);

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
    // cargar favoritos si hay usuario
    if (user) loadFavoritos();
    else setFavoritos({});
    // eslint-disable-next-line
  }, [user]);

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

  async function loadFavoritos() {
    try {
      // setLoadingFavoritos(true);
      const res = await axios.get(
        "http://localhost:4000/api/favoritos",
        authHeaders()
      );
      const rows = res.data || [];
      const map = {};
      rows.forEach((r) => {
        if (r.imagen_id) map[r.imagen_id] = r.id;
      });
      setFavoritos(map);
    } catch (err) {
      console.error("Error cargando favoritos", err);
      setFavoritos({});
    } finally {
      // setLoadingFavoritos(false);
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value, page: 1 }));
  };

  // ----------------- AUTH helpers -----------------
  function authHeaders() {
    const t = localStorage.getItem("token") || null;
    return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
  }

  const [moderatingId, setModeratingId] = useState(null);

  // ----------------- VER / MODAL -----------------
  const openDetail = (index) => {
    setSelectedIndex(index);
    setShow3D(false);
  };
  const closeDetail = () => {
    setSelectedIndex(null);
    setShow3D(false);
  };
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

  // Toggle favorito: si existe en favorites -> DELETE, else POST
  async function toggleFavorito(imagenId) {
    if (!user) return alert("Debes iniciar sesión para guardar favoritos");
    try {
      // si ya está favorito
      if (favoritos[imagenId]) {
        // eliminar
        await axios.delete(
          `http://localhost:4000/api/favoritos/imagen/${imagenId}`,
          authHeaders()
        );
        setFavoritos((prev) => {
          const copy = { ...prev };
          delete copy[imagenId];
          return copy;
        });
      } else {
        // agregar
        await axios.post(
          "http://localhost:4000/api/favoritos",
          { imagen_id: imagenId },
          authHeaders()
        );
        // recargar favoritos para obtener el id
        loadFavoritos();
      }
    } catch (err) {
      console.error("Error toggling favorito", err);
      alert("No se pudo actualizar favorito");
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
      </div>

      {/* FILTROS */}
      <FiltrosGaleria
        filters={filters}
        categorias={categorias}
        onChange={handleFilterChange}
      />

      {/* GRID */}
      <div className="row">
        {imagenes.length === 0 && (
          <div className="col-12">
            <Cargador text="No hay imágenes." />
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
              <TarjetaImagen
                img={img}
                onView={() => openDetail(idx)}
                onFavorite={() => toggleFavorito(img.id)}
                isFavorite={!!favoritos[img.id]}
                isAdmin={isAdmin}
                onEdit={() => openEditModal(img)}
                onDelete={() => handleDelete(img.id)}
                user={user}
              />
            </div>
          ))}
      </div>

      {/* MODAL VER */}
      {selectedIndex !== null && (
        <ModalDetalleImagen
          img={imagenes[selectedIndex]}
          show3D={show3D}
          onToggle3D={() => setShow3D((s) => !s)}
          onClose={closeDetail}
        >
          <h6>Comentarios</h6>
          {isAdmin && (
            <div className="mb-3">
              <h6>Comentarios pendientes</h6>
              <ListaComentariosPendientes
                pendingComments={pendingComments}
                loadingPending={loadingPending}
                onModerate={handleModerate}
                moderatingId={moderatingId}
              />
            </div>
          )}
          {loadingComments ? (
            <Cargador text="Cargando comentarios..." />
          ) : (
            <ListaComentarios comments={comments} />
          )}
          <FormComentario
            user={user}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmit={handleCommentSubmit}
          />
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
        </ModalDetalleImagen>
      )}

      {/* MODAL EDITAR */}
      <ModalEditarImagen
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        categorias={categorias}
        editData={editData}
        setEditData={setEditData}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

export default Galeria;
