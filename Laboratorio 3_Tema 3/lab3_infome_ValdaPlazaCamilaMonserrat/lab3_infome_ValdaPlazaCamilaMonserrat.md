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

---

# Ejercicio 3.1: Aplicación web simple con un contenedor (Nginx)

**Carpeta:** `ejercicio1`

**Objetivo:** levantar un único servicio web con Nginx y mostrar en el navegador una página HTML propia.

## Qué contiene el `docker-compose.yml`

El archivo de este ejercicio es muy corto y tiene apenas cuatro líneas con significado:

- **La clave `services`** abre la lista de todo lo que se va a levantar. Dentro de ella se declara un único servicio llamado **`web`**, que es el contenedor donde vive Nginx.
- **La línea `image: nginx:latest`** indica qué programa se ejecuta dentro. Se usa la etiqueta `latest`, es decir, la versión más reciente de la imagen oficial de Nginx publicada en Docker Hub. Al no construir nada, Docker simplemente descarga esa imagen.
- **El apartado `ports` con el valor `"8080:80"`** hace que el puerto 80 del contenedor (donde Nginx escucha internamente) se publique en el puerto 8080 del equipo. El formato siempre es `puerto_del_equipo:puerto_del_contenedor`. Por eso se abre `http://localhost:8080`.
- **El apartado `volumes` con el valor `./html:/usr/share/nginx/html:ro`** monta la carpeta local `html` dentro de la ruta `/usr/share/nginx/html`, que es exactamente la carpeta donde Nginx busca las páginas web. El `:ro` del final significa *solo lectura*: el contenedor puede leer los archivos, pero no puede escribirlos ni borrarlos.

## La página que se publica

Dentro de la carpeta `html` se creó un archivo `index.html` muy sencillo: es un documento HTML estándar, con una etiqueta `<head>` que declara la codificación de caracteres y el título, y un `<body>` que contiene un único texto. Ese texto es lo que Nginx termina mostrando en el navegador. Como Nginx sirve por defecto el archivo `index.html`, no fue necesario indicar el nombre del archivo en la configuración.

## Pasos que se realizaron

- Se cambió de carpeta con `cd .\ejercicio1` y se ejecutó `docker compose up -d`.
- Se abrió `http://localhost:8080` en el navegador.
- Se editó el `index.html` para personalizar el mensaje y se recargó la página.
- Se ejecutó `docker compose down` para detener y eliminar el contenedor.
- Se volvió a cargar el navegador para comprobar el apagado.

**Figura 1. Ingreso a la carpeta `ejercicio1` y ejecución de `docker compose up -d`.**

**Qué se observa:** en la terminal se ve que primero se cambió de carpeta con `cd .\ejercicio1` y luego se ejecutó `docker compose up -d`. La salida indica `[+] up 2/2`: se crearon 2 recursos, el primero la red `ejercicio1_default` (*Created*) y el segundo el contenedor `ejercicio1-web-1` (*Started*). El bloque "What's next" es solo una sugerencia de Docker Desktop para abrir el panel de registros y no afecta al resultado.

![Figura 1. Ingreso a la carpeta ejercicio1 y ejecucion de docker compose up -d.](capturas/ejercicio%201.png)

**Figura 2. El contenedor `web-1` en marcha según el panel de Docker Desktop.**

**Qué se observa:** el panel de Docker Desktop muestra el proyecto `ejercicio1` con su contenedor `web-1`, cuyo identificador es `8930448bbe45`, la imagen `nginx:latest` y el enlace de puerto `8080:80` con el ícono de dirección externa. El punto verde junto al nombre indica que el contenedor está en ejecución. Esta figura confirma visualmente que el puerto 8080 quedó publicado hacia el equipo.

![Figura 2. El contenedor web-1 en marcha segun el panel de Docker Desktop.](capturas/ejercicio%201.4.png)

**Figura 3. El navegador muestra el contenido del `index.html` en `localhost:8080`.**

**Qué se observa:** al abrir `http://localhost:8080` aparece la palabra "Hola Mundo" en la esquina superior izquierda de la página. Esto confirma que el volumen montado está funcionando: el contenedor está sirviendo el archivo que se encuentra en la carpeta local del equipo.

![Figura 3. El navegador muestra Hola Mundo en localhost:8080.](capturas/ejercicio%201.1.png)

**Figura 4. El mensaje del `index.html` modificado a una versión personalizada.**

**Qué se observa:** después de editar el archivo local y guardarlo, el navegador muestra ahora "Hola Mundo, ESTE ES EL EJERCICIO 1, SOY MONSERRAT". No hizo falta reiniciar el contenedor ni volver a ejecutar ningún comando: como el archivo está montado en el contenedor, el cambio se refleja de inmediato al recargar. Esto demuestra la gran ventaja del volumen: **el contenido se puede editar sin tocar Docker**.

![Figura 4. El mensaje del index.html modificado a una version personalizada.](capturas/ejercicio%201.2.png)

**Figura 5. Salida del comando `docker compose down`.**

**Qué se observa:** la terminal muestra `[+] down 2/2`, con el contenedor `ejercicio1-web-1` y la red `ejercicio1_default` marcados como *Removed*. Con esto el entorno queda completamente apagado y el puerto 8080 vuelve a quedar libre.

![Figura 5. Salida del comando docker compose down.](capturas/ejercicio%201.3.png)

**Figura 6. Navegador en `localhost:8080` con el entorno apagado.**

**Qué se observa:** tras el `down` y al volver a cargar el navegador, aparece el mensaje "No se puede acceder a este sitio web – La página localhost ha rechazado la conexión" con el código `ERR_CONNECTION_REFUSED`. El contraste entre las Figuras 3 y 4 (página visible) y esta Figura 6 (error) demuestra que el servidor estaba realmente encendido y que `down` lo apagó.

![Figura 6. Navegador en localhost:8080 con el entorno apagado.](capturas/localhost%20pero%20ejercicio%201.png)

**En palabras simples:** Nginx es un servidor web. Se le "prestó" la carpeta `html` y él se encarga de mostrar lo que hay dentro cuando se entra a `localhost:8080`. Como la carpeta está montada y no copiada, cualquier cambio guardado en el equipo aparece al instante en el navegador. Al apagar el entorno, la página deja de estar disponible porque ya no hay ningún servidor encendido.

---

# Ejercicio 3.2: Balanceador de carga con Nginx y proxy inverso

**Carpeta:** `ejercicio2`

**Objetivo:** configurar un Nginx que reciba las peticiones y las reparta entre varias aplicaciones web (backends) que corren en contenedores distintos.

