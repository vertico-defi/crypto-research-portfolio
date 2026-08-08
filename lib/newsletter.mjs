const validHostedEndpoint = endpoint => {
  if (typeof endpoint !== "string" || endpoint.length === 0) return null;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
};

export const newsletterState = ({ live, endpoint }) => {
  const action = validHostedEndpoint(endpoint);
  const enabled = live === "true" && action !== null;
  return { live: enabled, action: enabled ? action : null, method: enabled ? "post" : null, disabled: !enabled };
};

export const newsletterStatus = state => state.live ? "Newsletter signup is active." : "Newsletter signup is not active.";
export const newsletterSuccessMessage = state => state.live
  ? "Your subscription request was sent to the newsletter provider. Check your inbox and complete the double-opt-in confirmation. You are not subscribed until you confirm."
  : "Newsletter signup is not active. No subscription confirmation is available.";
export const newsletterErrorMessage = state => state.live
  ? "The newsletter provider could not confirm that the subscription request was completed. Please return to the newsletter page and try again."
  : "Newsletter signup is not active. Return to the newsletter page for current availability.";
export const newsletterView = state => ({
  status: newsletterStatus(state),
  cta: state.live ? "Subscribe to the newsletter for future public updates." : "Newsletter signup is not active; follow the public research log.",
  successHeading: "Check your inbox.",
  successMessage: newsletterSuccessMessage(state),
  errorHeading: state.live ? "Newsletter signup needs another attempt." : "Newsletter signup unavailable.",
  errorMessage: newsletterErrorMessage(state),
  buildSummary: state.live,
});

export const newsletterMarkup = ({ state, view = newsletterView(state), escape, successHref, errorHref, privacyHref }) => {
  const message = state.live ? "Signup is live. Confirm your subscription through the provider's double-opt-in email." : "Signup is not live. A hosted form endpoint, consent text, and double-opt-in process must be manually configured before activation.";
  const consent = state.live ? "By subscribing, you agree to the privacy policy and confirm you want the public research log." : "Consent language placeholder: Configure the linked privacy-policy URL before activation.";
  const action = state.action ? ` action="${escape(state.action)}" method="${state.method}"` : "";
  const controlState = state.disabled ? " disabled aria-disabled=\"true\"" : " aria-disabled=\"false\"";
  const button = state.live ? "Subscribe" : "Signup unavailable";
  return `<p class="status">${view.status}</p><h1>Follow the public research log.</h1><p class="lede">${message}</p><form${action} aria-describedby="newsletter-status"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email"${controlState} required><p id="newsletter-status"><small>${consent}</small></p><button type="submit"${controlState}>${button}</button></form><p><a href="${successHref}">Preview success page</a> · <a href="${errorHref}">Preview error state</a> · <a href="${privacyHref}">Privacy policy</a></p>`;
};
