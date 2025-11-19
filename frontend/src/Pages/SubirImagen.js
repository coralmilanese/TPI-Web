// src/Pages/SubirImagen.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./upload-advanced.css"; // nuevo: estilos parecidos al Home

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

  const [userAutor, setUserAutor] = useState("");

  useEffect(() => {
    axios.get("http://localhost:4000/api/categorias")
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

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;
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
          if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });

      setMensaje("Imagen subida correctamente ✔");
      setTitulo(""); setCategoriaId(""); setAutor(""); setDescripcion(""); setPalabrasClave("");
      setArchivo(null); setPreviewUrl(null);
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
    if (!f) { setArchivo(null); setPreviewUrl(null); return; }
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) { setFileError("Formato no soportado. Usa JPG o PNG."); setArchivo(null); setPreviewUrl(null); return; }
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) { setFileError("Archivo demasiado grande. Máx 5MB."); setArchivo(null); setPreviewUrl(null); return; }
    setArchivo(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  useEffect(()=> {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }
  },[previewUrl]);

  return (
    <div className="upload-page container py-5">
      <div className="upload-wrap card p-4">
        <h1 className="upload-title">Subir Imagen</h1>

        {mensaje && <div className="alert alert-info" role="alert">{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-12 mb-3">
              <label className="form-label">Título</label>
              <input className="form-control" type="text" value={titulo} onChange={(e)=>setTitulo(e.target.value)} required />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={categoriaId} onChange={(e)=>setCategoriaId(e.target.value)} required>
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Autor</label>
              <input className="form-control" type="text" value={autor || userAutor} onChange={(e)=>setAutor(e.target.value)} placeholder={userAutor ? `Predeterminado: ${userAutor}`: ""} />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={3} value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Palabras clave <small className="small text-muted">(separadas por comas)</small></label>
              <input className="form-control" type="text" value={palabrasClave} onChange={(e)=>setPalabrasClave(e.target.value)} />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Imagen (JPG/PNG, máx 5MB)</label>
              <input ref={fileInputRef} className="form-control" type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
              {fileError && <div className="form-text text-danger">{fileError}</div>}
            </div>

            {previewUrl && (
              <div className="col-12 mb-3">
                <label className="form-label">Previsualización</label>
                <div className="preview-wrap">
                  <img src={previewUrl} alt="preview" className="preview-img" />
                </div>
              </div>
            )}

            {uploading && (
              <div className="col-12 mb-3">
                <label className="form-label">Subiendo: {progress}%</label>
                <div className="progress"><div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}></div></div>
              </div>
            )}

            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline" onClick={()=>{
                setTitulo(""); setCategoriaId(""); setAutor(""); setDescripcion(""); setPalabrasClave(""); setArchivo(null); setPreviewUrl(null); setMensaje(""); setFileError(""); if (fileInputRef.current) fileInputRef.current.value = null;
              }} disabled={uploading}>Limpiar</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? "Subiendo..." : "Subir Imagen"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubirImagen;
