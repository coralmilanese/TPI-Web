import React, { useState, useEffect } from "react";
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

  // Cargar categorías al cargar la página
  useEffect(() => {
    axios.get("http://localhost:4000/api/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivo) {
      setMensaje("Debe seleccionar una imagen.");
      return;
    }

    const data = new FormData();
    data.append("imagen", archivo);
    data.append("titulo", titulo);
    data.append("categoria_id", categoriaId);
    data.append("autor", autor);
    data.append("descripcion", descripcion);
    data.append("palabras_clave", palabrasClave);

    try {
      await axios.post("http://localhost:4000/api/imagenes", data);
      setMensaje("Imagen subida correctamente ✔");
    } catch (error) {
      console.error(error);
      setMensaje("Error al subir la imagen ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Subir Imagen</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        /><br />

        {/* Selector de categorías */}
        <select
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
        <br />

        <input
          type="text"
          placeholder="Autor"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          required
        /><br />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        /><br />

        <input
          type="text"
          placeholder="Palabras clave"
          value={palabrasClave}
          onChange={(e) => setPalabrasClave(e.target.value)}
          required
        /><br />

        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => setArchivo(e.target.files[0])}
          required
        /><br />

        <button type="submit">Subir</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default SubirImagen;
