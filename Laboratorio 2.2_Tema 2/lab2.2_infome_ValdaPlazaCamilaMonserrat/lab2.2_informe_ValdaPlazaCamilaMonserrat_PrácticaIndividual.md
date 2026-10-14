# Informe Técnico: Laboratorio 2.2

## Gestión de Contenedores y Volúmenes Locales

## Portada

UNIVERSIDAD MAYOR, REAL Y PONTIFICIA DE SAN FRANCISCO XAVIER DE CHUQUISACA
FACULTAD DE CIENCIAS Y TECNOLOGÍA

![LOGO DE LA CARÁTULA](LOGOUSFX/ESCUDO.png)

**Nombre:** VALDA PLAZA CAMILA MONSERRAT

**Carrera:** INGENIERÍA DE SISTEMAS

**Asignatura:** Trabajando en la Nube (COM610)

**Docente:** Ing. Marcelo Quispe Ortega

**Semestre:** 2/2026

SUCRE-BOLIVIA

---

## 1. Introducción

Este informe documenta el desarrollo del Laboratorio 2.2, en el que se trabajan tres conceptos de Docker: los **volúmenes**, que permiten que los datos sobrevivan a la eliminación de contenedores; las **redes personalizadas**, que hacen que los contenedores se comuniquen entre sí usando solamente su nombre; y el **balanceo de carga con Nginx**, que reparte las visitas entre varios servidores.

El laboratorio cierra con una práctica individual: el despliegue del **"Blog Institucional USFX"**, una arquitectura multinivel con WordPress y MariaDB comunicados por una red privada, con dos volúmenes independientes y las credenciales gestionadas en un archivo de entorno.

Todo el trabajo se realizó en Windows con Docker Desktop, usando la terminal Warp con PowerShell. Por eso algunos comandos de la guía se adaptaron: se usó la variable ${PWD} en lugar de $(pwd), el punto y coma en lugar de &&, y Set-Content con la opción -Encoding utf8 para crear archivos de texto. Cada captura de pantalla está numerada como figura y va acompañada de la explicación de los comandos que aparecen en ella.

## 2. Objetivos

Al finalizar el laboratorio se aprendió:

1. Aplicar volúmenes de Docker para la persistencia de datos y el desarrollo con hot reload.
2. Crear y gestionar redes personalizadas de Docker para la comunicación entre servicios.
3. Desplegar una arquitectura de balanceo de carga con Nginx.
4. Demostrar un flujo de trabajo de desarrollo eficiente utilizando volúmenes.

## 3. Preparación del entorno de trabajo

Antes de empezar se creó la carpeta de trabajo donde se guardaron todos los archivos del laboratorio.

- **pwd**: muestra en qué carpeta está parada la terminal en ese momento.
- **cd "ruta"**: cambia de carpeta. Se usan comillas porque el nombre de la ruta tiene espacios.
- **mkdir Laboratorio_2.2**: crea la carpeta del laboratorio.

![Figura 1](<CAPTURAS/paso 1.png>)

*Figura 1. Ubicación inicial y cambio a la carpeta de la materia.*

![Figura 2](<CAPTURAS/paso 2.png>)

*Figura 2. Creación de la carpeta Laboratorio_2.2 y verificación con pwd.*

## 5. Práctica Individual: "Blog Institucional USFX"

### 5.1 Objetivo y arquitectura

La práctica consiste en desplegar una arquitectura multinivel en la que la lógica de cómputo, el almacenamiento de datos estructurados y la persistencia de los archivos multimedia están separados, comunicados por una red virtual aislada. La solución elegida tiene tres componentes:

- **Nodo de datos**: contenedor mariadb-blog, imagen mariadb:latest, con el volumen vol-db-datos montado en /var/lib/mysql y el puerto interno 3306.
- **Nodo de aplicación**: contenedor wordpress-blog, imagen wordpress:latest, con el volumen vol-wp-contenido montado en /var/www/html/wp-content y publicado en el puerto 8081.
- **Configuración**: el archivo blog.env, que contiene todas las variables necesarias.

Los dos contenedores comparten la red red-nube-usfx y se localizan por nombre, de modo que WordPress encuentra a MariaDB sin necesidad de conocer su dirección IP. El trabajo se realizó en la carpeta Lab_2.2_ValdaPlazaCamilaMonserrat, creada dentro de Laboratorio_2.2.

