const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Configuration de multer pour enregistrer les fichiers dans le dossier src
const upload = multer({ dest: "uploads/" });

// Charger les vidéos existantes depuis videos.json
let videos = [];
const videosFilePath = path.join(__dirname, "videos.json");

// Charger les vidéos au démarrage
if (fs.existsSync(videosFilePath)) {
    videos = JSON.parse(fs.readFileSync(videosFilePath, "utf-8"));
}

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route pour gérer l'upload
app.post("/upload", upload.single("video"), (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "src", req.file.originalname);

    // Déplacer le fichier dans le dossier src
    fs.rename(tempPath, targetPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors du déplacement du fichier.");
        }

        // Ajouter la vidéo à la liste avec un titre vide par défaut
        const video = { path: `src/${req.file.originalname}`, title: "" };
        videos.push(video);

        // Sauvegarder la liste dans le fichier JSON
        fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2), "utf-8");

        res.status(200).send("Fichier téléversé avec succès.");
    });
});

// Route pour sauvegarder le titre d'une vidéo
app.post("/save-title", express.json(), (req, res) => {
    const { path, title } = req.body;

    // Mettre à jour le titre de la vidéo
    const video = videos.find(v => v.path === path);
    if (video) {
        video.title = title;

        // Sauvegarder les modifications dans le fichier JSON
        fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2), "utf-8");

        res.status(200).send("Titre enregistré avec succès.");
    } else {
        res.status(404).send("Vidéo non trouvée.");
    }
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
