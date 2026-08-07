const validHostedEndpoint = endpoint => {
  if (typeof endpoint !== "string" || endpoint.length === 0) return null;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

export const newsletterState = ({ live, endpoint }) => {
  const action = validHostedEndpoint(endpoint);
  const enabled = live === "true" && action !== null;
  return { live: enabled, action: enabled ? action : null, method: enabled ? "post" : null, disabled: !enabled };
};

export const newsletterMarkup = ({ state, escape, successHref, errorHref, privacyHref }) => {
  const status = state.live ? "NEWSLETTER_LIVE=true" : "NEWSLETTER_LIVE=false";
  const message = state.live ? "Signup is live. Confirm your subscription through the provider's double-opt-in email." : "Signup is not live. A hosted form endpoint, consent text, and double-opt-in process must be manually configured before activation.";
  const consent = state.live ? "By subscribing, you agree to the privacy policy and confirm you want the public research log." : "Consent language placeholder: Configure the linked privacy-policy URL before activation.";
  const action = state.action ? ` action="${escape(state.action)}" method="${state.method}"` : "";
  const controlState = state.disabled ? " disabled aria-disabled=\"true\"" : " aria-disabled=\"false\"";
  const button = state.live ? "Subscribe" : "Signup unavailable";
  return `<p class="status">${status}</p><h1>Follow the public research log.</h1><p class="lede">${message}</p><form${action} aria-describedby="newsletter-status"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email"${controlState} required><p id="newsletter-status"><small>${consent}</small></p><button type="submit"${controlState}>${button}</button></form><p><a href="${successHref}">Preview success page</a> · <a href="${errorHref}">Preview error state</a> · <a href="${privacyHref}">Privacy policy</a></p>`;
};
