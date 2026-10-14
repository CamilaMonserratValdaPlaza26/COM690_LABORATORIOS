# Informe Técnico: Laboratorio 3

## Laboratorio 3: Creación de Entornos Multi-Servicio y Persistencia con Docker Compose

---

# Portada

UNIVERSIDAD MAYOR, REAL Y PONTIFICIA DE SAN FRANCISCO XAVIER DE CHUQUISACA

FACULTAD DE CIENCIAS Y TECNOLOGÍA

![LOGO DE LA CARÁTULA](LOGO%20USFX/ESCUDO.png)

**Nombre:** VALDA PLAZA CAMILA MONSERRAT

**Carrera:** INGENIERÍA DE SISTEMAS

**Asignatura:** Trabajando en la Nube (COM610)

**Docente:** Ing. Marcelo Quispe Ortega

**Semestre:** 2/2026

SUCRE – BOLIVIA

---

# Introducción

En este laboratorio se pasó de ejecutar un único contenedor aislado a diseñar **entornos multi-servicio** declarados en un solo archivo `docker-compose.yml`, donde varios contenedores (servidor web, balanceador, API y base de datos) se levantan, se comunican y se apagan con un mismo comando.

Todo lo que se muestra a continuación es real: cada figura es una captura de pantalla del equipo, tomada durante la ejecución, y los archivos citados se encuentran en las carpetas `ejercicio1` … `ejercicio6`, `practica 1` y `practica 2`.

# Práctica Individual 1: CRUD con persistencia y hot reload

**Carpeta:** `practica 1/api-crud-libros`

**Objetivo:** tomar el CRUD del Laboratorio 2.1 (que guardaba los datos solo en memoria, es decir, se perdían al reiniciar) y hacer que los guarden en una base de datos real, además de configurar un entorno de desarrollo con **hot reload**.

**En palabras simples:** antes, la API era como una libreta que se borraba cada vez que se apagaba. Ahora los datos se guardan en una base de datos PostgreSQL dentro de otro contenedor, así que aunque se apaguen y enciendan los contenedores, los libros siguen ahí. Además, en modo desarrollo, cada vez que se guarda un cambio en el código la aplicación se reinicia sola.

## Archivos del proyecto

- **`app.js`**: código de la API (Express). Define las rutas del CRUD y crea un grupo de conexiones (`Pool`) a PostgreSQL usando las variables de entorno `DB_USR`, `DB_NAME`, `DB_PWD`, `DB_HOST` y `DB_PORT`, con valores por defecto como `dblibros` y puerto `5432`. También expone la carpeta `public` como sitio estático.
- **`public/index.html`**: interfaz web "Biblioteca Central" que consume la API.
- **`Dockerfile`**: construye la imagen de la API desde `node:20-alpine`, instala las dependencias y `nodemon`, y arranca con `node app.js`.
- **`docker-compose.yml`**: **Producción.** Servicios `api` (con `build: .`) y `db` (PostgreSQL con volumen con nombre `pgsql-libdata` para persistir los datos).
- **`docker-compose.dev.yml`**: **Desarrollo.** Redefine los servicios y sobrescribe el arranque con el comando `nodemon --legacy-watch app.js`, publica el puerto 3000 y añade el montaje de enlace de la carpeta local sobre `/app` para el hot reload.
- **`init.sql`**: script inicial de la base de datos. Crea las tablas `autores`, `categorias` y `libros`, y carga los 5 libros de ejemplo con sus autores y categorías. Se monta en la carpeta de inicialización de PostgreSQL y solo se ejecuta la primera vez que se crea el volumen.
- **`.env` / `.env.example`**: variables de entorno `PORT`, `DB_USR`, `DB_PWD`, `DB_HOST`, `DB_NAME`, `DB_PORT` y `NODE_ENV`. `.env.example` es la plantilla que se comparte.
- **`.gitignore` / `package.json`**: archivos a excluir de Git y lista de dependencias de Node (`express`, `pg`, `dotenv`, `express-validator`, `nodemon`).

**Observaciones importantes sobre el diseño:**