### 5.2 Infraestructura de red y almacenamiento

- **New-Item -ItemType Directory -Path "Lab_2.2_..."**: crea la carpeta de la práctica.
- **docker network create red-nube-usfx**: crea la red bridge que usarán los dos contenedores.
- **docker volume create vol-db-datos**: crea el volumen donde MariaDB guardará los datos de la base.
- **docker volume create vol-wp-contenido**: crea el volumen donde WordPress guardará la carpeta wp-content, es decir temas, plugins y fotos subidas.

![Figura 3](<CAPTURAS/paso 23.png>)

*Figura 3. Creación de la carpeta de la práctica y de la red red-nube-usfx.*

![Figura 4](<CAPTURAS/paso 24.png>)

*Figura 4. Red red-nube-usfx en la lista de redes y creación del archivo blog.env.*

![Figura 5](<CAPTURAS/paso 26.png>)

*Figura 5. Creación de los volúmenes vol-db-datos y vol-wp-contenido.*

![Figura 6](<CAPTURAS/verificar volumenes.png>)

*Figura 6. Verificación conjunta con docker volume ls y docker network ls: aparecen los dos volúmenes de la práctica y la red red-nube-usfx, junto con los recursos de los ejercicios anteriores.*

### 5.3 Seguridad y variables de entorno (blog.env)

La práctica prohíbe escribir contraseñas en la línea de comandos con el parámetro -e. Por eso todas las variables se definieron en un archivo llamado blog.env, que los contenedores leen con la opción --env-file.

- **MYSQL_ROOT_PASSWORD**: contraseña del administrador root. La usa MariaDB.
- **MYSQL_DATABASE**: nombre de la base de datos que MariaDB crea automáticamente al arrancar por primera vez. La usa MariaDB.
- **MYSQL_USER** y **MYSQL_PASSWORD**: usuario y contraseña que MariaDB crea para que WordPress pueda conectarse. Las usa MariaDB.
- **WORDPRESS_DB_HOST**: dirección de la base de datos a la que debe conectarse WordPress, que es mariadb-blog:3306, es decir el nombre del contenedor y el puerto. La usa WordPress.
- **WORDPRESS_DB_NAME**: nombre de la base de datos. La usa WordPress y debe ser igual a MYSQL_DATABASE.
- **WORDPRESS_DB_USER** y **WORDPRESS_DB_PASSWORD**: credenciales con las que WordPress entra a la base. Las usa WordPress y deben coincidir con MYSQL_USER y MYSQL_PASSWORD.

![Figura 34](<CAPTURAS/paso 25.png>)

*Figura 7. Contenido de blog.env mostrado con Get-Content y creación del archivo uploads.ini.*

![Figura 35](<CAPTURAS/blog.env.png>)

*Figura 8. Archivo blog.env abierto en Visual Studio Code.*

### 5.4 Nodo de datos: MariaDB

El comando de despliegue fue:

docker run -d --network red-nube-usfx --name mariadb-blog -v vol-db-datos:/var/lib/mysql --env-file blog.env mariadb:latest --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

- **--network red-nube-usfx**: conecta el contenedor a la red de la práctica.
- **--name mariadb-blog**: asigna el nombre que WordPress usará después en WORDPRESS_DB_HOST.
- **-v vol-db-datos:/var/lib/mysql**: monta el volumen en la carpeta donde MariaDB guarda los datos, lo que permite la persistencia.
- **--env-file blog.env**: carga toda la configuración sin exponer contraseñas en el comando.
- **--character-set-server=utf8mb4**: punto extra de la práctica. Establece una codificación de 4 bytes por carácter.
- **--collation-server=utf8mb4_unicode_ci**: define las reglas de comparación y ordenación de los textos, sin diferenciar mayúsculas de minúsculas.

**Sobre las dos últimas opciones.** Escritas después del nombre de la imagen mariadb:latest, no son opciones del comando docker run, sino argumentos que se le pasan al proceso del contenedor, que en la imagen oficial de MariaDB es el servidor mariadbd. Como el servidor acepta --character-set-server y --collation-server como opciones propias, la configuración se aplica correctamente. No pueden escribirse antes del nombre de la imagen porque entonces Docker las rechazaría como opciones desconocidas.

