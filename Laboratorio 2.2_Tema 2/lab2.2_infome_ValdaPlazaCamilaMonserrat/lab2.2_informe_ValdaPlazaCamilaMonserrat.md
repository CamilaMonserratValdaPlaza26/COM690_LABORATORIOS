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

Al finalizar el laboratorio el estudiante es capaz de:

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

## 4. Ejercicios

Los siguientes ejercicios recorren los conceptos de volúmenes y redes en el mismo orden de la guía.

### 4.1 Ejercicio 3.1: Volúmenes para la Persistencia de Datos

#### 4.1.1 Creación y verificación de un volumen

Un volumen es un espacio de almacenamiento gestionado por Docker que vive fuera del contenedor. El contenedor puede eliminarse por completo y el volumen permanece.

- **docker volume create datos-mysql**: crea el volumen llamado datos-mysql.
- **docker volume ls**: muestra la lista de todos los volúmenes existentes.

En el listado aparece datos-mysql junto con volúmenes de otros proyectos que ya estaban en la computadora. Esto demuestra que los volúmenes sobreviven a la eliminación de los contenedores que los usaron.

![Figura 3](<CAPTURAS/paso 3.png>)

*Figura 3. Creación del volumen datos-mysql, listado de volúmenes y descarga automática de la imagen de MariaDB.*

#### 4.1.2 Uso de un volumen en un contenedor

El contenedor se creó con la opción **-d** para que quedara trabajando en segundo plano, la opción **-v datos-mysql:/var/lib/mysql** para montar el volumen en la carpeta donde MariaDB guarda sus bases de datos, la opción **--name mi-db** para asignarle un nombre fácil de recordar, y la variable de entorno **MARIADB_ROOT_PASSWORD=1234abcd** para definir la contraseña del administrador root.

La imagen no estaba en la computadora, por lo que Docker la descargó automáticamente; la descarga tardó 2 minutos y 26 segundos.

#### 4.1.3 Verificación de la persistencia

El procedimiento es el siguiente: entrar al contenedor, crear una base de datos con una tabla, eliminar el contenedor, crear otro nuevo con el mismo volumen y comprobar que los datos siguen ahí.

- **docker exec -it mi-db bash**: abre una terminal dentro del contenedor que ya está corriendo.
- **mariadb -u root -p**: abre el cliente de MariaDB como root; el parámetro -p hace que pida la contraseña.
- **CREATE DATABASE test;**: crea la base de datos llamada test.
- **USE test;** indica que a partir de ese momento se trabaja dentro de esa base.
- **CREATE TABLE usuarios (...)**: crea la tabla usuarios con tres columnas: id, que es un número que se incrementa solo y actúa como llave principal; nombre, un texto de hasta 100 caracteres; y email, un texto de hasta 255 caracteres que no se puede repetir.

![Figura 4](<CAPTURAS/paso 4.png>)

*Figura 4. Ingreso al contenedor mi-db y creación de la base de datos test y de la tabla usuarios.*

Después de salir de MariaDB con quit y del contenedor con exit, se eliminó el contenedor y se creó uno nuevo llamado nueva-db usando el mismo volumen. En PowerShell los dos comandos se unieron con punto y coma en lugar de &&:
docker stop mi-db; docker rm mi-db
    docker run -d -v datos-mysql:/var/lib/mysql --name nueva-db --env MARIADB_ROOT_PASSWORD=1234abcd mariadb

Dentro del contenedor nueva-db se ejecutaron SHOW DATABASES y SHOW TABLES, y la base test con su tabla usuarios aparecieron intactas. **Esto demuestra la persistencia**: aunque el contenedor original fue eliminado, los datos siguen en el volumen.

![Figura 5](<CAPTURAS/paso 6.png>)

*Figura 5. Eliminación de mi-db y creación del contenedor nueva-db con el mismo volumen.*

![Figura 6](<CAPTURAS/paso 7.png>)

*Figura 6. Verificación de la persistencia: la base test y la tabla usuarios existen en el contenedor nueva-db.*

#### 4.1.4 Inspección del contenido del volumen

