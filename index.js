const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const CACHE_DIR = path.resolve(__dirname, "cache");

// Middleware
app.use(cors());

// Crear carpeta cache si no existe
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

app.get("/stream", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Falta parámetro url");
  }

  // Extraer videoId de la URL de YouTube
  const videoIdMatch = url.match(/v=([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) {
    return res.status(400).send("URL inválida");
  }

  const videoId = videoIdMatch[1];
  const filePath = path.join(CACHE_DIR, `${videoId}.webm`);

  // Si ya existe el archivo en cache, lo servimos
  if (fs.existsSync(filePath)) {
    return sendFile(req, res, filePath);
  }

  // Si no existe, descargar con yt-dlp
  console.log("Descargando:", url);
  const yt = spawn("yt-dlp", [
    "-f", "bestaudio",
    "-o", filePath,
    url
  ]);

  yt.stderr.on("data", (data) => {
    console.error("yt-dlp error:", data.toString());
  });

  yt.on("close", (code) => {
    console.log("yt-dlp terminó con código", code);
    if (fs.existsSync(filePath)) {
      sendFile(req, res, filePath);
    } else {
      res.status(500).send("Error descargando audio");
    }
  });
});

function sendFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "audio/webm",
      "Accept-Ranges": "bytes"
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Parse del rango
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

  if (start >= stat.size || end >= stat.size) {
    res.writeHead(416, {
      "Content-Range": `bytes */${stat.size}`,
    });
    return res.end();
  }

  const chunkSize = end - start + 1;
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "audio/webm"
  });

  fs.createReadStream(filePath, { start, end }).pipe(res);
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Servidor corriendo en http://localhost:${port}`)
);
