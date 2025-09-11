# Imagen base con Node 18
FROM node:18

# Instalar yt-dlp
RUN apt-get update && apt-get install -y yt-dlp

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto (Railway usa PORT env)
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
