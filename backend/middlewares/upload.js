// backend/middlewares/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const BASE_DIR = path.join(__dirname, "..", "uploads");

// Crear carpeta base si no existe
if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

// --------------------------------------------------------------------------------------------------
// CONFIGURACIÓN DE TIPOS PERMITIDOS
// --------------------------------------------------------------------------------------------------
const FILE_TYPES = {
  imagenes: {
    folder: "imagenes",
    mime: ["image/jpeg", "image/jpg", "image/png"],
    ext: [".jpg", ".jpeg", ".png"]
  },
  videos: {
    folder: "videos",
    mime: ["video/mp4", "video/webm"],
    ext: [".mp4", ".webm"]
  },
  modelos3d: {
    folder: "modelos3d",
    mime: ["model/gltf+json", "model/gltf-binary", "model/obj"],
    ext: [".gltf", ".glb", ".obj"]
  }
};

// Crea subcarpetas si no existen
Object.values(FILE_TYPES).forEach(conf => {
  const dir = path.join(BASE_DIR, conf.folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --------------------------------------------------------------------------------------------------
// CONFIGURACIÓN DE STORAGE
// --------------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tipo = req.uploadType || "imagenes"; // por defecto imágenes
    const config = FILE_TYPES[tipo];

    const destDir = path.join(BASE_DIR, config.folder);

    cb(null, destDir);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + safeName);
  }
});

// --------------------------------------------------------------------------------------------------
// FILTRO DE ARCHIVOS PROFESIONAL
// --------------------------------------------------------------------------------------------------
function fileFilter(req, file, cb) {
  const tipo = req.uploadType || "imagenes";
  const config = FILE_TYPES[tipo];

  const ext = path.extname(file.originalname).toLowerCase();

  // Validar extensión
  if (!config.ext.includes(ext)) {
    return cb(
      new Error(
        `Extensión no permitida. Solo: ${config.ext.join(", ")}`
      )
    );
  }

  // Validar MIME real
  if (!config.mime.includes(file.mimetype)) {
    return cb(
      new Error(
        `Tipo MIME inválido (${file.mimetype}). Solo permitido: ${config.mime.join(", ")}`
      )
    );
  }

  cb(null, true);
}

// --------------------------------------------------------------------------------------------------
// LÍMITE DE TAMAÑO
// --------------------------------------------------------------------------------------------------
const maxSize = Number(process.env.MAX_FILE_SIZE || "5242880"); // 5MB por defecto

// --------------------------------------------------------------------------------------------------
// EXPORTAMOS MIDDLEWARE
// --------------------------------------------------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize }
});

// Middleware para seleccionar tipo (imagenes, videos, modelos3d)
function seleccionarTipo(tipo) {
  return (req, res, next) => {
    req.uploadType = tipo;
    next();
  };
}

module.exports = {
  upload,
  seleccionarTipo
};