![Figura 36](<CAPTURAS/paso 28.png>)

*Figura 9. Ejecución del contenedor mariadb-blog con su volumen, su archivo blog.env y la codificación utf8mb4.*

### 5.5 Punto extra: verificación del character set utf8mb4

Para comprobar que esta configuración no solo se aplicó sino que surte efecto, se encendió el contenedor ya existente y se consultó el estado real del servidor. Al momento de la verificación los contenedores estaban detenidos pero no eliminados, por lo que bastó encender MariaDB con el comando docker start; la red y los volúmenes nunca se perdieron. Para comprobarlo primero se verificó el estado de los contenedores con docker ps -a, y en la columna STATUS aparecieron como Exited, que significa detenidos pero conservados.

docker start mariadb-blog
    docker exec -it mariadb-blog bash
    mariadb -u root -p

A continuación se explica cada uno de estos comandos:

- **docker start mariadb-blog**: vuelve a poner en marcha un contenedor que ya existía pero estaba detenido. Es importante distinguirlo de los otros dos comandos similares. El **docker run** crea un contenedor nuevo a partir de una imagen y lo arranca; el **docker start** solo enciende uno que ya existe, sin volver a crearlo ni tocar su configuración ni sus volúmenes; y el **docker restart** primero detiene el contenedor y luego lo arranca de nuevo. Se usó start y no run porque el contenedor ya estaba creado: al haberlo eliminado con docker rm -f en la prueba de resiliencia y haberlo vuelto a desplegar, conservaba su nombre, su red y, sobre todo, el volumen vol-db-datos montado, que es justamente lo que se quería verificar. La respuesta que imprime el comando es el nombre del contenedor, mariadb-blog, que confirma que arrancó correctamente.

- **docker exec -it mariadb-blog bash**: ejecuta un comando dentro de un contenedor que ya está corriendo, sin necesidad de crear otro. La palabra exec significa ejecutar. Se descompone en cuatro partes: **docker** es el programa principal; **exec** indica la acción; **-i** mantiene abierta la entrada estándar, es decir permite escribir; y **-t** asigna una terminal de pseudoconsola, que es lo que hace posible ver los resultados y usar las teclas de control como Ctrl+C para salir. La parte final, **mariadb-blog**, es el nombre del contenedor y **bash** es el intérprete de comandos que se abre dentro de él. En resumen, esta parte del comando obtiene una terminal de Linux dentro del contenedor, lo que permite trabajar con el sistema de archivos y los procesos que están corriéndolo, entre ellos el servidor MariaDB. Con esta terminal no se ve el de la computadora, sino el del contenedor.

- **mariadb -u root -p**: ya dentro del contenedor, se ejecuta el cliente de línea de comandos de MariaDB para conectarse al servidor de bases de datos. Las opciones son: **-u root** indica el usuario con el que se conecta, en este caso el administrador root, que es el mismo que se definió en la variable MYSQL_ROOT_PASSWORD del archivo blog.env; y **-p** indica que el programa solicitará la contraseña de forma interactiva, en lugar de escribirla directamente en el comando. La opción -p es una medida de seguridad, porque escribir la contraseña en la línea de comandos la dejaría visible en el historial de la terminal y en cualquier captura de pantalla. Al ejecutarlo aparece el mensaje Enter password, se escribe la contraseña sin que se muestre ningún carácter, y si es correcta aparece el indicador MariaDB [(none)]>, que indica que la sesión está abierta. En ese momento ya se está trabajando dentro de la base de datos, como lo demuestra el hecho de que en esa misma línea se puedan escribir las sentencias SHOW VARIABLES, SELECT, CREATE e INSERT.

Dentro de MariaDB se ejecutó la consulta SHOW VARIABLES LIKE 'character_set_server', que muestra el valor configurado para el juego de caracteres del servidor, y el resultado fue utf8mb4.

![Figura 10](<CAPTURAS/terminal de emojis prueba.png>)

*Figura 10. Encendido del contenedor, ingreso a su terminal y consulta de character_set_server, que devuelve utf8mb4. Esta es la comprobación directa de que el punto extra se aplicó.*

