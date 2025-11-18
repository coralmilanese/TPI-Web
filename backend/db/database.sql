USE museo;

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  categoria_id INT,
  autor VARCHAR(150),
  fecha_publicacion DATE,
  descripcion TEXT,
  palabras_clave VARCHAR(500),
  filename VARCHAR(255) NOT NULL,
  tipo ENUM('imagen','video','3d') DEFAULT 'imagen',
  tama_bytes INT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','visitante') DEFAULT 'visitante',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imagen_id INT NOT NULL,
  usuario_id INT,
  contenido VARCHAR(250) NOT NULL,
  estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imagen_id) REFERENCES imagenes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

INSERT INTO categorias (nombre) VALUES
('Pintura'),
('Fotografía'),
('Arte Digital'),
('Escultura'),
('Arquitectura');