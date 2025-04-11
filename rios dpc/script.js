const video = document.getElementById("riosVideo");
video.volume = 0.09; // Sets the volume to 20%

video.addEventListener("click", function () {
  if (this.paused) {
    this.play();
  } else {
    this.pause();
  }
});