Con el servidor ya confirmado en utf8mb4, se verificó también que la base de datos del blog hereda esa codificación. Para ello se consulted information_schema.SCHEMATA buscando el nombre wordpress_db, y el resultado mostró esa base de datos con DEFAULT_CHARACTER_SET_NAME igual a utf8mb4.

![Figura 11](<CAPTURAS/terminal de emojis prueba 1.png>)

*Figura 11. La base wordpress_db en utf8mb4, y creación de una tabla de prueba con tres textos que contienen emojis y caracteres especiales.*

#### 5.5.1 Prueba funcional con emojis

Se insertaron tres filas en la tabla de prueba con textos que incluyen un emoji de fiesta, la letra ñ con tilde y un corazón, y otro emoji de cohete. Luego se leyó la tabla completa.

Las tres filas se guardaron y se recuperaron correctamente, con todos los emojis intactos y sin sustituciones. La base de pruebas se eliminó al terminar con DROP DATABASE.

#### 5.5.2 Comparación con utf8mb3: demostración de la necesidad de utf8mb4

Para demostrar por qué utf8mb4 era necesario, se creó una tabla con la codificación antigua y se intentó guardar el mismo emoji:

CREATE TABLE texto_viejo (contenido VARCHAR(20)) CHARACTER SET utf8mb3;
INSERT INTO texto_viejo (contenido) VALUES ('Bienvenidos 🎉');

MariaDB rechazó la inserción con el error 1366, indicando que el valor de cadena es incorrecto para esa columna. La causa es el tamaño en memoria: un emoji necesita 4 bytes en UTF-8, mientras que utf8mb3 solo admite 3 bytes por carácter. Por eso utf8mb4, que significa el máximo de 4 bytes, es el único que admite emojis; los acentos, la letra ñ y el corazón sí caben en utf8mb3, porque ocupan menos bytes.

![Figura 39](<CAPTURAS/terminal de emojis prueba 2.png>)

*Figura 12. Arriba, los emojis y caracteres especiales guardados y leídos correctamente en la tabla con utf8mb4. Abajo, el error 1366 al intentar guardar el mismo emoji en una tabla con utf8mb3, que es la demostración de por qué se requería utf8mb4.*

#### 5.5.3 Prueba funcional desde el blog

La verificación en la terminal demuestra que la base de datos acepta emojis, pero la mejor prueba del punto extra es que el propio blog los muestre correctamente. Para comprobarlo se publicaron dos textos con emojis desde la interfaz de WordPress: un elemento de menú titulado Saludo de la Facultad con un emoji de cohete, y un texto de bienvenida que termina con un emoji de fiesta. Ambos se veröffentlicht correctamente en el navegador, sin errores ni caracteres reemplazados.

![Figura 40](<CAPTURAS/emojis prueba.png>)

*Figura 13. Blog con los emojis funcionando de extremo a extremo: el título Saludo de la Facultad 🚀 en el menú de navegación y el texto La materia de TRABAJANDO EN LA NUBE ES INTERESANTE 🎉 en la página de inicio. Este recorrido WordPress a MariaDB con utf8mb4 demuestra que la configuración funciona en la aplicación real y no solo en la consola.*

### 5.6 Nodo de aplicación: WordPress

Para aumentar el límite de subida de archivos de PHP a 64 MB se creó el archivo uploads.ini, que el intérprete PHP carga al arrancar. La ruta de configuración de PHP dentro de la imagen oficial de WordPress es /usr/local/etc/php/conf.d/, que es donde se montó el archivo.

- **file_uploads = On**: permite la subida de archivos.
- **memory_limit = 256M**: memoria máxima que puede usar cada script de PHP.
- **upload_max_filesize = 64M**: tamaño máximo de cada archivo subido.
- **post_max_size = 64M**: tamaño máximo del envío completo. Debe ser igual o mayor que el anterior, porque si fuera menor el límite real seguiría siendo bajo aunque upload_max_filesize fuera de 64M.
- **max_execution_time = 600**: segundos máximos que puede tardar un script antes de ser cortado.

![Figura 41](<CAPTURAS/uploads.ini.png>)

*Figura 14. Archivo uploads.ini abierto en Visual Studio Code.*

![Figura 42](<CAPTURAS/paso 29.png>)