- **docker volume inspect datos-mysql**: muestra los datos del volumen, como su tipo, su fecha de creación y su Mountpoint, que es la ruta del sistema de archivos del host donde Docker guarda la información.
- **docker run -it --rm -v datos-mysql:/data alpine sh**: crea un contenedor temporal con Alpine, un Linux muy pequeño, y le monta el volumen en la carpeta /data. El parámetro --rm hace que el contenedor se borre solo al salir, y -it permite escribir comandos dentro.
- **cd /data** seguido de **ls -la**: entra a la carpeta y lista todos los archivos con sus detalles.

![Figura 7](<CAPTURAS/paso 8.png>)

*Figura 7. Inspección del volumen datos-mysql y acceso a su contenido desde un contenedor Alpine.*

![Figura 8](<CAPTURAS/paso 9.png>)

*Figura 8. Listado de los archivos del volumen, donde se observa la carpeta test, y salida del contenedor.*

### 4.2 Ejercicio 3.2: Volúmenes para Persistencia y Hot Reload

#### 4.2.1 Montaje de volúmenes para hot reload

El hot reload permite editar el código en la computadora y ver el resultado en el navegador sin reconstruir la imagen del contenedor. Para ello se creó un proyecto Node.js con Express y nodemon.

- **npm init -y**: crea el archivo package.json; la opción -y acepta todos los valores por defecto sin hacer preguntas.
- **npm install express**: instala Express, el framework utilizado para crear el servidor web.
- **npm install nodemon --save-dev**: instala nodemon como dependencia solo de desarrollo.
- **index.js**: servidor Express que responde Hello World! en el puerto 3000.
- **package.json**, en el apartado scripts: start ejecuta node index.js y dev ejecuta nodemon index.js.

El Dockerfile es la receta con la que se construye la imagen. Sus cuatro líneas hacen lo siguiente:

FROM node:20-alpine      -> imagen base con Node.js 20 sobre Alpine Linux, que es liviano
    WORKDIR /app             -> define /app como carpeta de trabajo dentro del contenedor
    COPY . .                 -> copia los archivos del proyecto a la carpeta /app
    CMD ["npm", "run", "dev"] -> es lo que se ejecuta al arrancar: inicia nodemon

![Figura 9](<CAPTURAS/paso 10.png>)

*Figura 9. Inicio del proyecto con npm init e instalación de Express y nodemon.*

La imagen y el contenedor se construyeron y ejecutaron con:

docker build -t mi-app-web:2.0 .
docker run -d -p 3000:3000 -v "$(pwd):/app" --name mi-app-web-dev mi-app-web:2.0

- **-t mi-app-web:2.0**: asigna nombre y versión a la imagen; el punto final indica que el Dockerfile está en la carpeta actual.
- **-p 3000:3000**: publica el puerto 3000 del contenedor en el puerto 3000 de la computadora, para poder entrar desde el navegador.
- **-v "$(pwd):/app"**: es un montaje de enlace o bind mount, que enlaza la carpeta de trabajo de la computadora con la carpeta /app del contenedor, de modo que los cambios en los archivos se ven al instante.
- **docker logs mi-app-web-dev** muestra lo que el contenedor escribió en pantalla, y con el flag **-f** se queda siguiendo los mensajes nuevos en tiempo real.

![Figura 10](<CAPTURAS/paso 11.png>)

*Figura 10. Creación de index.js y del Dockerfile, y primera construcción de la imagen mi-app-web:2.0.*

Después se eliminó el contenedor y se volvió a construir la imagen. En la Figura 10 el contexto de construcción fue de 3.76 MB y en la Figura 11 bajó a 63.21 kB, porque la imagen base ya estaba en la computadora y solo se enviaron los archivos del proyecto.

![Figura 11](<CAPTURAS/paso 12.png>)

*Figura 11. Eliminación del contenedor y nueva construcción de la imagen.*

![Figura 12](<CAPTURAS/paso 13.png>)

*Figura 12. Nueva ejecución del contenedor y logs donde nodemon inicia node index.js.*

![Figura 13](<CAPTURAS/paso 14.png>)

*Figura 13. Logs en tiempo real con la aplicación escuchando en el puerto 3000, y docker restart del contenedor.*

#### 4.2.2 Pruebas de hot reload

