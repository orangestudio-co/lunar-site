const quoteComponent = document.querySelectorAll(".quotes-swiper");

quoteComponent.forEach((component) => {
  const perView = component.dataset.perView
    ? Number(component.dataset.perView)
    : undefined;
  const perViewMobile = component.dataset.perViewMobile
    ? Number(component.dataset.perViewMobile)
    : undefined;

  const swiper = new Swiper(component, {
    direction: "horizontal",
    loop: false,
    slidesPerView: perViewMobile ?? 1.25,
    spaceBetween: 24,
    autoplay: {
      delay: 5000,
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      sensitivity: 50,
    },
    breakpoints: {
      768: {
        slidesPerView: perView ?? 1.25,
      },
    },
  });
});
