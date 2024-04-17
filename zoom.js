import { init, uiReady, lifecycle, alarmManager, messageManager } from "@Synamedia/hs-sdk";
import { videoManager } from "./videoManager.js";
import shaka from "shaka-player";

const TEST_VIDEO = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

class ZoomVideo {
  init(name, video) {
    this.name = name;
    this.video = video;
    this.player = new shaka.Player(video);
  }
  
  fadeIn() {
    this.video.style.animationDuration = "4.0s";
    this.video.style.animationName = "intro-" + this.name;
  }
  
  animateMin() {
    setTimeout(() => {
      this.video.style.animationDuration = "0.8s";
      this.video.style.animationName = "minimize-" + this.name;
      this.adjustVolume(1.0, 0.0, 800);
    }, 200);
  }

  animateMax() {
    this.video.style.animationDuration = "1.0s";
    this.video.style.animationName = "maximize-" + this.name;
    this.adjustVolume(0.0, 1.0, 1000);
  }

  adjustVolume(oldVolume, newVolume, ms) {
    const steps = 30;
    let count = 0;
    let current = oldVolume;
    let step = (newVolume - oldVolume) / steps;
  
    let interval = setInterval(() => {
      current += step;
      this.setVolume(current);
  
      count++;
      if (count == steps) {
        clearInterval(interval);
        this.setVolume(newVolume);
      }
    }, ms / steps);
  }
  
  setVolume(value) {
    this.video.volume = value;
  }
}

let zoom1 = new ZoomVideo();
let zoom2 = new ZoomVideo();

window.addEventListener("load", async () => {
  try {
    await init();
    
    zoom1.init("zoom1", video1); 
    videoManager.init(zoom1.player);
    await videoManager.load(TEST_VIDEO);
    zoom1.player.getMediaElement().currentTime = 5;
    zoom1.setVolume(0.0); // otherwise won't autoplay
    videoManager.play();
    
    zoom2.init("zoom2", video2);
    await zoom2.player.load(TEST_VIDEO);
    zoom2.player.getMediaElement().currentTime = 60;
    zoom2.setVolume(0.0);
    zoom2.player.getMediaElement().play();
    zoom2.fadeIn();
    
    uiReady();
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("keydown", async function(event) {
	switch (event.key) {
    case "Enter": await videoManager.toggleBackground(); break;
    case "ArrowLeft": videoManager.skip(-30); break;
    case "ArrowRight": videoManager.skip(30); break;      
    case "ArrowUp": select1(); break;      
    case "ArrowDown": select2(); break;      
		default: return;
	}
	event.preventDefault();
});

function select1() {
  zoom1.animateMax();
  zoom2.animateMin();
  videoManager.localPlayer = zoom1.player;
}

function select2() {
  zoom2.animateMax();
  zoom1.animateMin();
  videoManager.localPlayer = zoom2.player;
}