Primero se abrió http://localhost:3000 y apareció el mensaje inicial de la aplicación. Después se cambió el mensaje en index.js desde el editor, **sin reconstruir la imagen**, y al recargar la página apareció el mensaje nuevo. En los logs se observa que nodemon detecta el cambio, lo indica con el mensaje restarting due to changes y vuelve a iniciar la aplicación.

![Figura 14](<CAPTURAS/HELLO WORD.png>)

*Figura 14. Respuesta inicial de la aplicación en localhost:3000.*

![Figura 15](<CAPTURAS/hot reload.png>)

*Figura 15. Resultado en el navegador después del cambio: la aplicación responde con el nuevo mensaje, sin que se haya detenido ni reconstruido el contenedor.*

La captura siguiente es la evidencia completa de la prueba: se ve al mismo tiempo el archivo index.js abierto en el editor con el mensaje ya modificado, la terminal con los logs del contenedor y el navegador con el resultado.

![Figura 16](<CAPTURAS/NODEMOON LOCALHOST.png>)

*Figura 16. Evidencia completa del hot reload. A la izquierda, el navegador con el mensaje nuevo. En el editor, la línea modificada de index.js. En la terminal, los logs de docker logs -f mi-app-web-dev, donde nodemon muestra restarting due to changes y vuelve a iniciar node index.js, con la aplicación escuchando de nuevo en el puerto 3000. Ninguna de las tres cosas Hubo que hacerlas manualmente: el cambio en el editor bastó para que la aplicación se actualizara en el navegador.*

**Nota sobre la guía:** el enunciado del ejercicio 3.2 pide modificar el archivo app.js, pero el proyecto creado en los pasos anteriores se llama index.js y es el que el Dockerfile y el script dev usan para iniciar la aplicación. Por eso la modificación se hizo en index.js, que es el archivo real del proyecto.

**Nota:** el contenedor se volvió a crear usando ${PWD} en lugar de $(pwd), que es la forma de PowerShell de indicar la carpeta actual. También se ejecutó docker restart durante el proceso.

### 4.3 Ejercicio 3.3: Redes para la Comunicación entre Contenedores

#### 4.3.1 Creación de la red personalizada

Una red personalizada es una red bridge aislada en la que los contenedores se encuentran entre sí por su nombre, sin necesidad de conocer direcciones IP.

docker network create red-laboratorio
    docker network ls

En el laboratorio la red se llamó red-laboratorio en lugar de mi-red-app, como aparece en la guía. El nombre es libre y no afecta el funcionamiento.

![Figura 17](<CAPTURAS/paso 16.png>)

*Figura 17. Creación de la red red-laboratorio y de los contenedores db-con-red y app-con-red, e inicio de la instalación de ping.*

#### 4.3.2 Conexión de contenedores a la red

El contenedor **db-con-red** se creó con la opción --network red-laboratorio y es el de la base de datos MariaDB. El contenedor **app-con-red** es un Ubuntu 22.04 en la misma red, ejecutado con -it para dejar abierta una terminal bash.

#### 4.3.3 Verificación de la comunicación

Dentro del contenedor de Ubuntu se actualizó la lista de paquetes y se instaló la herramienta de red con **apt-get update && apt-get install -y iputils-ping**. Luego se ejecutó **ping -c 3 db-con-red**, que envía tres paquetes de prueba a la base de datos usando solamente su nombre.

![Figura 18](<CAPTURAS/paso 17.png>)

*Figura 18. Resultado del ping a db-con-red: 3 paquetes enviados, 3 recibidos y 0 % de pérdida.*

El nombre db-con-red se resolvió automáticamente a la dirección 172.20.0.2 y los tres paquetes llegaron sin pérdida, lo que confirma que los contenedores se comunican por su nombre dentro de la red personalizada.

### 4.4 Ejercicio 3.4: Redes y Balanceo de Carga con Nginx

#### 4.4.1 Creación de la red

docker network create web-red

![Figura 19](<CAPTURAS/paso 19.png>)

*Figura 19. Creación de la red web-red.*

#### 4.4.2 Preparación de los servidores de aplicación

Se crearon las carpetas servidor1 y servidor2, cada una con su propio archivo index.html que indica desde qué servidor se está respondiendo.

