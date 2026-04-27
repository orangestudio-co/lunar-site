let redirectUrl = "/thank-you";

async function initPartner() {
  const params = new URLSearchParams(window.location.search);
  const partner = params.get("partner");
  const cookieName = "partner";

  if (partner) {
    const existing = await cookieStore.get(cookieName);

    if (!existing) {
      const time = 3 * 31 * 24 * 60 * 60 * 1000;
      try {
        await cookieStore.set({
          name: cookieName,
          value: partner,
          expires: Date.now() + time,
        });
      } catch (error) {
        console.log(`Error setting ${cookieName}: ${error}`);
      }
    }
  }

  if (
    window.location.pathname === "/design-a-system" &&
    !params.has("partner")
  ) {
    const savedPartner = await cookieStore.get(cookieName);
    if (savedPartner) {
      window.location.href = `/design-a-system?partner=${savedPartner.value}`;
    }
  }

  const partnerCookie = await cookieStore.get(cookieName);
  const partnerValue = partnerCookie?.value?.toLowerCase();

  const partnerItems = document.querySelectorAll("[data-partner-item]");
  partnerItems.forEach((item) => {
    const itemPartner = item.dataset.partnerItem.toLowerCase();
    if (itemPartner === partnerValue) {
      // Page Modifications
      const form = document.querySelector(
        "#wf-form-Get-Pricing-Lead-Form-2024",
      );
      if (item.dataset.redirect) redirectUrl = item.dataset.redirect;
      const paragraph = item.querySelector("[data-info='paragraph']");
      const paragraphWrap = document.querySelector(
        "[data-original='paragraph-wrap']",
      );

      paragraphWrap.querySelector("[data-original='paragraph']").remove();
      paragraphWrap.append(paragraph);
    }
  });
}

initPartner();

window.Webflow = window.Webflow || [];

Webflow.push(function () {
  const $form = $("#wf-form-Get-Pricing-Lead-Form-2024"); // Use your form id

  $form.on("submit", function () {
    setTimeout(() => {
      if ($form.css("display") === "none") {
        window.location.href = redirectUrl;
        return;
      }

      const observer = new MutationObserver(() => {
        if ($form.css("display") === "none") {
          observer.disconnect();
          window.location.href = redirectUrl;
        }
      });

      observer.observe($form[0], {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }, 0);
  });
});
