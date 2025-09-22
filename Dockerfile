# Imagen base oficial de Node
FROM node:18

# Instalar dependencias del sistema + yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    ca-certificates \
 && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp \
 && rm -rf /var/lib/apt/lists/*

# Crear directorio de la app
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código (incluyendo cookies.txt si lo tienes)
COPY . .

# Exponer puerto (Render usa PORT automáticamente)
EXPOSE 3000

# Comando de inicio
CMD ["node", "index.js"]
