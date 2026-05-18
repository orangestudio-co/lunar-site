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

  const navContainer = component.nextElementSibling;
  const nextEl = navContainer
    ? navContainer.querySelector('[data-quote-slider-nav="next"]')
    : null;
  const prevEl = navContainer
    ? navContainer.querySelector('[data-quote-slider-nav="prev"]')
    : null;

  const totalSlides = component.querySelectorAll(".swiper-slide").length;

  const updateNavVisibility = (swiper) => {
    if (!navContainer) return;
    const currentPerView = swiper.params.slidesPerView;
    navContainer.style.display =
      typeof currentPerView === "number" && currentPerView >= totalSlides
        ? "none"
        : "";
  };

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
      nextEl,
      prevEl,
    },
    autoplay,
    breakpoints: isFade ? {} : {
      768: {
        slidesPerView: perView ?? 1.25,
      },
    },
    on: {
      init: updateNavVisibility,
      breakpoint: updateNavVisibility,
    },
  });
});