- **if (!(Test-Path -Path servidor1)) { New-Item -ItemType Directory -Path servidor1 }**: pregunta si la carpeta existe y, si no existe, la crea.
- **Set-Content -Path "servidor1/index.html" -Value ...**: escribe el código HTML de la página.
- **docker run -d --network web-red --name servidor1 -v "${PWD}/servidor1:/usr/share/nginx/html" nginx**: crea un contenedor de Nginx que muestra esa carpeta, ya que /usr/share/nginx/html es la ruta donde Nginx busca las páginas que va a servir. No se publica ningún puerto porque solo el balanceador debe ser visible desde fuera.

![Figura 20](<CAPTURAS/paso 18.png>)

*Figura 20. Creación de las carpetas servidor1 y servidor2 y del index.html del servidor 1.*

![Figura 21](<CAPTURAS/paso 20.png>)

*Figura 21. Creación del index.html del servidor 2 y ejecución de los contenedores servidor1 y servidor2.*

![Figura 22](<CAPTURAS/servidor 1 index.png>)

*Figura 22. Archivo servidor1/index.html abierto en Visual Studio Code junto con la estructura de archivos del laboratorio.*

#### 4.4.3 Configuración del balanceador de carga

El balanceador es un tercer contenedor de Nginx que recibe las visitas y las reparte entre los dos servidores. Su archivo de configuración, tomado de la guía, es:
events { }
    http {
        upstream balanceador {
            server servidor1;
            server servidor2;
        }
        server {
            listen 80;
            location / {
                proxy_pass http://balanceador;
            }
        }
    }

- **events { }**: bloque obligatorio de Nginx. Se deja vacío porque se usan los valores por defecto.
- **upstream balanceador { ... }**: define el grupo de servidores entre los que se reparte el trabajo. Se usan sus nombres porque están en la misma red.
- **listen 80;**: el balanceador escucha en el puerto 80.
- **proxy_pass http://balanceador;**: cada visita que llega se reenvía a uno de los servidores del grupo; por defecto se van alternando uno y uno.

El balanceador se creó con:

docker run -d --network web-red -p 8080:80 --name balanceador -v "${PWD}/nginx.conf:/etc/nginx/nginx.conf" nginx

Con **-p 8080:80** se accede desde el navegador por el puerto 8080 de la computadora, y el bind mount de nginx.conf reemplaza el archivo de configuración original del contenedor. Con **docker ps -a** se listaron todos los contenedores, tanto los que estaban corriendo como los detenidos, y con **docker stop** y **docker rm** se eliminó el balanceador para poder crearlo de nuevo con el mismo nombre.

![Figura 23](<CAPTURAS/paso 21.png>)

*Figura 23. Ejecución del contenedor balanceador en el puerto 8080 y listado con docker ps -a.*

![Figura 24](<CAPTURAS/paso 22.png>)

*Figura 24. Eliminación y nueva creación del contenedor balanceador con el mismo nombre.*

#### 4.4.4 Corrección de la codificación (UTF-8)

En la primera prueba del balanceador, el signo de apertura de exclamación aparecía como un símbolo extraño delante de la palabra Hola. La causa fue que Set-Content, sin indicar la codificación, guardó los archivos index.html en un formato distinto a UTF-8 y el navegador no pudo interpretarlos.

![Figura 25](<CAPTURAS/servidor 1.png>)

*Figura 25. Error de codificación: el signo de apertura de exclamación aparece como un símbolo ilegible delante de la palabra Hola.*

La corrección fue volver a escribir los dos archivos con la opción **-Encoding utf8** y comprobar su contenido con **Get-Content**. El bloque de texto delimitado por @' y '@ permite escribir varias líneas de HTML dentro del comando.

![Figura 26](<CAPTURAS/utf8 servidor 1 y 2.png>)

*Figura 26. Reescritura de los dos index.html con -Encoding utf8 y verificación de su contenido con Get-Content, donde el signo de exclamación aparece correctamente.*

Una vez corregidos los archivos, se eliminaron los contenedores anteriores y se volvieron a crear los tres usando la variable ${PWD}. Es importante notar la diferencia de puertos: el balanceador publica el 8080 hacia la computadora, mientras que los dos servidores de aplicación solo tienen su puerto 80 interno, sin exposición al exterior.