## Estructura del proyecto

La carpeta del ejercicio quedó organizada así:

- **`docker-compose.yml`**: define el balanceador y las cuatro aplicaciones.
- **`nginx.conf`**: archivo de configuración que Nginx leerá al arrancar.
- **`html/`**: carpeta con los cuatro archivos `app1.html`, `app2.html`, `app3.html` y `app4.html`.

Cada `appN.html` simula una aplicación distinta y muestra un mensaje diferente: "¡Hola desde la Aplicación 1!", "¡Saludos desde la Aplicación 2!", "¡Bienvenidos a la Aplicación 3!" y "¡Bienvenida la Aplicación 4!".

## El archivo `nginx.conf`

Este archivo tiene dos bloques que interesa entender:

- **El bloque `upstream backend`**: es la lista de servidores a los que se puede repartir el tráfico. Se llama `backend` y dentro se escriben cuatro líneas, una por aplicación, indicando el **nombre del servicio** y el puerto 80. Los nombres `app1`, `app2`, `app3` y `app4` no son direcciones IP: son los nombres de servicio de Docker Compose, y la red interna los traduce automáticamente a la dirección de cada contenedor.
- **El bloque `server`**: define el servidor virtual. La línea `listen 80` indica que Nginx espera peticiones en el puerto 80, y `server_name loadbalancer` le pone un nombre. Dentro, la sección `location /` captura **todas** las rutas que lleguen y las reenvía al grupo `backend` mediante la instrucción `proxy_pass`.
- **Las tres líneas `proxy_*_timeout`** fijan 10 segundos como tiempo máximo de espera para conectar, enviar y recibir. Se añadieron para que Nginx no se quede colgado si alguna aplicación no responde.

Sin la instrucción `proxy_pass` esto no funcionaría: Nginx solo sabe buscar por su cuenta entre los servidores del bloque `upstream`, y por defecto usa el algoritmo **round-robin**, que reparte las peticiones por turnos, una a cada servidor.

## El archivo `docker-compose.yml`

El archivo declara cinco servicios, pero solo uno es visible desde fuera:

- **`loadbalancer`**: es el único que publica el puerto 8080 hacia el equipo, de modo que es el único al que se puede entrar desde el navegador. Además monta el archivo `nginx.conf` sobre la ruta donde Nginx lee su configuración por defecto, y declara con `depends_on` que las cuatro aplicaciones deben existir antes de que él arranque.
- **`app1`, `app2`, `app3` y `app4`**: los cuatro backends. Cada uno monta su propio archivo HTML como `index.html` en solo lectura. **Ninguno de ellos publica puertos**: solo se alcanzan a través de la red privada.
- **La red `app-network`**: los cinco contenedores están conectados a ella, lo que permite que se hablen entre sí por su nombre.

**Figura 7. Ingreso a la carpeta `ejercicio2`, listado de archivos y ejecución de `docker compose up -d`.**

**Qué se observa:** con `cd .\ejercicio2` y `ls` se confirma que están la carpeta `html`, `docker-compose.yml` (710 bytes) y `nginx.conf` (436 bytes). Luego `up -d` crea la red `ejercicio2_app-network` y arranca cuatro contenedores: `app1`, `app3`, `app2` y `loadbalancer`. La línea `[+] up 5/5` cuenta 5 recursos: 1 red + 4 contenedores.

![Figura 7. Ingreso a la carpeta ejercicio2 y salida de docker compose up -d.](capturas/entrar%20a%20carpeta%201.png)

**Figura 8. Salida completa del comando `docker compose up -d` del ejercicio 3.2.**

**Qué se observa:** se aprecia la salida íntegra hasta el prompt final: los cinco recursos quedan en estado *Created* y *Started*, lo que confirma que el entorno multi-servicio funciona con un solo comando.

![Figura 8. Salida completa del comando docker compose up -d en ejercicio2.](capturas/ejercicio%202.0.png)

**Cómo leer la salida de `up`.** `[+] up 5/5` indica cuántos recursos quedaron listos. Debajo aparece cada uno con una marca verde: *Created* significa que la red o el volumen fue creado, *Started* que el contenedor fue iniciado, *Running* que ya estaba en ejecución y no hizo falta tocarlo, *Pulled* que la imagen se descargó de Docker Hub, *Built* que la imagen se construyó localmente y *Removed* que el recurso fue eliminado (al hacer `down`).

## Verificación del balanceo

Se abrió `http://localhost:8080` y se recargó la página varias veces. Aunque la dirección es siempre la misma, el contenido cambió entre las distintas aplicaciones, lo que demuestra que el balanceador reparte las peticiones.

**Figura 9. La petición fue atendida por `app1`.**

**Qué se observa:** el título que se lee en el navegador es "¡Hola desde la Aplicación 1!", lo que indica que esta petición concreta la sirvió el contenedor `app1`.

![Figura 9. Respuesta de la Aplicacion 1 en localhost:8080.](capturas/ejercicio%202.png)

**Figura 10. Tras recargar, la misma URL muestra la Aplicación 2.**

**Qué se observa:** aparece "¡Saludos desde la Aplicación 2!". La dirección del navegador no cambió (sigue siendo `localhost:8080`); lo único que cambió es el contenedor que respondió, porque el balanceador va rotando el destino.

![Figura 10. Respuesta de la Aplicacion 2 en localhost:8080.](capturas/ejercicio%202.2.png)

**Figura 11. Otra recarga muestra la Aplicación 3.**

**Qué se observa:** se lee "¡Bienvenidos a la Aplicación 3!". Estas tres respuestas, obtenidas desde una misma dirección y una misma URL, prueban el reparto *round-robin*.

![Figura 11. Respuesta de la Aplicacion 3 en localhost:8080.](capturas/ejercicio%202.1.png)

## Detener el entorno

**Figura 12. Ejecución de `docker compose down` en el ejercicio 3.2.**

**Qué se observa:** la línea `[+] down 5/5` confirma que se eliminaron los 4 contenedores (`loadbalancer`, `app2`, `app3`, `app1`) y la red `ejercicio2_app-network`, dejando el equipo limpio.

![Figura 12. Ejecucion de docker compose down en ejercicio2.](capturas/entrar%20a%20carpeta%202.png)

## Práctica adicional: agregar un cuarto contenedor (`app4`)

La guía pide, como práctica, añadir un contenedor más y balancear también hacia él. Para lograrlo se hicieron tres cambios:

