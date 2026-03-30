const swiper = new Swiper(".quotes-swiper", {
  // Optional parameters
  direction: "horizontal",
  loop: false,
  slidesPerView: 1.25,
  spaceBetween: 24,
  autoplay: {
    delay: 5000,
  },
  mousewheel: {
    enabled: true,
    forceToAxis: true,
    sensitivity: 50,
  },
});
