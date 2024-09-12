console.log('Let\'s write JavaScript');
let currentsong = new Audio();
let songs = [];
let currentIndex = 0;
let currfolder;

function convertToMinutesSeconds(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://192.168.100.77:3000/${folder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split(`/${folder}/`)[1];
            songName = decodeURIComponent(songName);
            songList.push(songName);
        }
    }
    return songList;
}

const playMusic = (index, pause = false) => {
    if (index < 0 || index >= songs.length) return;

    currentsong.src = `http://192.168.100.77:3000/${currfolder}/` + encodeURIComponent(songs[index]);
    currentIndex = index;
    document.querySelector(".songinfo").innerHTML = songs[index];
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    if (!pause) {
        currentsong.play();
        document.querySelector("#play").src = "pause.svg";
    }
};

async function main() {
    // Initially load songs from a default folder (if necessary)
    songs = await getsongs("songs/ncs");
    playMusic(0, true);

    let songul = document.querySelector(".songlist ul");

    const displaySongs = () => {
        songul.innerHTML = ""; // Clear previous song list
        for (const song of songs) {
            songul.insertAdjacentHTML('beforeend', `
                <li>
                    <img class="invert music" src="music.svg" alt="">
                    <div class="info">
                        <div class="song-name">${song.replace(".mp3", "")}</div>
                        <div class="song-artist">Sara</div>
                    </div>
                    <span class="playnow">Play Now</span>
                    <img class="invert pl" src="play.svg" alt="">
                </li>
            `);
        }

        document.querySelectorAll(".songlist li").forEach((e, index) => {
            e.addEventListener("click", () => {
                playMusic(index);
            });
        });
    };

    // Display initially loaded songs
    displaySongs();

    // Play/Pause button
    document.querySelector("#play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.querySelector("#play").src = "pause.svg";
        } else {
            currentsong.pause();
            document.querySelector("#play").src = "play.svg";
        }
    });

    // Time update event
    currentsong.addEventListener("timeupdate", () => {
        const currentTime = Math.floor(currentsong.currentTime);
        const duration = Math.floor(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentTime)}/${convertToMinutesSeconds(duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Previous/Next functionality
    document.querySelector("#previous").addEventListener("click", () => {
        if (currentIndex > 0) playMusic(currentIndex - 1);
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (currentIndex < songs.length - 1) playMusic(currentIndex + 1);
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Load playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            songs = await getsongs(`songs/${folder}`);
            displaySongs(); // Update UI with new songs
        });
    });

//add clickable even to mute and unmmute
    document.querySelector(".volune").addEventListener("click", (e) => {
        console.log("Click event on:", e.target); // Log to confirm the event target
        console.log("Click coordinates:", e.clientX, e.clientY); // Log click coordinates
    
        const volumeIcon = e.target;
        
        if (volumeIcon.src.includes("volume.svg")) {
            volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });
    
    
    

}

main();