- Se creó el archivo `html/app4.html` con su mensaje propio.
- Se agregó el servicio `app4` en el `docker-compose.yml` (igual que los demás, con su HTML montado en solo lectura y en la red `app-network`) y se incluyó en el `depends_on` del balanceador.
- Se añadió la línea `server app4:80;` dentro del bloque `upstream backend` de `nginx.conf`.

**Figura 13. Levantamiento con `app4` y consulta de `docker system prune -a` (cancelado).**

**Qué se observa:** la primera línea muestra que se escribió por error `-build` con un solo guion; la opción correcta lleva dos guiones (`--build`), así que se repitió el comando bien escrito. Los cinco contenedores (`app1`, `app2`, `app3`, `app4` y `loadbalancer`) aparecen como *Running*. Después se escribió `docker system prune -a`, que advierte que borraría contenedores detenidos, redes sin uso, imágenes sin contenedor asociado y la caché de construcción. Se respondió `n` para **cancelar** la limpieza y no perder imágenes que aún se necesitaban.

![Figura 13. Levantamiento con app4 y consulta de docker system prune -a (cancelado).](capturas/entrar%20a%20carpeta%203.png)

**Observación:** `docker system prune -a` es útil para liberar espacio, pero elimina imágenes que luego habría que volver a descargar (lo cual tarda). Por eso se confirmó con `n`.

Para terminar se ejecutó `docker compose down`, que ahora eliminó 6 recursos (el balanceador, las 4 aplicaciones y la red), y se pasó a la carpeta del siguiente ejercicio.

**Figura 14. `docker compose down` con `app4` (6/6) y paso a la carpeta `ejercicio3`.**

**Qué se observa:** se ven los 6 elementos eliminados (`loadbalancer`, `app3`, `app1`, `app2`, `app4` y la red). Con `cd ..` y `cd .\ejercicio3\` se llega a la siguiente carpeta y se ejecuta allí `docker compose up -d`.

![Figura 14. docker compose down con app4 y paso a la carpeta ejercicio3.](capturas/entrar%20a%20carpeta%204.png)

---

# Ejercicio 3.3: WordPress con base de datos MariaDB

**Carpeta:** `ejercicio3`

**Objetivo:** desplegar una aplicación web (WordPress) que depende de una base de datos, comprobar que los datos persisten y observar cómo se comporta el acceso a la base de datos desde fuera.

## Qué contiene el `docker-compose.yml`

- **El servicio `db`** usa la imagen `mariadb:latest`, que es compatible con MySQL y fue la que permitió abrirla desde DBeaver. En su apartado `environment` se declaran cuatro variables con prefijo `MYSQL_`: la contraseña del administrador, el nombre de la base de datos (`wordpress`), el usuario que se creará (`wordpress`) y su contraseña. Gracias a estas variables, el contenedor **crea la base y el usuario automáticamente** en su primer arranque, sin necesidad de scripts adicionales.
- **La ruta `/var/lib/mysql`** es la carpeta donde MariaDB guarda físicamente los datos. Al montarse el volumen `db_data` sobre ella, toda esa información queda fuera del contenedor y sobrevive aunque el contenedor se borre.
- **El servicio `wordpress`** usa la imagen `wordpress:latest` y se conecta a la base indicando en la variable `WORDPRESS_DB_HOST` el valor `db`. Esa es una clave importante: en lugar de una dirección IP se usa **el nombre del servicio**, porque la red de Compose resuelve ese nombre de forma automática. Las demás variables `WORDPRESS_DB_*` indican el nombre de la base y las credenciales, que deben coincidir con las del servicio `db`.
- **El apartado `depends_on`** indica que `db` debe iniciarse antes que `wordpress`.
- **El volumen `wordpress_data`** se monta sobre `/var/www/html`, que es la carpeta donde WordPress guarda sus archivos (temas, plugins y subidas).
- **`restart: always`** en ambos servicios hace que Docker los reinicie automáticamente si se detienen por un fallo.
- **El puerto `3306`** estaba publicado al principio para poder conectarse con DBeaver desde el equipo. La propia guía advierte que en producción no es seguro exponerlo; más abajo se comenta y se observa qué ocurre al desactivarlo.

**Figura 15. Salida de `docker compose up -d` del ejercicio 3.3 y posterior ciclo `down` / `up -d`.**

**Qué se observa:** en la primera salida aparecen *Created* para la red `ejercicio3_default` y para los dos volúmenes (`ejercicio3_wordpress_data` y `ejercicio3_db_data`), y *Started* para `ejercicio3-db-1` y `ejercicio3-wordpress-1`: son 5 recursos (`up 5/5`). Más abajo se ve el ciclo de la prueba de persistencia: `down` elimina 3 recursos y el siguiente `up -d` vuelve a crear 3.

![Figura 15. Salida de docker compose up -d en ejercicio3 con sus dos volumenes.](capturas/entrar%20a%20carpeta%205.png)

## Paso 1: instalar WordPress

En el navegador se entró a `http://localhost:8080`. Al ser la primera vez, WordPress muestra su asistente de instalación: primero se pide el idioma y luego los datos del sitio.

**Figura 16. Formulario de instalación de WordPress del ejercicio 3.3.**

**Qué se observa:** en el paso 1 del asistente se completaron el título del sitio ("Laboratorio3_COM690"), el nombre de usuario ("monserratvalda") y un correo de pruebas. La contraseña fue evaluada como "Medio" por el medidor de fuerza de WordPress.

![Figura 16. Formulario de instalacion de WordPress del ejercicio 3.](capturas/inicar%20wodpress.png)

**Figura 17. Mensaje "¡Lo lograste!" al finalizar la instalación.**

**Qué se observa:** WordPress confirma en `install.php?step=2` que ya quedó instalado y muestra el usuario creado. Internamente, en este momento WordPress creó todas sus tablas dentro de la base de datos del contenedor `db`.

![Figura 17. Mensaje de confirmacion al finalizar la instalacion.](capturas/lo%20lograste%20wodpress.png)

**Figura 18. Página de inicio del blog con la entrada "¡Hola, mundo!".**

**Qué se observa:** el sitio ya es visible en `localhost:8080`, con el título personalizado ("Blog de CAMILA MONSERRAT VALDA PLAZA"), el enlace "Página de ejemplo" y la entrada de bienvenida que WordPress crea por defecto. La barra negra superior indica que hay una sesión iniciada.

![Figura 18. Pagina de inicio del blog con la entrada de bienvenida.](capturas/pagian%20inicio%20de%20wodpress.png)

**Figura 19. Panel de administración de WordPress (`wp-admin`).**

**Qué se observa:** es el escritorio de administración, desde donde se gestionan entradas, páginas, medios, apariencia y plugins. WordPress sugiere actualizar a la versión 7.1.3; para el laboratorio no fue necesario.