![Figura 27](<CAPTURAS/hacer correr el puerto de index.js.png>)

*Figura 27. Verificación del archivo de servidor2 con Get-Content y creación de los tres contenedores con ${PWD}. En el listado final de docker ps se observa que balanceador está publicado en el puerto 8080 mientras que servidor1 y servidor2 solo tienen el puerto 80 interno, lo que confirma que el balanceador es el único punto de entrada desde el exterior.*

#### 4.4.5 Verificación del balanceo

Con los archivos corregidos se ejecutaron nuevamente los contenedores servidor1, servidor2 y balanceador, y se abrió http://localhost:8080. Al recargar la página, Nginx alternó entre los dos servidores.

![Figura 28](<CAPTURAS/servidor 1.1.png>)

*Figura 28. Respuesta del Servidor 1 en localhost:8080, con el signo de exclamación ya corregido.*

![Figura 29](<CAPTURAS/servidor 2.1.png>)

*Figura 29. Respuesta del Servidor 2 en localhost:8080 después de recargar la página. Esta alternancia entre los dos servidores demuestra que el balanceo de carga funciona.*

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

![Figura 30](<CAPTURAS/paso 23.png>)

*Figura 30. Creación de la carpeta de la práctica y de la red red-nube-usfx.*

![Figura 31](<CAPTURAS/paso 24.png>)

*Figura 31. Red red-nube-usfx en la lista de redes y creación del archivo blog.env.*

![Figura 32](<CAPTURAS/paso 26.png>)

*Figura 32. Creación de los volúmenes vol-db-datos y vol-wp-contenido.*

![Figura 33](<CAPTURAS/verificar volumenes.png>)

*Figura 33. Verificación conjunta con docker volume ls y docker network ls: aparecen los dos volúmenes de la práctica y la red red-nube-usfx, junto con los recursos de los ejercicios anteriores.*

### 5.3 Seguridad y variables de entorno (blog.env)

La práctica prohíbe escribir contraseñas en la línea de comandos con el parámetro -e. Por eso todas las variables se definieron en un archivo llamado blog.env, que los contenedores leen con la opción --env-file.

- **MYSQL_ROOT_PASSWORD**: contraseña del administrador root. La usa MariaDB.
- **MYSQL_DATABASE**: nombre de la base de datos que MariaDB crea automáticamente al arrancar por primera vez. La usa MariaDB.
- **MYSQL_USER** y **MYSQL_PASSWORD**: usuario y contraseña que MariaDB crea para que WordPress pueda conectarse. Las usa MariaDB.
- **WORDPRESS_DB_HOST**: dirección de la base de datos a la que debe conectarse WordPress, que es mariadb-blog:3306, es decir el nombre del contenedor y el puerto. La usa WordPress.
- **WORDPRESS_DB_NAME**: nombre de la base de datos. La usa WordPress y debe ser igual a MYSQL_DATABASE.
- **WORDPRESS_DB_USER** y **WORDPRESS_DB_PASSWORD**: credenciales con las que WordPress entra a la base. Las usa WordPress y deben coincidir con MYSQL_USER y MYSQL_PASSWORD.

![Figura 34](<CAPTURAS/paso 25.png>)

*Figura 34. Contenido de blog.env mostrado con Get-Content y creación del archivo uploads.ini.*

![Figura 35](<CAPTURAS/blog.env.png>)

*Figura 35. Archivo blog.env abierto en Visual Studio Code.*

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

*Figura 36. Ejecución del contenedor mariadb-blog con su volumen, su archivo blog.env y la codificación utf8mb4.*

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

![Figura 37](<CAPTURAS/terminal de emojis prueba.png>)

*Figura 37. Encendido del contenedor, ingreso a su terminal y consulta de character_set_server, que devuelve utf8mb4. Esta es la comprobación directa de que el punto extra se aplicó.*

Con el servidor ya confirmado en utf8mb4, se verificó también que la base de datos del blog hereda esa codificación. Para ello se consulted information_schema.SCHEMATA buscando el nombre wordpress_db, y el resultado mostró esa base de datos con DEFAULT_CHARACTER_SET_NAME igual a utf8mb4.

