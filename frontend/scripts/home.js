const toggleMuteBtn = document.querySelector(".hero-mute-button");
const bgVideo = document.getElementById("hero-video");
const herovolumeinput = document.querySelector(".hero-volume-input");

toggleMuteBtn.addEventListener("click", () => {
  bgVideo.muted = bgVideo.muted ? false : true;
});

herovolumeinput.addEventListener("input", (e) => {
  bgVideo.volume = e.target.value * 0.01;
});