![Figura 19. Panel de administracion de WordPress (wp-admin).](capturas/panel%20central.png)

## Paso 2: hacer un cambio visible

Para comprobar luego que los cambios se guardan en la base de datos y no en el contenedor, se modificó el texto del menú del sitio: pasó de "Página de ejemplo" a "Es mi página, soy monse!".

**Figura 20. El menú del sitio ya modificado.**

**Qué se observa:** en la esquina superior derecha el enlace ahora dice "Es mi página, soy monse!". Este cambio queda guardado en la base de datos, y no en el sistema de archivos del contenedor de WordPress.

![Figura 20. Sitio con el menu modificado.](capturas/pagina%20se%20cambio%20algo%20wordpress.png)

## Paso 3: probar la persistencia (`down` y `up`)

Se ejecutó `docker compose down` y luego otra vez `docker compose up -d`. Con `down` se eliminan los contenedores y la red, pero **no** los volúmenes; al volver a levantar, MariaDB encuentra sus datos en `db_data` y WordPress los suyos en `wordpress_data`, así que no hace falta reinstalar nada.

El ciclo completo se observa en la **Figura 15**: los contenedores y la red se eliminan (`down 3/3`) y se vuelven a crear (`up 3/3`). El dato clave es que en el segundo `up` **no aparece ningún volumen como *Created***: ya existían y Docker los reutilizó. Eso es justamente la demostración de que los datos sobrevivieron.

**En palabras simples:** es como apagar y volver a encender una computadora: los programas se reinician, pero los archivos guardados en el disco siguen ahí. El volumen es ese disco.

## Paso 4: ver la base de datos con DBeaver

Para mirar por dentro la base de datos se usó DBeaver, creando una conexión con el controlador MariaDB (compatible con MySQL) hacia el puerto publicado 3306.

**Figura 21. Configuración de la conexión en DBeaver.**

**Qué se observa:** los datos son servidor `localhost`, puerto `3306`, base de datos `wordpress` y usuario `wordpress` (los mismos definidos en las variables de entorno; la contraseña se muestra oculta con puntos). La URL generada es `jdbc:mariadb://localhost:3306/wordpress`.

![Figura 21. Configuracion de la conexion en DBeaver.](capturas/conexion%20maria%20db%20dbeaver.png)

**Figura 22. Tablas creadas por WordPress y contenido de la tabla `wp_posts`.**

**Qué se observa:** a la izquierda se ve el árbol completo de tablas que WordPress creó (`wp_options`, `wp_posts`, `wp_users`, `wp_terms`, etc.). En `wp_posts` se leen 9 filas y, en la columna `post_content`, aparece el enlace de navegación con la etiqueta "Es mi página, soy monse!". Esto prueba que el cambio hecho desde la web quedó almacenado en la base de datos.

![Figura 22. Tablas de WordPress y contenido de la tabla wp_posts en DBeaver.](capturas/se%20pudo%20hacer%20la%20conexión%20dbeaver%20cambio%20en%20la%20pagina.png)

## Paso 5: comentar el puerto 3306 (buena práctica de seguridad)

Siguiendo la advertencia de la guía, se comentaron las líneas `ports:` y `- "3306:3306"` del servicio `db` (anteponiendo `#`) y se reinició el entorno.

**Figura 23. Puerto 3306 comentado en el `docker-compose.yml` y reinicio del entorno.**

**Qué se observa:** en el editor, las líneas `#ports:` y `#- "3306:3306"` aparecen en gris (comentadas), con el aviso "¡Cuidado en producción! Exponer el puerto directamente no es seguro.". En la terminal se ve el ciclo completo "up -d" → "down" → "up -d" que se aplicó para que el cambio tomara efecto.

![Figura 23. Puerto 3306 comentado y reinicio del entorno.](capturas/puerto%20ocultado%20ejercicio%203.png)

**Figura 24. Error de DBeaver al no estar publicado el puerto 3306.**

**Qué se observa:** DBeaver informa `SQL Error [08000]: Socket fail to connect to localhost. Connection refused: getsockopt`. Es el resultado esperado: como el puerto ya no está abierto hacia el equipo, ningún programa externo puede entrar a la base de datos.

![Figura 24. Error de DBeaver al no estar publicado el puerto 3306.](capturas/fallo%20al%20comentar%20el%20puerto%20en%20ejercicio%203.png)

**En palabras simples:** antes, la base de datos tenía una "ventana" abierta hacia fuera por la que DBeaver se asomaba. Al cerrar esa ventana (comentar el puerto) DBeaver ya no puede entrar, pero WordPress sigue funcionando porque habla con la base **por dentro**, a través de la red privada de Docker, usando el nombre `db`. Es más seguro porque el mundo exterior no puede tocar la base de datos.

## Paso 6: eliminar todo, incluidos los volúmenes

**Figura 25. `docker compose down -v` en el ejercicio 3.3.**

**Qué se observa:** se eliminan los dos contenedores, los volúmenes `ejercicio3_db_data` y `ejercicio3_wordpress_data` y la red (`down 5/5`). A partir de aquí la información del blog se perdió definitivamente: si se vuelve a levantar el entorno, WordPress pedirá instalarse desde cero.

![Figura 25. docker compose down -v en ejercicio3.](capturas/se%20eliminaron%20los%20volumenes.png)

**Observación:** diferencia clave → `docker compose down` **conserva** los datos; `docker compose down -v` los **destruye**.

---

# Ejercicio 3.4: Múltiples instancias de un servicio (escalado)

**Carpeta:** `ejercicio4`

**Objetivo:** aprender a ejecutar varias copias de un mismo servicio.

## Qué contiene el `docker-compose.yml`

El archivo de este ejercicio es el más breve de todos: solo declara un servicio `web` que usa la imagen `nginx:latest`. No hay nada más.

Lo importante es lo que **no** tiene: **no define puertos publicados**. Si tuviera `"8080:80"`, los tres contenedores intentarían usar el mismo puerto 8080 del equipo a la vez y Docker no podría levantarlos. Por eso el escalado se hace sobre servicios sin un puerto fijo en el host (o con un balanceador delante).

**Figura 26. Escalado del servicio `web` de 3 a 2 réplicas y posterior eliminación.**

**Qué se observa:** la salida de `up -d --scale web=3` muestra `up 4/4` con la red `ejercicio4_default` *Created* y los tres contenedores `web-1`, `web-2` y `web-3` *Started*. Luego `docker compose scale web=2` marca `web-1` y `web-2` como *Running* y `web-3` como *Removed*. El `docker ps` posterior lista únicamente `ejercicio4-web-1` y `ejercicio4-web-2` (imagen `nginx:latest`, puerto interno `80/tcp`). Por último `down` elimina ambos.

