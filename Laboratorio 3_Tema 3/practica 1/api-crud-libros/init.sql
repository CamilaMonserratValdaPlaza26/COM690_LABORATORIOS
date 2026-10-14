-- Aqui se crean las tablas, que sirve para la persistencia (la BD ya la crea POSTGRES_DB)
CREATE TABLE IF NOT EXISTS autores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  nacionalidad VARCHAR(80)
);

-- Aqui se crean las categorias, que sirve para clasificar los libros
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE
);

-- Aqui se crean los libros, que sirve para guardar titulo, autor, categoria y portada
CREATE TABLE IF NOT EXISTS libros (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  autor_id INTEGER NOT NULL REFERENCES autores(id),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  anio INTEGER CHECK (anio >= 1000 AND anio <= 2030),
  disponible BOOLEAN DEFAULT TRUE,
  portada_url TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Aqui se insertan los autores, que sirve como datos iniciales
INSERT INTO autores (nombre, nacionalidad) VALUES
  ('Gabriel Garcia Marquez', 'Colombiana'),
  ('Isabel Allende', 'Chilena'),
  ('George Orwell', 'Britanica'),
  ('Jane Austen', 'Britanica'),
  ('Antoine de Saint-Exupery', 'Francesa')
ON CONFLICT (nombre) DO NOTHING;

-- Aqui se insertan las categorias, que sirve como catalogo inicial
INSERT INTO categorias (nombre) VALUES
  ('Real Magico'),
  ('Ciencia Ficcion'),
  ('Novela Historica'),
  ('Clasico'),
  ('Infantil')
ON CONFLICT (nombre) DO NOTHING;

-- Aqui se insertan libros con portadas, que sirve para mostrar imagenes de ejemplo
INSERT INTO libros (titulo, autor_id, categoria_id, anio, disponible, portada_url) VALUES
  ('Cien anios de soledad', 1, 1, 1967, true, 'https://covers.openlibrary.org/b/isbn/9780307474728-M.jpg'),
  ('La casa de los espiritus', 2, 3, 1982, true, 'https://covers.openlibrary.org/b/isbn/9781501117015-M.jpg'),
  ('1984', 3, 2, 1949, false, 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg'),
  ('Orgullo y prejuicio', 4, 4, 1813, true, 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg'),
  ('El Principito', 5, 5, 1943, true, 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg')
ON CONFLICT DO NOTHING;
