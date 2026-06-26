// ======================================
// GALAXY MUSIC
// APP.JS
// PARTE 1
// ======================================

// SUA API DO YOUTUBE
const API_KEY = "AIzaSyDWhuV8HHco14UFQlK1VTni5BpWqKnA5hE";

// ENDPOINTS

const SEARCH_URL =
"https://www.googleapis.com/youtube/v3/search";

const PLAYLIST_URL =
"https://www.googleapis.com/youtube/v3/playlistItems";

// ELEMENTOS

const searchInput =
document.getElementById("searchInput");

const musicList =
document.getElementById("musicList");

const offlineList =
document.getElementById("offlineList");

const audio =
document.getElementById("audio");

const cover =
document.getElementById("cover");

const musicTitle =
document.getElementById("musicTitle");

const musicArtist =
document.getElementById("musicArtist");

const playButton =
document.getElementById("play");

const nextButton =
document.getElementById("next");

const prevButton =
document.getElementById("prev");

// PLAYER

let ytPlayer;

let playerReady = false;

// FILA

let queue = [];

let currentIndex = -1;

// FAVORITOS

let favorites =
JSON.parse(
localStorage.getItem("favorites")
|| "[]"
);

// HISTÓRICO

let history =
JSON.parse(
localStorage.getItem("history")
|| "[]"
);

// OFFLINE

let offline =
JSON.parse(
localStorage.getItem("offline")
|| "[]"
);

// CARREGA API DO YOUTUBE

const script =
document.createElement("script");

script.src =
"https://www.youtube.com/iframe_api";

document.body.appendChild(script);

// PLAYER

window.onYouTubeIframeAPIReady =
function(){

const div =
document.createElement("div");

div.id = "youtube-player";

div.style.display = "none";

document.body.appendChild(div);

ytPlayer =
new YT.Player(
"youtube-player",
{

height:"0",

width:"0",

events:{

onReady(){

playerReady = true;

console.log(
"YouTube Player OK"
);

}

}

});

};