- El `Dockerfile` arranca con `node app.js` (**sin** hot reload), y es el `docker-compose.dev.yml` quien **reemplaza ese comando** por `nodemon`. Así la misma imagen sirve para ambos modos: producción usa `node`, desarrollo usa `nodemon`. Esto resuelve la contradicción de tener "un solo Dockerfile con y sin hot reload".
- El archivo de desarrollo **no** usa `extends` (que está obsoleto en Compose v2) ni `include`: redefine los servicios completos. Es más verboso, pero evita problemas de rutas relativas entre archivos.
- La opción `--legacy-watch` de nodemon hace que revise los archivos **por sondeo** (*polling*). En Windows con Docker es necesaria, porque los cambios del disco local no siempre generan eventos dentro del contenedor.
- En `app.js`, la función `waitForDb` intenta conectarse hasta 15 veces, esperando 2 segundos entre intentos, porque la API arranca antes de que la base de datos esté lista. Mientras tanto muestra `Esperando DB (i/15)` y, al conseguirlo, `Conectado a Postgres`.

## Entorno de producción

**Figura 1. Navegación a `api-crud-libros` y ejecución de `docker compose up -d --build`.**

**Qué se observa:** en la terminal se ve la secuencia `cd '.\practica 1'` → `cd .\api-crud-libros\` → `docker compose up -d --build`. En el explorador aparece la estructura del proyecto y en el editor el `docker-compose.dev.yml` con sus comentarios. El registro de construcción muestra las etapas `#1` a `#5`: lectura del Dockerfile, metadatos de la imagen base `node:20-alpine`, `.dockerignore` y contexto de construcción de 7.18 kB.

![Figura 1. Navegacion a api-crud-libros y ejecucion de docker compose up -d --build.](capturas/hacer%20la%20levntacion%20del%20contendor.png)

**Figura 2. Fin de la construcción, contenedores en marcha y `docker compose down`.**

**Qué se observa:** al terminar se lee `Image api-crud-libros-api Built`, `Container api-crud-libros-db-1 Running` y `Container api-crud-libros-api-1 Started` (`up 3/3`). Más abajo, `docker compose down` elimina la API, la base de datos y la red `api-crud-libros_default`. El volumen `pgsql-libdata` **no** aparece en la lista: sigue existiendo, y por eso los libros se conservan.

![Figura 2. Fin de la construccion, contenedores en marcha y docker compose down.](capturas/levantacion%202.png)

## Verificación en el navegador

**Figura 3. Interfaz web "Biblioteca Central" en `localhost:3000`.**

**Qué se observa:** la página, titulada "Catálogo con persistencia en Postgres y hot reload con Docker Compose", permite buscar por título, filtrar por categoría y por disponibilidad, y tiene un formulario para agregar o editar libros (los campos con `*` son obligatorios). Debajo se muestran las tarjetas con las portadas de los libros guardados en la base.

![Figura 3. Interfaz web Biblioteca Central en localhost:3000.](capturas/pagina%20.png)

**Figura 4. Respuesta JSON de `GET /libros` en el navegador.**

**Qué se observa:** la ruta `/libros` devuelve `"total": 5` y la lista de libros con `id`, `titulo`, `autorId`, `categoriaId`, `anio`, `disponible`, `portada`, `autor` y `categoria`. Los nombres del autor y de la categoría salen de unir las tablas de la base de datos mediante `JOIN`.

![Figura 4. Respuesta JSON de GET libros en el navegador.](capturas/pagina%202.png)

## Pruebas del CRUD con Postman

Se creó en Postman la colección **Laboratorio3_PracticaIndividual** con cinco solicitudes, una por cada operación. CRUD significa Create (crear), Read (leer), Update (actualizar) y Delete (eliminar), que se corresponden con los métodos HTTP POST, GET, PUT y DELETE.

**Resumen de las cinco pruebas realizadas:**

