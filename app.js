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

// ======================================
// PARTE 2
// PESQUISA DE VÍDEOS E PLAYLISTS
// ======================================

async function searchYouTube(query){

    if(!query.trim()){
        musicList.innerHTML="";
        return;
    }

    musicList.innerHTML=
    "<div class='loading'>Pesquisando...</div>";

    try{

        const response =
        await fetch(

            `${SEARCH_URL}?part=snippet&type=video,playlist&maxResults=25&q=${encodeURIComponent(query)}&key=${API_KEY}`

        );

        const data =
        await response.json();

        if(data.error){

            musicList.innerHTML=`
            <div class="error">
                ${data.error.message}
            </div>
            `;

            return;

        }

        queue=[];

        renderResults(data.items);

    }

    catch(e){

        musicList.innerHTML=`
        <div class="error">
            Erro ao pesquisar.
        </div>
        `;

        console.log(e);

    }

}

// ======================================

function renderResults(items){

    musicList.innerHTML="";

    items.forEach(item=>{

        const snippet=item.snippet;

        const playlist =
        item.id.kind==="youtube#playlist";

        const id=
        playlist
        ?item.id.playlistId
        :item.id.videoId;

        queue.push({

            id,

            playlist,

            title:snippet.title,

            artist:snippet.channelTitle,

            thumb:
            snippet.thumbnails.high
            ?snippet.thumbnails.high.url
            :snippet.thumbnails.medium.url

        });

        const card=
        document.createElement("div");

        card.className="musicCard";

        card.innerHTML=`

        <img src="${snippet.thumbnails.medium.url}">

        <div class="musicInfo">

            <h4>

                ${snippet.title}

            </h4>

            <p>

                ${snippet.channelTitle}

            </p>

        </div>

        <div class="musicActions">

            <button class="playBtn">

                ${playlist?"📁":"▶"}

            </button>

            <button class="favBtn">

                ❤

            </button>

        </div>

        `;

        // PLAY

        card
        .querySelector(".playBtn")
        .onclick=()=>{

            if(playlist){

                loadPlaylist(id);

            }else{

                playVideo(id,snippet);

            }

        };

        // FAVORITOS

        card
        .querySelector(".favBtn")
        .onclick=()=>{

            addFavorite({

                id,

                title:snippet.title,

                artist:snippet.channelTitle,

                thumb:snippet.thumbnails.high.url

            });

        };

        musicList.appendChild(card);

    });

}

// ======================================
// PESQUISA AUTOMÁTICA
// ======================================

let searchTimer;

searchInput.addEventListener("input",()=>{

    clearTimeout(searchTimer);

    searchTimer=
    setTimeout(()=>{

        searchYouTube(

            searchInput.value

        );

    },400);

});



// ======================================
// PARTE 3
// PLAYER + PLAYLISTS + HISTÓRICO
// ======================================

async function loadPlaylist(playlistId){

    musicList.innerHTML =
    "<div class='loading'>Carregando playlist...</div>";

    try{

        const response = await fetch(

            `${PLAYLIST_URL}?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`

        );

        const data = await response.json();

        musicList.innerHTML = "";

        queue = [];

        data.items.forEach(item=>{

            const s = item.snippet;

            if(!s.resourceId) return;

            const videoId = s.resourceId.videoId;

            queue.push({

                id: videoId,

                playlist:false,

                title:s.title,

                artist:s.videoOwnerChannelTitle || s.channelTitle,

                thumb:s.thumbnails.high
                    ? s.thumbnails.high.url
                    : s.thumbnails.medium.url

            });

        });

        renderQueue();

    }

    catch(err){

        console.log(err);

        musicList.innerHTML =
        "<div class='error'>Erro ao abrir playlist.</div>";

    }

}

// ======================================

function renderQueue(){

    musicList.innerHTML = "";

    queue.forEach((music,index)=>{

        const card =
        document.createElement("div");

        card.className="musicCard";

        card.innerHTML=`

        <img src="${music.thumb}">

        <div class="musicInfo">

            <h4>${music.title}</h4>

            <p>${music.artist}</p>

        </div>

        <div class="musicActions">

            <button class="playBtn">

                ▶

            </button>

        </div>

        `;

        card.querySelector(".playBtn")
        .onclick=()=>{

            currentIndex=index;

            playCurrent();

        };

        musicList.appendChild(card);

    });

}

// ======================================

function playVideo(videoId,snippet){

    cover.src =
    snippet.thumbnails.high
    ? snippet.thumbnails.high.url
    : snippet.thumbnails.medium.url;

    musicTitle.textContent =
    snippet.title;

    musicArtist.textContent =
    snippet.channelTitle;

    saveHistory({

        id:videoId,

        title:snippet.title,

        artist:snippet.channelTitle,

        thumb:cover.src

    });

    if(playerReady){

        ytPlayer.loadVideoById(videoId);

    }else{

        window.open(

            "https://www.youtube.com/watch?v="+videoId,

            "_blank"

        );

    }

}

// ======================================

function playCurrent(){

    if(currentIndex<0) return;

    const music = queue[currentIndex];

    cover.src = music.thumb;

    musicTitle.textContent = music.title;

    musicArtist.textContent = music.artist;

    saveHistory(music);

    if(playerReady){

        ytPlayer.loadVideoById(

            music.id

        );

    }else{

        window.open(

            "https://www.youtube.com/watch?v="+music.id,

            "_blank"

        );

    }

}

// ======================================

nextButton.onclick=function(){

    if(currentIndex < queue.length-1){

        currentIndex++;

        playCurrent();

    }

};

prevButton.onclick=function(){

    if(currentIndex > 0){

        currentIndex--;

        playCurrent();

    }

};

// ======================================

function saveHistory(music){

    history.unshift(music);

    history = history.slice(0,100);

    localStorage.setItem(

        "history",

        JSON.stringify(history)

    );

}