![Figura 26. Escalado del servicio web de 3 a 2 replicas y posterior eliminacion.](capturas/ejercicio%204.png)

**Comandos ejecutados:**

- `docker compose up -d --scale web=3`: levantó 3 contenedores del servicio `web`.
- `docker compose scale web=2`: redujo a 2 réplicas.
- `docker ps`: listó los contenedores activos para comprobar que solo quedaban 2.
- `docker compose down`: eliminó los contenedores restantes y la red.

**En palabras simples:** escalar es "fotocopiar" un servicio: se piden 3 copias del mismo programa y luego se dice "mejor solo 2". Docker enciende o apaga las copias necesarias sin tocar el resto. Así se maneja más o menos carga de usuarios.

**Observación:** la guía propone reducir a `web=1`; en esta práctica se redujo a `web=2` para ver claramente cómo desaparece una sola réplica y siguen existiendo varias.

---

# Ejercicio 3.5: Aplicación Node.js conectada a MongoDB

**Carpeta:** `ejercicio5`

**Objetivo:** ejecutar una API hecha con Node.js/Express que guarda sus datos en MongoDB, una base de datos orientada a documentos (no usa tablas, sino documentos tipo JSON).

## Archivos del proyecto

- **`app.js`**: código de la API. Define rutas como `POST /authors` (guardar un autor), `GET /authors` (listarlos) y `GET /authors/:id` (obtener uno). Se conecta a la base con la dirección `mongodb://marcelo:secret@db:27017`, donde `db` es el nombre del otro servicio y no una IP.
- **`Dockerfile`**: parte de la imagen `node:20`, define `/home/app` como carpeta de trabajo, copia el código, ejecuta `npm install` y arranca con el comando de desarrollo.
- **`package.json` y `package-lock.json`**: lista de librerías de Node que necesita la aplicación (`express`, `mongodb`, `nodemon`) y sus versiones exactas.
- **`docker-compose.yml`**: define dos servicios, la aplicación Node y la base de datos, más un volumen `mongo-data`.
- **`.gitignore`**: evita subir a Git archivos que no deben versionarse (por ejemplo `node_modules`).

Sobre el `docker-compose.yml`: el servicio `app` se construye con `build: .` (Docker lee el `Dockerfile` de esa carpeta), publica el puerto 3000 y se enlaza con `db` mediante `links`. El servicio `db` usa la imagen `amd64/mongo`, publica el puerto 27017 y define las variables de entorno que fijan el usuario y la contraseña del administrador. Su carpeta `/data/db` se monta sobre el volumen `mongo-data`.

**Figura 27. Explorador de archivos de `ejercicio5` y salida de `docker compose up -d`.**

**Qué se observa:** a la izquierda se ven los archivos del proyecto (`.gitignore`, `app.js`, `docker-compose.yml`, `Dockerfile`, `package-lock.json`, `package.json`). En la terminal aparece `Image amd64/mongo Pulled` con 418.6 s (la descarga de la base de datos) y el registro de construcción de la imagen de la aplicación (`#1`, `#2`, `#3`…), que parte de `node:20`. En el editor se alcanza a ver la ruta `app.post('/authors', ...)` que imprime "Author creado!" y devuelve el autor como JSON.

![Figura 27. Explorador de archivos de ejercicio5 y salida de docker compose up -d.](capturas/ejercicio%205.png)

**Figura 28. Respuesta de la API en `localhost:3000`.**

**Qué se observa:** la ruta raíz responde "Hello World!", lo que confirma que el contenedor de Node está corriendo y que el puerto 3000 está publicado hacia el equipo.

![Figura 28. Respuesta de la API en localhost:3000.](capturas/ejercicio%205.1.png)

## Pruebas con Postman

Se creó una colección en Postman llamada **LABORATORIO 3 EJERCICIO 5** con las solicitudes **Guardar authors** (POST) y **Listar authors** (GET).

**Figura 29. `POST http://localhost:3000/authors` con el cuerpo JSON del autor.**

**Qué se observa:** se envió en el cuerpo (*raw / JSON*) los datos `{"name":"Juana","nacionality":"Boliviana"}`. La API respondió **200 OK** (85 ms) y devolvió el documento guardado con su identificador `_id` generado por MongoDB.

