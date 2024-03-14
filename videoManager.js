import { remotePlayer, lifecycle } from "@Synamedia/hs-sdk";

class VideoManager {

  // localPlayer;
  
  media() {
    return this.localPlayer.getMediaElement();
  }
  
  init(player) {
    this.localPlayer = player;
 
    remotePlayer.addEventListener("timeupdate", () => {
      this.media().currentTime = remotePlayer.currentTime || 0;
    });

    remotePlayer.addEventListener("ended", () => {
      lifecycle.moveToForeground();
    });

    lifecycle.addEventListener("onstatechange", (event) => {
      if (event.state === "background") {
        this.pause();
      } else if (event.state === "foreground") {
        this.play();
      }
    });
  }
  
  async load(url) {
    await this.localPlayer.load(url);
    try {
      await remotePlayer.load(url);
    } catch (error) {
      console.log("Couldn't load remote player.");
    }
  }
  
  play() {
    this.media().play().catch(error => {
      console.log("Unable to play video. Possibly the browser will not autoplay video with sound.");
    });
  }
  
  pause() {
    this.media().pause();
  }
  
  playPause() {
    if (this.media().paused) {
      this.play();
    } else {
      this.pause();
    }
  }
  
  skip(seconds) {
    this.media().currentTime = this.media().currentTime + seconds;
  }

  moveToForeground() {
    lifecycle.moveToForeground();
  }

  moveToBackground() {
    let currentTime = this.media().currentTime;
    remotePlayer.currentTime = currentTime;
    remotePlayer.play();
  }
  
  async toggleBackground() {
    const currentState = await lifecycle.getState();
    if (currentState == "background" || currentState == "inTransitionToBackground") {
      lifecycle.moveToForeground();
    } else {
      this.moveToBackground();
    }
  }
}

export const videoManager = new VideoManager();