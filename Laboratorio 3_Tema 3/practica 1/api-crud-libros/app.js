// API de libreria - Practica 1 Lab 3
// Aqui se conecta el CRUD del Lab 2.1 a Postgres, que sirve para guardar los datos.
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { body, param, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Aqui se habilita la lectura de JSON, que sirve para recibir datos en POST y PUT
app.use(express.json());
// Aqui se expone la carpeta public, que sirve para mostrar el catalogo
app.use(express.static(path.join(__dirname, 'public')));

// Aqui se configura la conexion a Postgres, que sirve para usar los datos del .env
const pool = new Pool({
  user: process.env.DB_USR || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'dblibros',
  password: process.env.DB_PWD || 'secret',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Aqui se espera a la DB con reintentos, que sirve porque la API arranca antes que Postgres
async function waitForDb(retries = 15) {
  for (let i = 1; i <= retries; i++) {
    try {
      const c = await pool.connect();
      c.release();
      console.log('Conectado a Postgres');
      return;
    } catch (e) {
      console.log(`Esperando DB (${i}/${retries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('No se pudo conectar a Postgres');
}

// Aqui se revisan los errores de validacion, que sirve para frenar datos invalidos
const checkErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Aqui se une libro con autor y categoria, que sirve para devolver todo junto
const libroSelect = `
  SELECT l.id, l.titulo, l.autor_id AS "autorId", l.categoria_id AS "categoriaId",
         l.anio, l.disponible, l.portada_url AS "portada",
         a.nombre AS autor, c.nombre AS categoria
  FROM libros l
  JOIN autores a ON a.id = l.autor_id
  JOIN categorias c ON c.id = l.categoria_id
`;

// Aqui se listan los autores, que sirve para llenar el formulario
app.get('/autores', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM autores ORDER BY nombre');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error al listar autores' });
  }
});

// Aqui se listan las categorias, que sirve para filtrar y para el formulario
app.get('/categorias', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error al listar categorias' });
  }
});

// Aqui se listan los libros con filtros, que sirve para buscar por categoria, estado o texto
app.get('/libros', async (req, res) => {
  try {
    const { categoriaId, disponible, search } = req.query;
    const conds = [];
    const vals = [];
    // Aqui se filtra por categoria, que sirve cuando llega categoriaId
    if (categoriaId) { vals.push(categoriaId); conds.push(`l.categoria_id = $${vals.length}`); }
    // Aqui se filtra por estado, que sirve cuando llega disponible true o false
    if (disponible !== undefined && disponible !== '') {
      vals.push(disponible === 'true');
      conds.push(`l.disponible = $${vals.length}`);
    }
    // Aqui se busca por titulo, que sirve cuando llega search
    if (search) { vals.push(`%${search}%`); conds.push(`l.titulo ILIKE $${vals.length}`); }
    let sql = libroSelect;
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY l.id';
    const { rows } = await pool.query(sql, vals);
    res.json({ total: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ message: 'Error al listar libros' });
  }
});

// Aqui se obtiene un libro por id, que sirve para ver el detalle
app.get('/libros/:id', param('id').isInt(), checkErrors, async (req, res) => {
  try {
    const { rows } = await pool.query(libroSelect + ' WHERE l.id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener libro' });
  }
});

// Aqui se definen las reglas de validacion, que sirve para exigir campos obligatorios
const libroValidators = [
  body('titulo').notEmpty().withMessage('Titulo requerido'),
  body('autorId').isInt().withMessage('autorId debe ser entero'),
  body('categoriaId').isInt().withMessage('categoriaId debe ser entero'),
  body('anio').optional().isInt({ min: 1000, max: 2030 }).withMessage('Anio invalido'),
];

// Aqui se crea un libro, que sirve para guardarlo en la tabla libros
app.post('/libros', libroValidators, checkErrors, async (req, res) => {
  try {
    const { titulo, autorId, categoriaId, anio, disponible, portada } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO libros (titulo, autor_id, categoria_id, anio, disponible, portada_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [titulo, autorId, categoriaId, anio || new Date().getFullYear(), disponible !== undefined ? disponible : true, portada || null]
    );
    const { rows: full } = await pool.query(libroSelect + ' WHERE l.id = $1', [rows[0].id]);
    res.status(201).json({ mensaje: 'Libro creado exitosamente', data: full[0] });
  } catch (e) {
    // Aqui se controla el error 23503, que sirve cuando el autor o la categoria no existen
    if (e.code === '23503') return res.status(400).json({ error: 'autorId o categoriaId no existe' });
    res.status(500).json({ message: 'Error al crear libro' });
  }
});

// Aqui se actualiza un libro por id, que sirve para reemplazar sus datos
app.put('/libros/:id', param('id').isInt(), libroValidators, checkErrors, async (req, res) => {
  try {
    const { titulo, autorId, categoriaId, anio, disponible, portada } = req.body;
    const { rowCount } = await pool.query(
      `UPDATE libros SET titulo=$1, autor_id=$2, categoria_id=$3, anio=$4, disponible=$5, portada_url=$6 WHERE id=$7`,
      [titulo, autorId, categoriaId, anio, disponible, portada || null, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Libro no encontrado' });
    const { rows } = await pool.query(libroSelect + ' WHERE l.id = $1', [req.params.id]);
    res.json({ mensaje: 'Libro actualizado correctamente', data: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

// Aqui se elimina un libro por id, que sirve para borrarlo de la base
app.delete('/libros/:id', param('id').isInt(), checkErrors, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM libros WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json({ mensaje: 'Libro eliminado con exito', data: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// Aqui se muestra el catalogo, que sirve como portada en la ruta principal
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Aqui se arranca el servidor, que sirve para escuchar en el puerto y esperar la DB
app.listen(port, async () => {
  console.log(`API de Libreria en puerto ${port}`);
  await waitForDb();
});
