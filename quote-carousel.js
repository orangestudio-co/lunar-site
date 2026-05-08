const quoteComponent = document.querySelectorAll(".quotes-swiper");

quoteComponent.forEach((component) => {
  const perView = component.dataset.perView
    ? Number(component.dataset.perView)
    : undefined;
  const perViewMobile = component.dataset.perViewMobile
    ? Number(component.dataset.perViewMobile)
    : undefined;
  const gap = component.dataset.gap ? Number(component.dataset.gap) : undefined;

  const autoplay =
    component.dataset.autoplay === "false" ? false : { delay: 5000 };

  const isFade = component.dataset.effect === "fade";

  const swiper = new Swiper(component, {
    direction: "horizontal",
    loop: false,
    slidesPerView: isFade ? 1 : (perViewMobile ?? 1.25),
    spaceBetween: isFade ? 0 : (gap ?? 120),
    ...(isFade && {
      effect: "fade",
      centeredSlides: true,
    }),
    navigation: {
      nextEl: '[data-quote-slider-nav="next"]',
      prevEl: '[data-quote-slider-nav="prev"]',
    },
    autoplay,
    breakpoints: isFade ? {} : {
      768: {
        slidesPerView: perView ?? 1.25,
      },
    },
  });
});
