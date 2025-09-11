# Imagen base oficial de Node
FROM node:18

# Instalar dependencias del sistema y yt-dlp desde apt
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de la app
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "index.js"]