![Figura 38](<CAPTURAS/terminal de emojis prueba 1.png>)

*Figura 38. La base wordpress_db en utf8mb4, y creación de una tabla de prueba con tres textos que contienen emojis y caracteres especiales.*

#### 5.5.1 Prueba funcional con emojis

Se insertaron tres filas en la tabla de prueba con textos que incluyen un emoji de fiesta, la letra ñ con tilde y un corazón, y otro emoji de cohete. Luego se leyó la tabla completa.

Las tres filas se guardaron y se recuperaron correctamente, con todos los emojis intactos y sin sustituciones. La base de pruebas se eliminó al terminar con DROP DATABASE.

#### 5.5.2 Comparación con utf8mb3: demostración de la necesidad de utf8mb4

Para demostrar por qué utf8mb4 era necesario, se creó una tabla con la codificación antigua y se intentó guardar el mismo emoji:

    CREATE TABLE texto_viejo (contenido VARCHAR(20)) CHARACTER SET utf8mb3;
    INSERT INTO texto_viejo (contenido) VALUES ('Bienvenidos 🎉');

MariaDB rechazó la inserción con el error 1366, indicando que el valor de cadena es incorrecto para esa columna. La causa es el tamaño en memoria: un emoji necesita 4 bytes en UTF-8, mientras que utf8mb3 solo admite 3 bytes por carácter. Por eso utf8mb4, que significa el máximo de 4 bytes, es el único que admite emojis; los acentos, la letra ñ y el corazón sí caben en utf8mb3, porque ocupan menos bytes.

![Figura 39](<CAPTURAS/terminal de emojis prueba 2.png>)

*Figura 39. Arriba, los emojis y caracteres especiales guardados y leídos correctamente en la tabla con utf8mb4. Abajo, el error 1366 al intentar guardar el mismo emoji en una tabla con utf8mb3, que es la demostración de por qué se requería utf8mb4.*

#### 5.5.3 Prueba funcional desde el blog

La verificación en la terminal demuestra que la base de datos acepta emojis, pero la mejor prueba del punto extra es que el propio blog los muestre correctamente. Para comprobarlo se publicaron dos textos con emojis desde la interfaz de WordPress: un elemento de menú titulado Saludo de la Facultad con un emoji de cohete, y un texto de bienvenida que termina con un emoji de fiesta. Ambos se veröffentlicht correctamente en el navegador, sin errores ni caracteres reemplazados.

![Figura 40](<CAPTURAS/emojis prueba.png>)

*Figura 40. Blog con los emojis funcionando de extremo a extremo: el título Saludo de la Facultad 🚀 en el menú de navegación y el texto La materia de TRABAJANDO EN LA NUBE ES INTERESANTE 🎉 en la página de inicio. Este recorrido WordPress a MariaDB con utf8mb4 demuestra que la configuración funciona en la aplicación real y no solo en la consola.*

### 5.6 Nodo de aplicación: WordPress

Para aumentar el límite de subida de archivos de PHP a 64 MB se creó el archivo uploads.ini, que el intérprete PHP carga al arrancar. La ruta de configuración de PHP dentro de la imagen oficial de WordPress es /usr/local/etc/php/conf.d/, que es donde se montó el archivo.

- **file_uploads = On**: permite la subida de archivos.
- **memory_limit = 256M**: memoria máxima que puede usar cada script de PHP.
- **upload_max_filesize = 64M**: tamaño máximo de cada archivo subido.
- **post_max_size = 64M**: tamaño máximo del envío completo. Debe ser igual o mayor que el anterior, porque si fuera menor el límite real seguiría siendo bajo aunque upload_max_filesize fuera de 64M.
- **max_execution_time = 600**: segundos máximos que puede tardar un script antes de ser cortado.

![Figura 41](<CAPTURAS/uploads.ini.png>)

*Figura 41. Archivo uploads.ini abierto en Visual Studio Code.*

![Figura 42](<CAPTURAS/paso 29.png>)

*Figura 42. Ejecución del contenedor wordpress-blog y descarga de la imagen wordpress:latest.*

