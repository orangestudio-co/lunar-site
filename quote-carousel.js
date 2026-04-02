const quoteComponent = document.querySelectorAll(".quotes-swiper");

quoteComponent.forEach((component) => {
  const perView = component.dataset.perView
    ? Number(component.dataset.perView)
    : undefined;
  const perViewMobile = component.dataset.perViewMobile
    ? Number(component.dataset.perViewMobile)
    : undefined;
  const gap = component.dataset.gap ? Number(component.dataset.gap) : undefined;

  const swiper = new Swiper(component, {
    direction: "horizontal",
    loop: false,
    slidesPerView: perViewMobile ?? 1.25,
    spaceBetween: gap ?? 120,
    navigation: {
      nextEl: '[data-quote-slider-nav="next"]',
      prevEl: '[data-quote-slider-nav="prev"]',
    },
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
