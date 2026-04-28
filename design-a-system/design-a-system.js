// === Partner / URL Params ===
let redirectUrl = '/thank-you';

async function initPartner() {
  const params = new URLSearchParams(window.location.search);
  const partner = params.get('partner');
  const cookieName = 'partner';

  if (partner) {
    const existing = await cookieStore.get(cookieName);
    if (!existing || existing.value !== partner) {
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

  if (!params.has('partner')) {
    const savedPartner = await cookieStore.get(cookieName);
    if (savedPartner) {
      const url = new URL(window.location.href);
      url.searchParams.set('partner', savedPartner.value);
      window.location.replace(url.toString());
    }
  }

  const partnerCookie = await cookieStore.get(cookieName);
  const partnerValue = partnerCookie?.value?.toLowerCase();
  const partnerItems = document.querySelectorAll('[data-partner-item]');
  partnerItems.forEach((item) => {
    const itemPartner = item.dataset.partnerItem.toLowerCase();
    if (itemPartner === partnerValue) {
      if (item.dataset.redirect) redirectUrl = `/thank-you/${item.dataset.redirect}`;
      const paragraph = item.querySelector("[data-info='paragraph']");
      const paragraphWrap = document.querySelector("[data-original='paragraph-wrap']");

      paragraphWrap.querySelector("[data-original='paragraph']").remove();
      paragraphWrap.append(paragraph);

      const logoUrl = item.querySelector("[data-info='logo-url']")?.src;
      if (logoUrl) {
        const logoEl = document.querySelector("[data-info='logo']");
        if (logoEl) logoEl.src = logoUrl;

        const logoWrap = document.querySelector("[data-info='logo-wrap']");
        if (logoWrap) logoWrap.style.display = 'flex';
      }
    }
  });

  document.querySelector('[data-partner="cms"]')?.remove();
}

initPartner();

// === Step Navigation ===
const steps = [1, 2, 3].map(n => document.querySelector(`[data-form-step='${n}']`));

function showStep(n) {
  steps.forEach((el, i) => {
    if (!el) return;
    el.style.display = i + 1 === n ? 'flex' : 'none';
  });

  const isStep3 = n === 3;
  const videoEl = document.querySelector('[data-visual="video"]');
  const systemEl = document.querySelector('[data-visual="system"]');
  if (videoEl) videoEl.style.display = isStep3 ? 'none' : 'block';
  if (systemEl) systemEl.style.display = isStep3 ? 'block' : 'none';
}

const editAddress = document.querySelector("[data-button='edit-address']");
editAddress.addEventListener('click', function (event) {
  showStep(1);
});

const showForm = document.querySelector("[data-button='show']");
showForm.addEventListener('click', function (event) {
  showStep(3);
});

// === Google Maps ===
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDgQwK9IikV6SubEN0XyKTdC3gHB52CEk0&libraries=places&callback=initAutocomplete';
script.async = true;

let autocomplete;
let validPlace = null;

function initAutocomplete() {
  const input = document.querySelector('#google-input');

  autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ['address_components', 'geometry'],
    types: ['address'],
  });

  autocomplete.addListener('place_changed', fillInAddress);

  // Invalidate if the user edits the input after selecting
  input.addEventListener('input', () => {
    validPlace = null;
  });
}

function fillInAddress() {
  const place = autocomplete.getPlace();

  if (!place.address_components || !place.geometry) {
    validPlace = null;
    return;
  }

  let streetNumber = '';
  let route = '';
  let city = '';
  let state = '';
  let stateLong = '';
  let country = '';
  let postcode = '';

  for (const component of place.address_components) {
    const type = component.types[0];

    switch (type) {
      case 'street_number':
        streetNumber = component.long_name;
        break;
      case 'route':
        route = component.long_name;
        break;
      case 'locality':
        city = component.long_name;
        break;
      case 'administrative_area_level_1':
        state = component.short_name;
        stateLong = component.long_name;
        break;
      case 'country':
        country = component.long_name;
        break;
      case 'postal_code':
        postcode = component.long_name;
        break;
      case 'postal_code_suffix':
        postcode += `-${component.long_name}`;
        break;
    }
  }

  const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();

  if (country !== 'United States') {
    document.querySelector('[data-modal="not-in-us"]').style.display = 'block';
    return;
  }

  validPlace = { streetAddress, city, state, stateLong, country, postcode, lat, lng };

  const addressEl = document.querySelector('[data-address]');
  if (addressEl) {
    const parts = [streetAddress, city, state, postcode].filter(Boolean);
    addressEl.textContent = parts.join(', ');
  }

  showStep(2);
}