- **GET `/libros` — Leer todos:** respondió 200 OK con `"total": 5`.
- **GET `/libros/1` — Leer uno:** respondió 200 OK con "Cien anos de soledad".
- **POST `/libros` — Crear:** respondió 201 Created con un nuevo libro de `id: 6`.
- **PUT `/libros/1` — Actualizar:** respondió 200 OK con "Libro actualizado correctamente".
- **DELETE `/libros/5` — Eliminar:** respondió 200 OK con "Libro eliminado con exito".

**Figura 5. `GET http://localhost:3000/libros` en Postman.**

**Qué se observa:** respuesta **200 OK** (43 ms, 1.32 KB) con `"total": 5` y el detalle de cada libro; el primero es "Cien anos de soledad" de Gabriel Garcia Marquez, categoría "Real Magico", con su portada. En la barra lateral se ve la colección completa con las cinco solicitudes. Esto confirma que la API lee los datos desde PostgreSQL.

![Figura 5. GET http://localhost:3000/libros en Postman.](capturas/listar%20libros.png)

**Figura 6. `GET http://localhost:3000/libros/1` en Postman.**

**Qué se observa:** al agregar el `id` en la ruta, la API devuelve un solo libro (200 OK, 39 ms, 464 B): "Cien anos de soledad" (1967), disponible, con su portada, autor y categoría.

![Figura 6. GET http://localhost:3000/libros/1 en Postman.](capturas/listar%20libro%201.png)

**Figura 7. `POST http://localhost:3000/libros` con el cuerpo JSON del nuevo libro.**

**Qué se observa:** se envió en el cuerpo (*raw / JSON*): `{"titulo":"Prueba Postman","autorId":1,"categoriaId":1,"anio":2024,"disponible":true}`. La API respondió **201 Created** (54 ms) con `"mensaje": "Libro creado exitosamente"` y devolvió el libro con `id: 6`, asignado automáticamente por la base de datos, junto con el nombre del autor y la categoría.

![Figura 7. POST http://localhost:3000/libros con el cuerpo JSON del nuevo libro.](capturas/creacion%20de%20libros.png)

**Figura 8. `PUT http://localhost:3000/libros/1` con los datos modificados.**

**Qué se observa:** se cambió el título del libro 1 a "Cien anos editado" y su disponibilidad a `false`. La respuesta es **200 OK** (41 ms) con el mensaje `"Libro actualizado correctamente"` y el registro ya modificado.

![Figura 8. PUT http://localhost:3000/libros/1 con los datos modificados.](capturas/actualizar%20libro%20postman.png)

**Figura 9. `DELETE http://localhost:3000/libros/5` en Postman.**

**Qué se observa:** la API respondió **200 OK** (38 ms) con `"Libro eliminado con exito"` y devolvió el registro borrado: "El Principito" (id 5, Antoine de Saint-Exupery, 1943). A partir de aquí ese libro ya no aparece en los listados.

![Figura 9. DELETE http://localhost:3000/libros/5 en Postman.](capturas/postman%20libro%20delete.png)

## Filtros y catálogos de apoyo

Además del CRUD, la API acepta **filtros por parámetros en la URL** (*query string*): lo que va después del signo `?` indica qué condición aplicar. Estas pruebas se hicieron **después** de crear, editar y eliminar libros, por lo que los resultados reflejan esos cambios.

**Figura 10. `GET /libros?categoriaId=1`.**

**Qué se observa:** devuelve `"total": 2`: el libro 1 (ahora "Cien anos editado", `disponible: false`) y el libro 6 ("Prueba Postman"). Solo aparecen los libros de la categoría "Real Magico".

![Figura 10. GET libros con filtro categoriaId igual a 1.](capturas/juego%20de%20localhost%20de%20la%20practica%201.3.png)

**Figura 11. `GET /libros?disponible=true`.**

**Qué se observa:** devuelve `"total": 3`: "La casa de los espiritus", "Orgullo y prejuicio" y "Prueba Postman". No aparecen "1984" (que figura como no disponible), ni el libro 1, que quedó en `disponible: false` al editarlo, ni "El Principito", que se eliminó.

![Figura 11. GET libros con filtro disponible igual a true.](capturas/juego%20de%20localhost%20de%20la%20practica%201.4.png)

**Figura 12. `GET /autores`.**

**Qué se observa:** lista los 5 autores con su `id`, `nombre` y `nacionalidad`: Antoine de Saint-Exupery (Francesa), Gabriel Garcia Marquez (Colombiana), George Orwell (Britanica), Isabel Allende (Chilena) y Jane Austen (Britanica). Sirve para que el formulario de la interfaz llene el desplegable "Autor".

![Figura 12. GET autores en el navegador.](capturas/juego%20de%20localhost%20de%20la%20practica%201.png)

**Figura 13. `GET /categorias`.**

**Qué se observa:** lista las 5 categorías: Ciencia Ficcion, Clasico, Infantil, Novela Historica y Real Magico. Alimenta el desplegable "Categoría" de la interfaz y el filtro de la barra de búsqueda.

![Figura 13. GET categorias en el navegador.](capturas/juego%20de%20localhost%20de%20la%20practica%202.png)

## Entorno de desarrollo: hot reload

Para el modo desarrollo se ejecutó `docker compose -f docker-compose.dev.yml up --build`. Aquí **no** se usa `-d`, a propósito, para que los mensajes de la base de datos y de la API se vean en la propia terminal. Para comprobar el hot reload se modificó el mensaje que imprime la función `waitForDb` cuando logra conectarse a PostgreSQL, y se guardó varias veces el archivo `app.js`.

**Figura 44. Registros del entorno de desarrollo con el primer reinicio automático de la API.**

**Qué se observa:** primero la base de datos (`db-1`) informa que está escuchando en el puerto 5432 y que el sistema está listo para aceptar conexiones; luego la API (`api-1`) imprime "API de Libreria en puerto 3000" y "Conectado a Postgres…". Al final se lee que `api-1` fue **recreado** y terminó con código de salida 143.

![Figura 14. Registros del entorno de desarrollo con el primer reinicio de la API.](capturas/reload%201.png)

**Figura 15. Más cambios guardados y reinicios automáticos de `nodemon`.**

**Qué se observa:** en el editor se ve la función `waitForDb` con el `console.log` modificado (el texto se va alargando con lo que se agregaba) y la línea `Esperando DB (i/retries)`. En la terminal se repite la secuencia `restarting due to changes...` → `starting node app.js` → `API de Libreria en puerto 3000` → `Conectado a Postgres…". Cada reinicio ocurrió sin ejecutar ningún comando adicional ni reconstruir la imagen. Abajo aparece el menú de atajos de Docker Compose (ver en Docker Desktop, ver configuración, ver registros, activar *watch*, desacoplar).

![Figura 15. Mas cambios guardados y reinicios automaticos de nodemon.](capturas/reload%202.png)

**Sobre el código 143:** es la señal normal de terminación (SIGTERM) que Docker envía al contenedor cuando lo va a recrear. **No es un error de la aplicación**; es la prueba de que el reinicio por hot reload funcionó.

**En palabras simples:** es como editar un documento y que se "guarde y actualice" solo: se cambia una línea del código, se guarda, y la aplicación se reinicia con el cambio en un par de segundos, sin apagar y encender todo a mano.

## Detener el entorno

Para terminar se ejecutó `docker compose down`, que elimina los contenedores y la red. Como la base de datos usa el volumen con nombre `pgsql-libdata`, los libros siguen guardados la próxima vez que se levante el entorno.

---

# Práctica Individual 2: Blog con doble volumen

**Carpeta:** `practica 2`

**Objetivo:** desplegar un blog funcional con WordPress y MySQL usando **dos volúmenes separados**: uno para la base de datos y otro para los archivos de WordPress (temas, plugins e imágenes subidas), y demostrar que todo persiste aunque se eliminen los contenedores.

## Elementos del `docker-compose.yml`

- **Servicio `db`:** imagen `mysql:latest`, `restart: always` y variables de entorno que fijan la contraseña del administrador, el nombre de la base (`wordpress`), el usuario (`wordpress`) y su contraseña. Su carpeta de datos `/var/lib/mysql` se guarda en el volumen `db_data`.
- **Servicio `wordpress`:** imagen `wordpress:latest`, depende de `db`, publica el puerto `8080:80` y usa variables `WORDPRESS_DB_*` que apuntan al servicio `db`. Monta el volumen `wordpress_data` en `/var/www/html`.
- **Volumen `db_data`:** guarda la base de datos (entradas, usuarios, configuración del sitio).
- **Volumen `wordpress_data`:** guarda los archivos de WordPress: temas, plugins e **imágenes subidas**.

**Por qué dos volúmenes y no uno:** WordPress separa sus datos en dos lugares distintos. El *contenido* (entradas, usuarios, opciones del menú, ajustes) vive en tablas de la base de datos; los *archivos* (imágenes que sube el usuario, temas, plugins) viven en el sistema de archivos. Si se usara un solo volumen, ambos irían al mismo sitio y no se podrían gestionar ni respaldar de forma independiente. Separarlos además hace que una restauración de la base no afecte a los archivos y viceversa.

**Figura 16. Archivo `docker-compose.yml` de la práctica 2 y descarga de las imágenes.**

**Qué se observa:** en el editor se lee el comentario "# Aqui se define el blog, que sirve para la Practica 2 con doble volumen", el servicio `db` con `mysql:latest`, `restart: always` y las variables de entorno. En la terminal, `docker compose up -d` está descargando la imagen de MySQL (la barra de progreso marca 217.9 MB de 289 MB).

![Figura 16. Archivo docker-compose.yml de la practica 2 y descarga de las imagenes.](capturas/practica%202.png)

La primera vez tarda porque Docker debe descargar las imágenes desde Docker Hub; las siguientes veces ya las tiene guardadas en el equipo.

**Figura 17. Resultado de `docker compose up -d` en la práctica 2.**

**Qué se observa:** termina la descarga (`Image mysql:latest Pulled`, 198.5 s) y se crean la red `practica2_default`, los dos volúmenes (`practica2_wordpress_data` y `practica2_db_data`) y los contenedores `practica2-db-1` y `practica2-wordpress-1`. Que aparezcan **dos** volúmenes confirma el requisito del "doble volumen".

![Figura 17. Resultado de docker compose up -d en la practica 2.](capturas/practica%202.1.png)

## Instalación de WordPress

**Figura 18. Pantalla de selección de idioma de WordPress.**

**Qué se observa:** al entrar por primera vez a `localhost:8080`, el asistente pide el idioma predeterminado. Se eligió "Español" y se pulsó "Continuar".

![Figura 18. Pantalla de seleccion de idioma de WordPress.](capturas/empezar%20wodpress.png)

**Figura 19. Formulario de instalación de WordPress de la práctica 2.**

**Qué se observa:** datos configurados: título del sitio "laboratorio3(COM690PRACTICA2)", usuario "MonserratValdaPlaza" y un correo de pruebas. La contraseña fue calificada como "Fuerte" por el medidor de WordPress.

![Figura 19. Formulario de instalacion de WordPress de la practica 2.](capturas/empezar%20wodpress%202.png)

**Figura 20. Instalación completada ("¡Lo lograste!").**

**Qué se observa:** en `install.php?step=2`, WordPress confirma que quedó instalado y muestra el usuario creado. Desde aquí ya se puede iniciar sesión y empezar a crear contenido.

![Figura 20. Instalacion completada de WordPress.](capturas/empezar%20wodpress%203.png)

## Creación del contenido del blog

Ya dentro del panel, se personalizó el sitio: un texto de presentación en el encabezado, la entrada "Blog de Monserrat!" y varias imágenes de portadas de libros que se subieron a la biblioteca de medios. Estas imágenes son el contenido que luego se usa para comprobar la persistencia.

**Figura 21. Página principal del blog antes de reiniciar.**

**Qué se observa:** el encabezado muestra el título del sitio y una presentación personal ("Hola! Soy Monse, estoy estudiando la carrera de ingeniería de sistemas, me gusta escribir y leer y este es mi blog!"). La entrada "Blog de Monserrat!" comienza con la portada de *Harry Potter y la piedra filosofal*.

![Figura 21. Pagina principal del blog antes de reiniciar.](capturas/practica%202.2.png)

**Figura 22. Entrada del blog con la portada de "Belleza Oscura".**

**Qué se observa:** al bajar en la página se ve la fotografía del libro *Belleza Oscura* de Jessica Rivas, otra de las imágenes subidas.

![Figura 22. Entrada del blog con la portada de Belleza Oscura.](capturas/practica%202.3.png)

**Figura 23. Entrada del blog con la portada de "El Principito".**

**Qué se observa:** más abajo aparece la portada de *El Principito*, de Antoine de Saint-Exupéry, con la ilustración del Principito sobre una roca. En total el blog muestra tres imágenes de libros.

![Figura 23. Entrada del blog con la portada de El Principito.](capturas/practica%202.4.png)

**Figura 24. Biblioteca de medios de WordPress con las tres imágenes subidas.**

**Qué se observa:** en `wp-admin/upload.php` aparecen las imágenes "imagen libro 1", "imagen libro 2" e "imagen libro 3". Cuando se sube una imagen, WordPress guarda el archivo dentro de `/var/www/html/wp-content/uploads`, carpeta que pertenece al volumen `wordpress_data`.

![Figura 24. Biblioteca de medios con las tres imagenes subidas.](capturas/practica%202.5.png)

## Prueba de persistencia: detener y volver a levantar

Antes de apagar el entorno, se quiso comprobar qué pasa al intentar entrar con el blog apagado.

**Figura 25. `localhost:8080/wp-admin/upload.php` con el entorno detenido.**

**Qué se observa:** el navegador muestra "No se puede acceder a este sitio web – La página localhost ha rechazado la conexión" (`ERR_CONNECTION_REFUSED`). Es lo esperado mientras los contenedores están eliminados: ya no hay ningún proceso escuchando en el puerto 8080.

![Figura 25. localhost wp-admin upload.php con el entorno detenido.](capturas/practica%202.6.png)

**Figura 26. `docker compose down` seguido de `docker compose up -d` en la práctica 2.**

**Qué se observa:** primero se eliminan `practica2-wordpress-1`, `practica2-db-1` y la red (`down 3/3`); luego se vuelven a crear la red y los dos contenedores (`up 3/3`). Observa que **esta vez los volúmenes no se vuelven a crear**: Docker los reutiliza. Eso es exactamente lo que demuestra la persistencia.

![Figura 26. docker compose down seguido de docker compose up -d en la practica 2.](capturas/practica%202.9.png)

**Figura 27. Biblioteca de medios después de reiniciar.**

**Qué se observa:** las tres imágenes ("imagen libro 1", "imagen libro 2" e "imagen libro 3") siguen en la biblioteca. Los archivos subidos sobrevivieron porque estaban en el volumen `wordpress_data`.

![Figura 27. Biblioteca de medios despues de reiniciar.](capturas/practica%202.7.png)

**Figura 28. Página del blog después de reiniciar.**

**Qué se observa:** el blog conserva el título del sitio, el texto de presentación, la entrada "Blog de Monserrat!" y la portada de *Harry Potter*. Las entradas y la configuración sobrevivieron porque estaban en la base de datos, guardada en el volumen `db_data`.

![Figura 28. Pagina del blog despues de reiniciar.](capturas/practica%202.8.png)

**En palabras simples:** es como guardar los documentos en un disco externo (los volúmenes) en lugar de dejarlos dentro de la computadora que se va a formatear (los contenedores). Se pueden borrar y volver a crear los contenedores todas las veces que se quiera: mientras el disco externo esté conectado, las entradas y las imágenes siguen intactas.

---

# Problemas encontrados y cómo los interpretaron

Durante el laboratorio aparecieron situaciones que no eran fallos del sistema, sino comportamientos esperados o errores de escritura que sirvieron para aprender.

- **Error `ERR_CONNECTION_REFUSED` en `localhost:8080`** (ejercicio 3.1 y práctica 2).
  - Causa: no había contenedores en ejecución; se habían eliminado con `docker compose down`.
  - Solución: es normal. Basta con volver a ejecutar `docker compose up -d`.

- **`docker compose up -d -build` con un solo guion.**
  - Causa: error de escritura, la opción larga se escribe `--build`.
  - Solución: se repitió el comando con dos guiones.

- **Error `Socket fail to connect to localhost` en DBeaver (ejercicio 3.3).**
  - Causa: se comentó el puerto 3306, por lo que la base de datos dejó de ser accesible desde el equipo.
  - Solución: es una mejora de seguridad. Solo WordPress, por la red interna, puede acceder a la base de datos.

- **`nationality: null` en el listado de autores (ejercicio 3.5).**
  - Causa: en el JSON del POST se escribió `nacionality` y la API espera `nationality`.
  - Solución: los nombres de los campos deben coincidir exactamente con los de la API.

- **Descarga muy lenta de las imágenes de MongoDB (418.6 s) y de MySQL (198.5 s).**
  - Causa: primera descarga desde Docker Hub; son imágenes grandes.
  - Solución: solo ocurre la primera vez; después quedan almacenadas en el equipo.

- **El contenedor `api-1` termina con código 143 al usar hot reload.**
  - Causa: es la señal de terminación (SIGTERM) que Docker envía al recrear el contenedor.
  - Solución: no es un error de la aplicación, es una detención normal.

- **La API de la práctica 1 arranca antes que PostgreSQL.**
  - Causa: los contenedores inician casi a la vez y la base tarda más en estar lista.
  - Solución: la función `waitForDb` reintenta la conexión hasta 15 veces, esperando 2 s entre intentos.

- **`docker system prune -a` pedía confirmación.**
  - Causa: es un comando que elimina imágenes y caché sin uso.
  - Solución: se respondió `n` para no tener que descargar las imágenes de nuevo.

- **`docker-compose.dev.yml` repite toda la configuración del archivo de producción.**
  - Causa: la clave `extends` sugerida por la guía está obsoleta en Compose v2.
  - Solución: se redefinió la configuración completa en el archivo de desarrollo; es más verboso pero evita rutas relativas entre archivos.

---

# Conclusiones

- Con Docker Compose se pudieron levantar entornos completos de varios servicios (web, balanceador, base de datos, API) con un solo comando (`docker compose up -d`) y eliminarlos igual de fácil con `docker compose down`.

- Se comprobó cómo un **balanceador de carga con proxy inverso** reparte las peticiones entre varias aplicaciones, y cómo se agrega un nuevo servidor (`app4`) modificando solamente `docker-compose.yml` y `nginx.conf`.

- Se entendió la diferencia entre `down` y `down -v`: con `down` los **volúmenes conservan los datos** (WordPress y PostgreSQL siguieron funcionando tras reiniciar); con `down -v` la información se elimina por completo.

- Se observó que las redes de Compose permiten que los servicios se comuniquen por su nombre (`db`, `app1`…) y que no hace falta publicar el puerto de la base de datos hacia el equipo, lo cual es más seguro. Esto se comprobó en la práctica: al comentar el puerto 3306, DBeaver dejó de conectarse pero WordPress siguió funcionando sin problema.

- Se aprendió a **escalar** un servicio con `--scale` y la importancia de no fijar puertos del host cuando hay varias réplicas.

- Con las APIs conectadas a MongoDB y PostgreSQL, probadas con Postman y DBeaver, se verificó que las operaciones del CRUD persisten en bases de datos reales, en lugar de la memoria de la aplicación.

- El **hot reload** con `nodemon` y `--legacy-watch` agiliza el desarrollo, porque la aplicación se actualiza al guardar los cambios, sin reconstruir la imagen.

En conjunto, el laboratorio permitió pasar de ejecutar un solo contenedor a diseñar entornos multi-servicio reproducibles, persistentes y más fáciles de mantener, que es la base del trabajo con aplicaciones en la nube.