El comando de despliegue fue:
docker run -d --network red-nube-usfx --name wordpress-blog -p 8081:80 -v vol-wp-contenido:/var/www/html/wp-content -v "${PWD}/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini" --env-file blog.env wordpress:latest

- **-p 8081:80**: publica el blog en el navegador en http://localhost:8081.
- **-v vol-wp-contenido:/var/www/html/wp-content**: monta el volumen en la carpeta donde WordPress guarda temas, plugins e imágenes subidas.
- **-v "${PWD}/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini"**: bind mount de un archivo local, que coloca el uploads.ini de la computadora dentro de la carpeta donde PHP lee su configuración adicional.
- **--env-file blog.env**: carga las variables que conectan WordPress con la base de datos.

### 5.7 Instalación del blog

Con los dos contenedores en marcha se abrió http://localhost:8081 y se completó el instalador de WordPress: primero se eligió el idioma, luego se escribieron el título del sitio, el nombre de usuario, la contraseña y el correo electrónico. El primer intento falló porque el correo no tenía un formato válido; se corrigió y la instalación terminó. Finalmente se inició sesión con el usuario administrador.

![Figura 43](<CAPTURAS/WODPRESS INCIO.png>)

*Figura 43. Pantalla inicial de instalación de WordPress y selección de idioma.*

![Figura 44](<CAPTURAS/intsalcion wodpress.png>)

*Figura 44. Formulario de instalación con el título del sitio, el nombre de usuario, la contraseña y el correo electrónico.*

![Figura 45](<CAPTURAS/instalcion con correcion de correo.png>)

*Figura 45. Error indicando que la dirección de correo electrónico no es válida, junto con el dato corregido en el campo.*

![Figura 46](<CAPTURAS/iniciar sesion root.png>)

*Figura 46. Inicio de sesión del administrador en wp-login.php.*

### 5.8 Contenido creado antes de la prueba de resiliencia

Con el blog funcionando se creó contenido propio que serviría como prueba de que la persistencia está bien hecha: un texto personalizado en la página de inicio, una imagen subida a la biblioteca de medios y un tema nuevo.

![Figura 47](<CAPTURAS/persistencia 1.png>)

*Figura 47. Blog con la página de inicio ya personalizada con el texto de prueba, antes de eliminar los contenedores.*

Para el tema se siguió el flujo de WordPress: ver los temas que venían instalados, entrar al instalador, localizar Astra, instalarlo, activarlo y usarlo como tema del sitio.

![Figura 48](<CAPTURAS/TEMAS.png>)

*Figura 48. Temas incluidos con WordPress al inicio, antes de agregar Astra.*

![Figura 49](<CAPTURAS/otra prueba instlar astra.png>)

*Figura 49. Instalador de temas de WordPress, con Twenty Twenty-Four instalado y activado, y Astra disponible en la galería.*

![Figura 50](<CAPTURAS/para activar.png>)

*Figura 50. Tema Astra ya instalado, con el botón Activar disponible.*

![Figura 51](<CAPTURAS/segunda prubea.png>)

*Figura 51. Personalizador de WordPress con el tema Astra activo y la imagen subida configurada como logo del sitio.*

![Figura 52](<CAPTURAS/verificacion astra.png>)

*Figura 52. Página de ejemplo con el tema Astra aplicado, antes de eliminar los contenedores. En el pie de página se indica que funciona gracias al tema Astra.*

La imagen de portada del libro Rivales Divinos se subió desde la pantalla Subir medios. En esa pantalla aparece el texto **Tamaño máximo de archivo: 64 MB**, lo que confirma que el archivo uploads.ini fue leído correctamente por PHP.

![Figura 53](<CAPTURAS/RIVALES DIVINOS CAP.png>)

*Figura 53. Pantalla Subir medios de WordPress, donde se lee Tamaño máximo de archivo: 64 MB, con la imagen Rivales Divinos Portada ya subida. Este es el comprobante de que el límite de 64 MB se aplicó.*

![Figura 54](<CAPTURAS/vista page 2.png>)

*Figura 54. Página de ejemplo antes de eliminar los contenedores, con el título modificado y la imagen usada como logo del sitio.*

### 5.9 Prueba de resiliencia y auditoría