window.initAutocomplete = initAutocomplete;
document.head.appendChild(script);

// === Solar Toggle ===
let hasSolar = 'No';

const solarButtons = document.querySelectorAll("[data-form='radio']");
solarButtons.forEach((btn) => {
  btn.addEventListener('click', function (e) {
    solarButtons.forEach((b) => b.classList.remove('is-active'));
    e.currentTarget.classList.add('is-active');
    hasSolar = e.currentTarget.textContent.trim();
  });
});

// === HubSpot ===
const HUBSPOT_PORTAL_ID = '47780539';
const HUBSPOT_FORM_ID = 'ffdc1c63-0eff-4515-ac13-85c5ff93e15b';

const FIELD_MAP = [
  { selector: '#email', name: 'email' },
  { selector: '#phone', name: 'phone' },
  { selector: '#first-name', name: 'firstname' },
  { selector: '#last-name', name: 'lastname' },
];

const FORM_SELECTOR = '#info-form';

async function submitHubSpotForm(fields) {
  const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    }),
  });

  return response.json();
}

document.querySelector(FORM_SELECTOR)?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!e.target.checkValidity()) {
    e.target.reportValidity();
    return;
  }

  const fields = FIELD_MAP.map(({ selector, name }) => ({
    name,
    value: document.querySelector(selector)?.value ?? '',
  }));

  if (validPlace) {
    fields.push(
      { name: 'address', value: validPlace.streetAddress },
      { name: 'city', value: validPlace.city },
      { name: 'state', value: validPlace.state },
      { name: 'zip', value: validPlace.postcode },
      { name: 'country', value: validPlace.country }
    );
  }

  fields.push({ name: 'has__solar', value: hasSolar });
  fields.push({ name: 'has_booked_meeting', value: 'false' });

  const partnerParam = new URLSearchParams(window.location.search).get('partner');
  if (partnerParam) {
    const partner = partnerParam.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    fields.push({ name: 'design_a_system_partner', value: partner });
  }

  try {
    const data = await submitHubSpotForm(fields);
    if (!data.errors) {
      const redirectParams = new URLSearchParams({
        firstname: document.querySelector('#first-name')?.value ?? '',
        lastname: document.querySelector('#last-name')?.value ?? '',
        email: document.querySelector('#email')?.value ?? '',
      });
      window.location.href = `${redirectUrl}?${redirectParams}`;
    } else {
      console.error('HubSpot errors:', data.errors);
    }
  } catch (err) {
    console.error('Submission error:', err);
  }
});

// === Anchor Link Scroll Offset ===
window.Webflow = window.Webflow || [];
window.Webflow.push(function () {
  $(document).off('click.wf-scroll');
});

(function () {
  function getOffset() {
    var el = document.querySelector('[data-sticky-nav="component"]');
    if (!el) return 0;
    var stickyTop = parseInt(getComputedStyle(el).top) || 0;
    return stickyTop + el.offsetHeight;
  }

  function smoothScroll(target) {
    var startPosition = window.pageYOffset;
    var targetPosition = target.getBoundingClientRect().top + startPosition - getOffset();
    var distance = targetPosition - startPosition;
    var duration = 1000;
    var startTime = null;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      var progress = Math.min((currentTime - startTime) / duration, 1);
      window.scrollTo(0, startPosition + distance * ease(progress));
      if (currentTime - startTime < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  }

  function handleClick(e) {
    var href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      var target = document.getElementById(href.slice(1));
      if (target) smoothScroll(target);
    }
  }

  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', handleClick);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.Webflow && window.Webflow.push(init);
})();
