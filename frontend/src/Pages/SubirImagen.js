import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function SubirImagen() {
  const [titulo, setTitulo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [autor, setAutor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [palabrasClave, setPalabrasClave] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef();

  // intentar prellenar autor si hay usuario logueado
  const [userAutor, setUserAutor] = useState("");

  // Cargar categorías al cargar la página
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error cargando categorías:", err));
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u && u.nombre) setUserAutor(u.nombre);
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setFileError("");

    if (!archivo) {
      setFileError("Debes seleccionar una imagen.");
      return;
    }

    // validaciones cliente
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(archivo.type)) {
      setFileError("Formato no soportado. Usa JPG o PNG.");
      return;
    }
    if (archivo.size > maxSize) {
      setFileError("Archivo demasiado grande. Máx 5MB.");
      return;
    }

    const data = new FormData();
    data.append("imagen", archivo);
    data.append("titulo", titulo);
    data.append("categoria_id", categoriaId);
    data.append("autor", autor || userAutor);
    data.append("descripcion", descripcion);
    data.append("palabras_clave", palabrasClave);

    try {
      setUploading(true);
      setProgress(0);

      await axios.post("http://localhost:4000/api/imagenes", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) {
            const p = Math.round((ev.loaded / ev.total) * 100);
            setProgress(p);
          }
        },
      });

      setMensaje("Imagen subida correctamente ✔");
      // reset form
      setTitulo("");
      setCategoriaId("");
      setAutor("");
      setDescripcion("");
      setPalabrasClave("");
      setArchivo(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      console.error(error);
      setMensaje("Error al subir la imagen ❌");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFileError("");
    if (!f) {
      setArchivo(null);
      setPreviewUrl(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) {
      setFileError("Formato no soportado. Usa JPG o PNG.");
      setArchivo(null);
      setPreviewUrl(null);
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      setFileError("Archivo demasiado grande. Máx 5MB.");
      setArchivo(null);
      setPreviewUrl(null);
      return;
    }

    setArchivo(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  // limpiar objectURL al desmontar / cambiar archivo
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Subir Imagen</h1>

          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            {mensaje && (
              <div className="alert alert-info" role="alert">
                {mensaje}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Autor</label>
              <input
                className="form-control"
                type="text"
                value={autor || userAutor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder={userAutor ? `Predeterminado: ${userAutor}` : ""}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Palabras clave{" "}
                <small className="text-muted">(separadas por comas)</small>
              </label>
              <input
                className="form-control"
                type="text"
                value={palabrasClave}
                onChange={(e) => setPalabrasClave(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Imagen (JPG/PNG, máx 5MB)</label>
              <input
                ref={fileInputRef}
                className="form-control"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
              {fileError && (
                <div className="form-text text-danger">{fileError}</div>
              )}
            </div>

            {previewUrl && (
              <div className="mb-3">
                <label className="form-label">Previsualización</label>
                <div>
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                    }}
                    className="img-thumbnail"
                  />
                </div>
              </div>
            )}

            {uploading && (
              <div className="mb-3">
                <label className="form-label">Subiendo: {progress}%</label>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  // reset
                  setTitulo("");
                  setCategoriaId("");
                  setAutor("");
                  setDescripcion("");
                  setPalabrasClave("");
                  setArchivo(null);
                  setPreviewUrl(null);
                  setMensaje("");
                  setFileError("");
                  if (fileInputRef.current) fileInputRef.current.value = null;
                }}
                disabled={uploading}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {" "}
                {uploading ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubirImagen;
