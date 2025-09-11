# Imagen base oficial de Node
FROM node:18

# Instalar dependencias del sistema y yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de la app
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código de la app
COPY . .

# Exponer puerto de la app
EXPOSE 3000

# Comando de inicio del servidor
CMD ["node", "index.js"]
