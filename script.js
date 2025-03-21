let videoData = [];
let videoGrid = document.getElementById("video-grid");
const playerOverlay = document.getElementById("player-overlay");
const videoPlayer = document.getElementById("video-player");
const videoTitle = document.getElementById("video-title");
let isPlaying = false;
let customTitles = {};

// Charger les vidéos depuis le serveur
async function loadVideos() {
    try {
        const response = await fetch("/videos.json");
        if (response.ok) {
            const data = await response.json();
            videoData = data;
            displayVideos();
        }
    } catch (err) {
        console.error("Erreur lors du chargement des vidéos :", err);
    }
}

// Sauvegarder le titre d'une vidéo sur le serveur
async function saveTitleToServer(videoPath, title) {
    try {
        const response = await fetch("/save-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: videoPath, title }),
        });

        if (!response.ok) {
            console.error("Erreur lors de la sauvegarde du titre :", await response.text());
        }
    } catch (err) {
        console.error("Erreur réseau :", err);
    }
}

// Événement pour l'upload des fichiers
document.getElementById("upload-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const fileName = file.name;
            showTitleModal(fileName);
        } else {
            console.error("Erreur lors de l'envoi de la vidéo.");
        }
    } catch (err) {
        console.error("Erreur :", err);
    }
});

// Afficher la boîte modale pour entrer un titre
function showTitleModal(fileName) {
    const modal = document.getElementById("title-modal");
    const titleInput = document.getElementById("video-title-input");
    const saveButton = document.getElementById("save-title-btn");
    const cancelButton = document.getElementById("cancel-btn");

    modal.style.display = "flex";

    saveButton.onclick = () => {
        const title = titleInput.value.trim();
        if (title) {
            customTitles[fileName] = title;
            const videoPath = `src/${fileName}`;
            videoData.push({ path: videoPath, title });
            displayVideos();

            // Sauvegarder le titre sur le serveur
            saveTitleToServer(videoPath, title);
        }
        closeModal(modal);
    };

    cancelButton.onclick = () => {
        closeModal(modal);
    };
}

// Fermer la boîte modale
function closeModal(modal) {
    modal.style.display = "none";
    document.getElementById("video-title-input").value = "";
}

// Afficher la liste des vidéos
function displayVideos() {
    videoGrid.innerHTML = "";
    videoData.forEach(video => {
        if (video.title) {
            const card = document.createElement("div");
            card.classList.add("video-card");
            card.onclick = () => playVideo(video.path, video.title);

            const title = document.createElement("h4");
            title.textContent = video.title;

            card.appendChild(title);
            videoGrid.appendChild(card);
        }
    });
}

// Ouvrir la vidéo sans préchargement
function playVideo(videoFile, title) {
    if (isPlaying) {
        console.warn("Une vidéo est déjà en cours de lecture.");
        return;
    }

    isPlaying = true;
    playerOverlay.classList.add("active");
    setTimeout(() => { playerOverlay.style.opacity = "1"; }, 50);

    videoPlayer.src = videoFile; // Charger directement la source
    videoTitle.textContent = title;

    videoPlayer.play().then(() => {
        console.log("Lecture commencée.");
    }).catch(err => {
        console.error("Erreur pendant la lecture : ", err);
        isPlaying = false;
    });

    videoPlayer.addEventListener("ended", () => {
        isPlaying = false;
    });
}

// Fermer le lecteur vidéo
function closePlayer() {
    isPlaying = false;
    playerOverlay.style.opacity = "0";
    setTimeout(() => {
        playerOverlay.classList.remove("active");
        videoPlayer.pause();
        videoPlayer.src = ""; // Supprime la source pour éviter le chargement continu
    }, 300);
}

// Charger et afficher les vidéos existantes
loadVideos();