*Figura 15. Ejecución del contenedor wordpress-blog y descarga de la imagen wordpress:latest.*

El comando de despliegue fue:
docker run -d --network red-nube-usfx --name wordpress-blog -p 8081:80 -v vol-wp-contenido:/var/www/html/wp-content -v "${PWD}/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini" --env-file blog.env wordpress:latest

- **-p 8081:80**: publica el blog en el navegador en http://localhost:8081.
- **-v vol-wp-contenido:/var/www/html/wp-content**: monta el volumen en la carpeta donde WordPress guarda temas, plugins e imágenes subidas.
- **-v "${PWD}/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini"**: bind mount de un archivo local, que coloca el uploads.ini de la computadora dentro de la carpeta donde PHP lee su configuración adicional.
- **--env-file blog.env**: carga las variables que conectan WordPress con la base de datos.

### 5.7 Instalación del blog

Con los dos contenedores en marcha se abrió http://localhost:8081 y se completó el instalador de WordPress: primero se eligió el idioma, luego se escribieron el título del sitio, el nombre de usuario, la contraseña y el correo electrónico. El primer intento falló porque el correo no tenía un formato válido; se corrigió y la instalación terminó. Finalmente se inició sesión con el usuario administrador.

![Figura 43](<CAPTURAS/WODPRESS INCIO.png>)

*Figura 16. Pantalla inicial de instalación de WordPress y selección de idioma.*

![Figura 44](<CAPTURAS/intsalcion wodpress.png>)

*Figura 17. Formulario de instalación con el título del sitio, el nombre de usuario, la contraseña y el correo electrónico.*

![Figura 45](<CAPTURAS/instalcion con correcion de correo.png>)

*Figura 18. Error indicando que la dirección de correo electrónico no es válida, junto con el dato corregido en el campo.*

![Figura 46](<CAPTURAS/iniciar sesion root.png>)

*Figura 19. Inicio de sesión del administrador en wp-login.php.*

### 5.8 Contenido creado antes de la prueba de resiliencia

Con el blog funcionando se creó contenido propio que serviría como prueba de que la persistencia está bien hecha: un texto personalizado en la página de inicio, una imagen subida a la biblioteca de medios y un tema nuevo.

![Figura 47](<CAPTURAS/persistencia 1.png>)

*Figura 20. Blog con la página de inicio ya personalizada con el texto de prueba, antes de eliminar los contenedores.*

Para el tema se siguió el flujo de WordPress: ver los temas que venían instalados, entrar al instalador, localizar Astra, instalarlo, activarlo y usarlo como tema del sitio.

![Figura 48](<CAPTURAS/TEMAS.png>)

*Figura 21. Temas incluidos con WordPress al inicio, antes de agregar Astra.*

![Figura 49](<CAPTURAS/otra prueba instlar astra.png>)

*Figura 22. Instalador de temas de WordPress, con Twenty Twenty-Four instalado y activado, y Astra disponible en la galería.*

![Figura 50](<CAPTURAS/para activar.png>)

*Figura 23. Tema Astra ya instalado, con el botón Activar disponible.*

![Figura 51](<CAPTURAS/segunda prubea.png>)

*Figura 24. Personalizador de WordPress con el tema Astra activo y la imagen subida configurada como logo del sitio.*

![Figura 52](<CAPTURAS/verificacion astra.png>)

*Figura 25. Página de ejemplo con el tema Astra aplicado, antes de eliminar los contenedores. En el pie de página se indica que funciona gracias al tema Astra.*

La imagen de portada del libro Rivales Divinos se subió desde la pantalla Subir medios. En esa pantalla aparece el texto **Tamaño máximo de archivo: 64 MB**, lo que confirma que el archivo uploads.ini fue leído correctamente por PHP.

![Figura 53](<CAPTURAS/RIVALES DIVINOS CAP.png>)

*Figura 26. Pantalla Subir medios de WordPress, donde se lee Tamaño máximo de archivo: 64 MB, con la imagen Rivales Divinos Portada ya subida. Este es el comprobante de que el límite de 64 MB se aplicó.*

![Figura 54](<CAPTURAS/vista page 2.png>)

*Figura 27. Página de ejemplo antes de eliminar los contenedores, con el título modificado y la imagen usada como logo del sitio.*

