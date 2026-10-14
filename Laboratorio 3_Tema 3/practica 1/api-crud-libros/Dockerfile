# Aqui se usa Node 20, que sirve como base para correr la API
FROM node:20-alpine

# Aqui se define /app, que sirve como carpeta de trabajo
WORKDIR /app

# Aqui se copian e instalan las dependencias, que sirve para tener express y nodemon
COPY package*.json ./
RUN npm install && npm i -g nodemon

# Aqui se copia el codigo, que sirve para llevar la app al contenedor
COPY . .

# Aqui se expone el 3000, que sirve para acceder a la API
EXPOSE 3000

# Aqui se arranca con node, que sirve en produccion (en desarrollo se cambia a nodemon)
CMD ["node", "app.js"]