Esta prueba es el punto central de la práctica: eliminar los contenedores por completo y comprobar que ni la base de datos ni los archivos del blog se pierden.

#### 5.9.1 Eliminación de los contenedores

- **docker rm -f mariadb-blog wordpress-blog**: elimina ambos contenedores. La opción -f obliga a borrarlos aunque estuvieran funcionando. **Los volúmenes no se tocan.**
- **docker volume inspect vol-db-datos**: muestra los detalles del volumen de la base de datos. Si aparece, el volumen sigue existiendo.
- **docker volume inspect vol-wp-contenido**: lo mismo para el volumen del contenido de WordPress.

![Figura 55](<CAPTURAS/paso 30.png>)

*Figura 55. Fin de la descarga de la imagen de WordPress y primera eliminación de los dos contenedores con docker rm -f.*

Como consecuencia de la eliminación, el blog dejó de responder en el navegador.

![Figura 56](<CAPTURAS/al caer la pagina con la eliminacion de contendores.png>)

*Figura 56. Panel de WordPress sin respuesta tras eliminar los contenedores. El mensaje ERR_CONNECTION_REFUSED confirma que ya no hay ningún servicio escuchando en el puerto 8081.*

![Figura 57](<CAPTURAS/page 2 borrado.png>)

*Figura 57. La página de ejemplo también deja de responder, lo que confirma que la pérdida de acceso se debe a los contenedores y no a un problema del contenido.*

![Figura 58](<CAPTURAS/paso 31.png>)

*Figura 58. Los dos volúmenes siguen existiendo después de eliminar los contenedores, con su Mountpoint intacto.*

#### 5.9.2 Nuevo despliegue sobre los mismos volúmenes

Se volvieron a ejecutar exactamente los mismos comandos de los apartados 5.4 y 5.6, apuntando a los mismos volúmenes, y el blog volvió a funcionar con todo su contenido. Este ciclo de eliminar, verificar los volúmenes con docker volume inspect y volver a desplegar **se repitió tres veces** durante las pruebas.

![Figura 59](<CAPTURAS/paso 32.png>)

*Figura 59. Se recrean los contenedores mariadb-blog y wordpress-blog sobre los mismos volúmenes y se repite la eliminación.*

![Figura 60](<CAPTURAS/paso 33.png>)

*Figura 60. Segunda verificación de los volúmenes con docker volume inspect tras la eliminación de los contenedores.*

![Figura 61](<CAPTURAS/paso 34.png>)

*Figura 61. Nuevo despliegue y nueva eliminación de los contenedores por tercera vez.*

![Figura 62](<CAPTURAS/paso 35.png>)

*Figura 62. Tercera verificación de los volúmenes, que siguen existiendo y conservando sus datos.*

![Figura 63](<CAPTURAS/paso 36.png>)

*Figura 63. Despliegue final de mariadb-blog y wordpress-blog apuntando a los mismos volúmenes.*

#### 5.9.3 Verificación final

Después del último redespliegue el blog respondió en http://localhost:8081 con todo su contenido restaurado: la página de inicio con el texto personalizado, la página de ejemplo con su título y su logo, el tema Astra activo y la biblioteca de medios con las imágenes subidas. Además, la imagen pudo abrirse directamente desde la carpeta wp-content/uploads, lo que confirma que el archivo reside en el volumen vol-wp-contenido.

![Figura 64](<CAPTURAS/volvio todo tal cual.png>)

*Figura 64. Página de inicio personalizada restaurada tras recrear los contenedores. La sesión del administrador también se conservó.*

![Figura 65](<CAPTURAS/volvio pgae 2.png>)

*Figura 65. Página de ejemplo después de recrear los contenedores: conserva el título modificado y el logo, y en el pie de página se confirma que el tema Astra sigue activo.*

![Figura 66](<CAPTURAS/pagian volvio.png>)

*Figura 66. Biblioteca de medios con las imágenes subidas, todavía disponibles tras el redespliegue.*

![Figura 67](<CAPTURAS/MEDIO WODPRESS.png>)

*Figura 67. Imagen subida abierta directamente desde la ruta wp-content/uploads/2026/10, servida desde el volumen vol-wp-contenido.*