### 5.9 Prueba de resiliencia y auditoría

Esta prueba es el punto central de la práctica: eliminar los contenedores por completo y comprobar que ni la base de datos ni los archivos del blog se pierden.

#### 5.9.1 Eliminación de los contenedores

- **docker rm -f mariadb-blog wordpress-blog**: elimina ambos contenedores. La opción -f obliga a borrarlos aunque estuvieran funcionando. **Los volúmenes no se tocan.**
- **docker volume inspect vol-db-datos**: muestra los detalles del volumen de la base de datos. Si aparece, el volumen sigue existiendo.
- **docker volume inspect vol-wp-contenido**: lo mismo para el volumen del contenido de WordPress.

![Figura 55](<CAPTURAS/paso 30.png>)

*Figura 28. Fin de la descarga de la imagen de WordPress y primera eliminación de los dos contenedores con docker rm -f.*

Como consecuencia de la eliminación, el blog dejó de responder en el navegador.

![Figura 56](<CAPTURAS/al caer la pagina con la eliminacion de contendores.png>)

*Figura 29. Panel de WordPress sin respuesta tras eliminar los contenedores. El mensaje ERR_CONNECTION_REFUSED confirma que ya no hay ningún servicio escuchando en el puerto 8081.*

![Figura 57](<CAPTURAS/page 2 borrado.png>)

*Figura 30. La página de ejemplo también deja de responder, lo que confirma que la pérdida de acceso se debe a los contenedores y no a un problema del contenido.*

![Figura 58](<CAPTURAS/paso 31.png>)

*Figura 30. Los dos volúmenes siguen existiendo después de eliminar los contenedores, con su Mountpoint intacto.*

#### 5.9.2 Nuevo despliegue sobre los mismos volúmenes

Se volvieron a ejecutar exactamente los mismos comandos de los apartados 5.4 y 5.6, apuntando a los mismos volúmenes, y el blog volvió a funcionar con todo su contenido. Este ciclo de eliminar, verificar los volúmenes con docker volume inspect y volver a desplegar **se repitió tres veces** durante las pruebas.

![Figura 59](<CAPTURAS/paso 32.png>)

*Figura 31. Se recrean los contenedores mariadb-blog y wordpress-blog sobre los mismos volúmenes y se repite la eliminación.*

![Figura 60](<CAPTURAS/paso 33.png>)

*Figura 32. Segunda verificación de los volúmenes con docker volume inspect tras la eliminación de los contenedores.*

![Figura 61](<CAPTURAS/paso 34.png>)

*Figura 33. Nuevo despliegue y nueva eliminación de los contenedores por tercera vez.*

![Figura 62](<CAPTURAS/paso 35.png>)

*Figura 34. Tercera verificación de los volúmenes, que siguen existiendo y conservando sus datos.*

![Figura 63](<CAPTURAS/paso 36.png>)

*Figura 35. Despliegue final de mariadb-blog y wordpress-blog apuntando a los mismos volúmenes.*

#### 5.9.3 Verificación final

Después del último redespliegue el blog respondió en http://localhost:8081 con todo su contenido restaurado: la página de inicio con el texto personalizado, la página de ejemplo con su título y su logo, el tema Astra activo y la biblioteca de medios con las imágenes subidas. Además, la imagen pudo abrirse directamente desde la carpeta wp-content/uploads, lo que confirma que el archivo reside en el volumen vol-wp-contenido.

![Figura 64](<CAPTURAS/volvio todo tal cual.png>)

*Figura 36. Página de inicio personalizada restaurada tras recrear los contenedores. La sesión del administrador también se conservó.*

![Figura 65](<CAPTURAS/volvio pgae 2.png>)

*Figura 37. Página de ejemplo después de recrear los contenedores: conserva el título modificado y el logo, y en el pie de página se confirma que el tema Astra sigue activo.*

![Figura 66](<CAPTURAS/pagian volvio.png>)

*Figura 38. Biblioteca de medios con las imágenes subidas, todavía disponibles tras el redespliegue.*

![Figura 67](<CAPTURAS/MEDIO WODPRESS.png>)

*Figura 39. Imagen subida abierta directamente desde la ruta wp-content/uploads/2026/10, servida desde el volumen vol-wp-contenido.*
