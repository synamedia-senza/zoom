import { init, uiReady, lifecycle, alarmManager, messageManager } from "@Synamedia/hs-sdk";
import { videoManager } from "./videoManager.js";
import shaka from "shaka-player";

const TEST_VIDEO = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

class ZoomVideo {
  init(video, minFrame, maxFrame) {
    this.video = video;
    this.player = new shaka.Player(video);
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
  }
  
  setMin() {
    this.setRect(this.minFrame);
  }
  
  setMax() {
    this.setRect(this.maxFrame);
  }
  
  animateMin() {
    this.animateRect(this.maxFrame, this.minFrame, 800);
  }
  
  animateMax() {
    this.animateRect(this.minFrame, this.maxFrame, 1000);
  }

  setRect(rect) {
    for (let key in rect) {
      let value = rect[key];
      if (key == "z-index") value = Math.floor(value);
      if (["top", "left", "width", "height"].includes(key)) value += "px";
      this.video.style[key] = value;
    }
  }

  animateRect(oldRect, newRect, ms, after) {
    const steps = 30;
    let rect = structuredClone(oldRect);
    let count = 0;
  
    let step = {};
    for (let key in rect) {
      step[key] = (newRect[key] - oldRect[key]) / steps;
    }
    
    let interval = setInterval(() => {
      for (let key in rect) {
        rect[key] += step[key];
      }
      this.setRect(rect);
    
      count++;
      if (count == steps) {
        clearInterval(interval);
        this.setRect(newRect);
        if (after) after();
      }
    }, ms / steps);
  }
  
  setVolume(value) {
    this.player.getMediaElement().volume = value;
  }
}

let margin = 50;
let ratio = 0.25;
let fullWidth = 1920;
let fullHeight = 1080;
let minimizedWidth = fullWidth * ratio;
let minimizedHeight = fullHeight * ratio;
let fullFrame = { 
  top: 0, 
  left: 0, 
  width: fullWidth, 
  height: fullHeight, 
  opacity: 1.0,
  "z-index": 100
};
let topRight = { 
  top: margin, 
  left: fullWidth - minimizedWidth - margin, 
  width: minimizedWidth, 
  height: minimizedHeight, 
  opacity: 0.75,
  "z-index": 200
};
let bottomLeft = { 
  top: fullHeight - minimizedHeight - margin, 
  left: margin, 
  width: minimizedWidth, 
  height: minimizedHeight, 
  opacity: 0.75,
  "z-index": 200
};

let zoom1 = new ZoomVideo();
let zoom2 = new ZoomVideo();

window.addEventListener("load", async () => {
  try {
    await init();
    
    zoom1.init(video1, bottomLeft, fullFrame); 
    videoManager.init(zoom1.player);
    await videoManager.load(TEST_VIDEO);
    zoom1.setMax();
    videoManager.play();
    
    zoom2.init(video2, topRight, fullFrame);
    await zoom2.player.load(TEST_VIDEO);
    zoom2.player.getMediaElement().currentTime = 60;
    zoom2.setMin();
    zoom2.player.getMediaElement().play();

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
  setTimeout(() => zoom2.animateMin(), 200);
  videoManager.localPlayer = zoom1.player;
  setTimeout(() => {
    zoom2.setVolume(0.0);
    zoom1.setVolume(1.0);
  }, 500);
}

function select2() {
  zoom2.animateMax();
  setTimeout(() => zoom1.animateMin(), 200);
  videoManager.localPlayer = zoom2.player;
  setTimeout(() => {
    zoom1.setVolume(0.0);
    zoom2.setVolume(1.0);
  }, 500);
}