![Figura 29. POST http://localhost:3000/authors con el cuerpo JSON del autor.](capturas/ejercicio%205.2.png)

**Figura 30. `GET http://localhost:3000/authors`: lista de autores guardados.**

**Qué se observa:** la respuesta es un arreglo con el autor "Juana", su `_id` y `"nationality": null`. Esto confirma que el documento quedó guardado en MongoDB.

![Figura 30. GET http://localhost:3000/authors con la lista de autores.](capturas/ejercicio%205.3.png)

**Observación:** el campo `nationality` salió `null` porque en la petición se escribió `nacionality` (con otra ortografía) y la API espera exactamente `nationality`; como los nombres no coinciden, el código lo tomó como `undefined` y lo guardó como `null`. Aprendizaje: en una API los nombres de los campos del JSON deben coincidir exactamente con los que el código espera.

Al terminar, la guía indica cerrar el entorno con `docker compose down`, que detiene y elimina los contenedores y deja intacto el volumen `mongo-data`.

---

# Ejercicio 3.6: Aplicación Node.js conectada a PostgreSQL

**Carpeta:** `ejercicio6`

**Objetivo:** ejecutar una API de Node.js/Express que guarda películas (`/movies`) en una base de datos relacional, con reinicio automático mediante `nodemon`.

> **Nota:** la guía titula este ejercicio "NodeJS conectándose a MySQL", pero el entorno que se levantó usa **PostgreSQL 16.4** como base de datos. La API se conecta con el paquete `pg` y las consultas usan parámetros `$1`, `$2` (sintaxis propia de PostgreSQL). El puerto publicado en el equipo es `54321:5432`.

## Qué contiene el `docker-compose.yml`

- **El servicio `api`** se construye con `build: .`, publica el puerto 3000 y se enlaza con `db`. Su apartado `volumes` tiene dos líneas: la primera monta la carpeta actual del equipo sobre `/home/app` dentro del contenedor, y la segunda monta un volumen anónimo sobre `/home/app/node_modules`. Esta segunda línea es **esencial**: si no estuviera, el montaje de la carpeta local (que no contiene `node_modules`) **borraría** todas las dependencias que se instalaron al construir la imagen.
- **El servicio `db`** usa la imagen `postgres:16.4`, publica el puerto 54321 del equipo hacia el 5432 del contenedor, y define la contraseña y el nombre de la base (`dbmovies`). La línea `shm_size: 128mb` le asigna memoria compartida adicional, que PostgreSQL necesita para sus operaciones internas.
- **El archivo `./db.sql`** se monta en la carpeta especial `/docker-entrypoint-initdb.d`, que PostgreSQL ejecuta **solo la primera vez** que se crea el volumen. Por eso hace falta también el volumen `pgsql-data`, que guarda los datos en `/var/lib/postgresql/data`.
- **`restart: always`** hace que la base de datos se reinicie sola si se detiene.

## Levantamiento

Se usó `docker compose up -d --build` porque la imagen de la API se construye localmente, y luego `docker compose logs -f api` para ver en vivo los mensajes del servicio (`logs` muestra lo que escribe el servicio y `-f` lo sigue en tiempo real).

**Figura 31. La API responde "Hola Mundo!" en `localhost:3000`.**

**Qué se observa:** es la versión inicial de la ruta raíz de la API: el texto "Hola Mundo!" confirma que el servicio está activo y escuchando.

![Figura 31. La API responde Hola Mundo en localhost:3000.](capturas/ejercicio%206.png)

**Figura 32. "Hola Mundo 2!" en el navegador, el `app.js` en el editor y la salida de `up -d --build` con los registros de `logs -f api`.**

**Qué se observa:** a la izquierda el navegador muestra ahora "Hola Mundo 2!" porque se modificó ese texto en el código. En la terminal se ve la construcción (*Built* 5.5 s), la red y los dos contenedores *Started*. Los registros muestran `nodemon 3.1.14`, que vigila los archivos `js, mjs, cjs, json`, inicia `node app.js` y la API anuncia "Servidor ejecutándose en el puerto 3000". También se alcanza a ver la lista de validaciones `validateMoviePatch`, que revisa los datos antes de actualizar una película.

![Figura 32. Navegador con Hola Mundo 2, app.js y salida de docker compose up -d --build y logs.](capturas/ejercicio%206.3.png)

## Pruebas con Postman

Se reutilizó la colección `lab2.1_collection_ValdaPlazaCamilaMonserrat` del Laboratorio 2.1, que ya contenía solicitudes para listar, agregar, actualizar y eliminar películas.

**Figura 33. `GET http://localhost:3000/movies` con la base de datos vacía.**

**Qué se observa:** la respuesta es **200 OK** (41 ms) con `[]`: la lista está vacía porque aún no se había guardado ninguna película. Muestra que la API ya consulta correctamente a PostgreSQL.

![Figura 33. GET http://localhost:3000/movies con la base de datos vacia.](capturas/ejercicio%206.1.png)

**Figura 34. `POST http://localhost:3000/movies` creando la película "Scary Movie".**

**Qué se observa:** se envió `{"title":"Scary Movie","year":"2000"}`. La API respondió **201 Created** (28 ms) con `id: 1`, el título y el año ya convertido a número (`2000`), señal de que la API valida y transforma los datos antes de guardarlos. El código 201 significa "recurso creado".

![Figura 34. POST http://localhost:3000/movies creando la pelicula Scary Movie.](capturas/ejercicio%206.2.png)

**En palabras simples:** primero se preguntó "¿qué películas hay?" y la respuesta fue "ninguna". Luego se agregó una y la base de datos le asignó el número 1. Si se vuelve a preguntar, la película aparece porque quedó guardada.

Al terminar, el entorno se cierra con `docker compose down`, igual que en los demás ejercicios.

---

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

**Figura 35. Navegación a `api-crud-libros` y ejecución de `docker compose up -d --build`.**

**Qué se observa:** en la terminal se ve la secuencia `cd '.\practica 1'` → `cd .\api-crud-libros\` → `docker compose up -d --build`. En el explorador aparece la estructura del proyecto y en el editor el `docker-compose.dev.yml` con sus comentarios. El registro de construcción muestra las etapas `#1` a `#5`: lectura del Dockerfile, metadatos de la imagen base `node:20-alpine`, `.dockerignore` y contexto de construcción de 7.18 kB.

![Figura 35. Navegacion a api-crud-libros y ejecucion de docker compose up -d --build.](capturas/hacer%20la%20levntacion%20del%20contendor.png)

**Figura 36. Fin de la construcción, contenedores en marcha y `docker compose down`.**

**Qué se observa:** al terminar se lee `Image api-crud-libros-api Built`, `Container api-crud-libros-db-1 Running` y `Container api-crud-libros-api-1 Started` (`up 3/3`). Más abajo, `docker compose down` elimina la API, la base de datos y la red `api-crud-libros_default`. El volumen `pgsql-libdata` **no** aparece en la lista: sigue existiendo, y por eso los libros se conservan.

![Figura 36. Fin de la construccion, contenedores en marcha y docker compose down.](capturas/levantacion%202.png)

## Verificación en el navegador

**Figura 37. Interfaz web "Biblioteca Central" en `localhost:3000`.**

**Qué se observa:** la página, titulada "Catálogo con persistencia en Postgres y hot reload con Docker Compose", permite buscar por título, filtrar por categoría y por disponibilidad, y tiene un formulario para agregar o editar libros (los campos con `*` son obligatorios). Debajo se muestran las tarjetas con las portadas de los libros guardados en la base.

![Figura 37. Interfaz web Biblioteca Central en localhost:3000.](capturas/pagina%20.png)

**Figura 38. Respuesta JSON de `GET /libros` en el navegador.**

**Qué se observa:** la ruta `/libros` devuelve `"total": 5` y la lista de libros con `id`, `titulo`, `autorId`, `categoriaId`, `anio`, `disponible`, `portada`, `autor` y `categoria`. Los nombres del autor y de la categoría salen de unir las tablas de la base de datos mediante `JOIN`.

![Figura 38. Respuesta JSON de GET libros en el navegador.](capturas/pagina%202.png)

## Pruebas del CRUD con Postman

Se creó en Postman la colección **Laboratorio3_PracticaIndividual** con cinco solicitudes, una por cada operación. CRUD significa Create (crear), Read (leer), Update (actualizar) y Delete (eliminar), que se corresponden con los métodos HTTP POST, GET, PUT y DELETE.

**Resumen de las cinco pruebas realizadas:**

- **GET `/libros` — Leer todos:** respondió 200 OK con `"total": 5`.
- **GET `/libros/1` — Leer uno:** respondió 200 OK con "Cien anos de soledad".
- **POST `/libros` — Crear:** respondió 201 Created con un nuevo libro de `id: 6`.
- **PUT `/libros/1` — Actualizar:** respondió 200 OK con "Libro actualizado correctamente".
- **DELETE `/libros/5` — Eliminar:** respondió 200 OK con "Libro eliminado con exito".

**Figura 39. `GET http://localhost:3000/libros` en Postman.**

**Qué se observa:** respuesta **200 OK** (43 ms, 1.32 KB) con `"total": 5` y el detalle de cada libro; el primero es "Cien anos de soledad" de Gabriel Garcia Marquez, categoría "Real Magico", con su portada. En la barra lateral se ve la colección completa con las cinco solicitudes. Esto confirma que la API lee los datos desde PostgreSQL.

![Figura 39. GET http://localhost:3000/libros en Postman.](capturas/listar%20libros.png)

**Figura 40. `GET http://localhost:3000/libros/1` en Postman.**

**Qué se observa:** al agregar el `id` en la ruta, la API devuelve un solo libro (200 OK, 39 ms, 464 B): "Cien anos de soledad" (1967), disponible, con su portada, autor y categoría.

![Figura 40. GET http://localhost:3000/libros/1 en Postman.](capturas/listar%20libro%201.png)

**Figura 41. `POST http://localhost:3000/libros` con el cuerpo JSON del nuevo libro.**

**Qué se observa:** se envió en el cuerpo (*raw / JSON*): `{"titulo":"Prueba Postman","autorId":1,"categoriaId":1,"anio":2024,"disponible":true}`. La API respondió **201 Created** (54 ms) con `"mensaje": "Libro creado exitosamente"` y devolvió el libro con `id: 6`, asignado automáticamente por la base de datos, junto con el nombre del autor y la categoría.

![Figura 41. POST http://localhost:3000/libros con el cuerpo JSON del nuevo libro.](capturas/creacion%20de%20libros.png)

**Figura 42. `PUT http://localhost:3000/libros/1` con los datos modificados.**

**Qué se observa:** se cambió el título del libro 1 a "Cien anos editado" y su disponibilidad a `false`. La respuesta es **200 OK** (41 ms) con el mensaje `"Libro actualizado correctamente"` y el registro ya modificado.

![Figura 42. PUT http://localhost:3000/libros/1 con los datos modificados.](capturas/actualizar%20libro%20postman.png)

**Figura 43. `DELETE http://localhost:3000/libros/5` en Postman.**

**Qué se observa:** la API respondió **200 OK** (38 ms) con `"Libro eliminado con exito"` y devolvió el registro borrado: "El Principito" (id 5, Antoine de Saint-Exupery, 1943). A partir de aquí ese libro ya no aparece en los listados.

![Figura 43. DELETE http://localhost:3000/libros/5 en Postman.](capturas/postman%20libro%20delete.png)

## Filtros y catálogos de apoyo

Además del CRUD, la API acepta **filtros por parámetros en la URL** (*query string*): lo que va después del signo `?` indica qué condición aplicar. Estas pruebas se hicieron **después** de crear, editar y eliminar libros, por lo que los resultados reflejan esos cambios.

**Figura 44. `GET /libros?categoriaId=1`.**

**Qué se observa:** devuelve `"total": 2`: el libro 1 (ahora "Cien anos editado", `disponible: false`) y el libro 6 ("Prueba Postman"). Solo aparecen los libros de la categoría "Real Magico".

![Figura 44. GET libros con filtro categoriaId igual a 1.](capturas/juego%20de%20localhost%20de%20la%20practica%201.3.png)

**Figura 45. `GET /libros?disponible=true`.**

**Qué se observa:** devuelve `"total": 3`: "La casa de los espiritus", "Orgullo y prejuicio" y "Prueba Postman". No aparecen "1984" (que figura como no disponible), ni el libro 1, que quedó en `disponible: false` al editarlo, ni "El Principito", que se eliminó.

![Figura 45. GET libros con filtro disponible igual a true.](capturas/juego%20de%20localhost%20de%20la%20practica%201.4.png)

**Figura 46. `GET /autores`.**

**Qué se observa:** lista los 5 autores con su `id`, `nombre` y `nacionalidad`: Antoine de Saint-Exupery (Francesa), Gabriel Garcia Marquez (Colombiana), George Orwell (Britanica), Isabel Allende (Chilena) y Jane Austen (Britanica). Sirve para que el formulario de la interfaz llene el desplegable "Autor".

![Figura 46. GET autores en el navegador.](capturas/juego%20de%20localhost%20de%20la%20practica%201.png)

**Figura 47. `GET /categorias`.**

**Qué se observa:** lista las 5 categorías: Ciencia Ficcion, Clasico, Infantil, Novela Historica y Real Magico. Alimenta el desplegable "Categoría" de la interfaz y el filtro de la barra de búsqueda.

![Figura 47. GET categorias en el navegador.](capturas/juego%20de%20localhost%20de%20la%20practica%202.png)

## Entorno de desarrollo: hot reload

Para el modo desarrollo se ejecutó `docker compose -f docker-compose.dev.yml up --build`. Aquí **no** se usa `-d`, a propósito, para que los mensajes de la base de datos y de la API se vean en la propia terminal. Para comprobar el hot reload se modificó el mensaje que imprime la función `waitForDb` cuando logra conectarse a PostgreSQL, y se guardó varias veces el archivo `app.js`.

**Figura 48. Registros del entorno de desarrollo con el primer reinicio automático de la API.**

**Qué se observa:** primero la base de datos (`db-1`) informa que está escuchando en el puerto 5432 y que el sistema está listo para aceptar conexiones; luego la API (`api-1`) imprime "API de Libreria en puerto 3000" y "Conectado a Postgres…". Al final se lee que `api-1` fue **recreado** y terminó con código de salida 143.

![Figura 48. Registros del entorno de desarrollo con el primer reinicio de la API.](capturas/reload%201.png)

**Figura 49. Más cambios guardados y reinicios automáticos de `nodemon`.**

**Qué se observa:** en el editor se ve la función `waitForDb` con el `console.log` modificado (el texto se va alargando con lo que se agregaba) y la línea `Esperando DB (i/retries)`. En la terminal se repite la secuencia `restarting due to changes...` → `starting node app.js` → `API de Libreria en puerto 3000` → `Conectado a Postgres…". Cada reinicio ocurrió sin ejecutar ningún comando adicional ni reconstruir la imagen. Abajo aparece el menú de atajos de Docker Compose (ver en Docker Desktop, ver configuración, ver registros, activar *watch*, desacoplar).

![Figura 49. Mas cambios guardados y reinicios automaticos de nodemon.](capturas/reload%202.png)

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

**Figura 50. Archivo `docker-compose.yml` de la práctica 2 y descarga de las imágenes.**

**Qué se observa:** en el editor se lee el comentario "# Aqui se define el blog, que sirve para la Practica 2 con doble volumen", el servicio `db` con `mysql:latest`, `restart: always` y las variables de entorno. En la terminal, `docker compose up -d` está descargando la imagen de MySQL (la barra de progreso marca 217.9 MB de 289 MB).

![Figura 50. Archivo docker-compose.yml de la practica 2 y descarga de las imagenes.](capturas/practica%202.png)

La primera vez tarda porque Docker debe descargar las imágenes desde Docker Hub; las siguientes veces ya las tiene guardadas en el equipo.

**Figura 51. Resultado de `docker compose up -d` en la práctica 2.**

**Qué se observa:** termina la descarga (`Image mysql:latest Pulled`, 198.5 s) y se crean la red `practica2_default`, los dos volúmenes (`practica2_wordpress_data` y `practica2_db_data`) y los contenedores `practica2-db-1` y `practica2-wordpress-1`. Que aparezcan **dos** volúmenes confirma el requisito del "doble volumen".

![Figura 51. Resultado de docker compose up -d en la practica 2.](capturas/practica%202.1.png)

## Instalación de WordPress

**Figura 52. Pantalla de selección de idioma de WordPress.**

**Qué se observa:** al entrar por primera vez a `localhost:8080`, el asistente pide el idioma predeterminado. Se eligió "Español" y se pulsó "Continuar".

![Figura 52. Pantalla de seleccion de idioma de WordPress.](capturas/empezar%20wodpress.png)

**Figura 53. Formulario de instalación de WordPress de la práctica 2.**

**Qué se observa:** datos configurados: título del sitio "laboratorio3(COM690PRACTICA2)", usuario "MonserratValdaPlaza" y un correo de pruebas. La contraseña fue calificada como "Fuerte" por el medidor de WordPress.

![Figura 53. Formulario de instalacion de WordPress de la practica 2.](capturas/empezar%20wodpress%202.png)

**Figura 54. Instalación completada ("¡Lo lograste!").**

**Qué se observa:** en `install.php?step=2`, WordPress confirma que quedó instalado y muestra el usuario creado. Desde aquí ya se puede iniciar sesión y empezar a crear contenido.

![Figura 54. Instalacion completada de WordPress.](capturas/empezar%20wodpress%203.png)

## Creación del contenido del blog

Ya dentro del panel, se personalizó el sitio: un texto de presentación en el encabezado, la entrada "Blog de Monserrat!" y varias imágenes de portadas de libros que se subieron a la biblioteca de medios. Estas imágenes son el contenido que luego se usa para comprobar la persistencia.

**Figura 55. Página principal del blog antes de reiniciar.**

**Qué se observa:** el encabezado muestra el título del sitio y una presentación personal ("Hola! Soy Monse, estoy estudiando la carrera de ingeniería de sistemas, me gusta escribir y leer y este es mi blog!"). La entrada "Blog de Monserrat!" comienza con la portada de *Harry Potter y la piedra filosofal*.

![Figura 55. Pagina principal del blog antes de reiniciar.](capturas/practica%202.2.png)

**Figura 56. Entrada del blog con la portada de "Belleza Oscura".**

**Qué se observa:** al bajar en la página se ve la fotografía del libro *Belleza Oscura* de Jessica Rivas, otra de las imágenes subidas.

![Figura 56. Entrada del blog con la portada de Belleza Oscura.](capturas/practica%202.3.png)

**Figura 57. Entrada del blog con la portada de "El Principito".**

**Qué se observa:** más abajo aparece la portada de *El Principito*, de Antoine de Saint-Exupéry, con la ilustración del Principito sobre una roca. En total el blog muestra tres imágenes de libros.

![Figura 57. Entrada del blog con la portada de El Principito.](capturas/practica%202.4.png)

**Figura 58. Biblioteca de medios de WordPress con las tres imágenes subidas.**

**Qué se observa:** en `wp-admin/upload.php` aparecen las imágenes "imagen libro 1", "imagen libro 2" e "imagen libro 3". Cuando se sube una imagen, WordPress guarda el archivo dentro de `/var/www/html/wp-content/uploads`, carpeta que pertenece al volumen `wordpress_data`.

![Figura 58. Biblioteca de medios con las tres imagenes subidas.](capturas/practica%202.5.png)

## Prueba de persistencia: detener y volver a levantar

Antes de apagar el entorno, se quiso comprobar qué pasa al intentar entrar con el blog apagado.

**Figura 59. `localhost:8080/wp-admin/upload.php` con el entorno detenido.**

**Qué se observa:** el navegador muestra "No se puede acceder a este sitio web – La página localhost ha rechazado la conexión" (`ERR_CONNECTION_REFUSED`). Es lo esperado mientras los contenedores están eliminados: ya no hay ningún proceso escuchando en el puerto 8080.

![Figura 59. localhost wp-admin upload.php con el entorno detenido.](capturas/practica%202.6.png)

**Figura 60. `docker compose down` seguido de `docker compose up -d` en la práctica 2.**

**Qué se observa:** primero se eliminan `practica2-wordpress-1`, `practica2-db-1` y la red (`down 3/3`); luego se vuelven a crear la red y los dos contenedores (`up 3/3`). Observa que **esta vez los volúmenes no se vuelven a crear**: Docker los reutiliza. Eso es exactamente lo que demuestra la persistencia.

![Figura 60. docker compose down seguido de docker compose up -d en la practica 2.](capturas/practica%202.9.png)

**Figura 61. Biblioteca de medios después de reiniciar.**

**Qué se observa:** las tres imágenes ("imagen libro 1", "imagen libro 2" e "imagen libro 3") siguen en la biblioteca. Los archivos subidos sobrevivieron porque estaban en el volumen `wordpress_data`.

![Figura 61. Biblioteca de medios despues de reiniciar.](capturas/practica%202.7.png)

**Figura 62. Página del blog después de reiniciar.**

**Qué se observa:** el blog conserva el título del sitio, el texto de presentación, la entrada "Blog de Monserrat!" y la portada de *Harry Potter*. Las entradas y la configuración sobrevivieron porque estaban en la base de datos, guardada en el volumen `db_data`.

![Figura 62. Pagina del blog despues de reiniciar.](capturas/practica%202.8.png)

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