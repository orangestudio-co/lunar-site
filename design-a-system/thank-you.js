const calendlyLink = "CALENDLYLINKHERE";

const HUBSPOT_PORTAL_ID = "47780539";
const HUBSPOT_FORM_ID = "d9ce2611-9ac9-434e-ae6e-9d8d8816894c";

const params = new URLSearchParams(window.location.search);
const firstName = params.get("firstname");
const lastName = params.get("lastname");
const email = params.get("email");

Calendly.initInlineWidget({
  url: calendlyLink,
  parentElement: document.querySelector("[data-calendly='parent']"),
  prefill: {
    firstName: firstName,
    lastName: lastName,
    email: email,
  },
  utm: {
    utmSource: "lunar-energy",
    utmMedium: "website",
  },
});

window.addEventListener("message", async function (e) {
  if (e.data.event !== "calendly.event_scheduled") return;
  if (!email) return;

  try {
    await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [
            { name: "email", value: email },
            { name: "has_booked_meeting", value: "true" },
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.title,
          },
        }),
      },
    );
  } catch (err) {
    console.error("HubSpot update error:", err);
  }
});
