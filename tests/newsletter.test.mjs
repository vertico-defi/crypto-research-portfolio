import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { newsletterMarkup, newsletterState } from "../lib/newsletter.mjs";

const endpoint = "https://newsletter.example/subscribe";

test("newsletter activation requires NEWSLETTER_LIVE=true and a valid hosted endpoint", () => {
  const cases = [
    { name: "live false without endpoint", live: "false", endpoint: null, expected: false },
    { name: "live false with endpoint", live: "false", endpoint, expected: false },
    { name: "live true without endpoint", live: "true", endpoint: null, expected: false },
    { name: "live true with endpoint", live: "true", endpoint, expected: true },
  ];
  for (const item of cases) {
    const state = newsletterState(item);
    const markup = newsletterMarkup({ state, escape: value => value, successHref: "/success/", errorHref: "/error/", privacyHref: "/privacy/" });
    assert.equal(state.live, item.expected, item.name);
    assert.equal(state.disabled, !item.expected, item.name);
    assert.equal(state.action, item.expected ? endpoint : null, item.name);
    assert.equal(state.method, item.expected ? "post" : null, item.name);
    assert.match(markup, item.expected ? /NEWSLETTER_LIVE=true/ : /NEWSLETTER_LIVE=false/, item.name);
    assert.match(markup, item.expected ? /aria-disabled="false"/ : /disabled aria-disabled="true"/, item.name);
    assert.match(markup, item.expected ? /action="https:\/\/newsletter\.example\/subscribe" method="post"/ : /<form aria-describedby/, item.name);
  }
});

test("newsletter rejects unsafe endpoints and does not expose configured secrets in default output", () => {
  assert.equal(newsletterState({ live: "true", endpoint: "http://newsletter.example/subscribe" }).live, false);
  for (const unsafeEndpoint of ["https://token@provider.example/subscribe", "https://user:password@provider.example/subscribe"]) {
    const state = newsletterState({ live: "true", endpoint: unsafeEndpoint });
    const markup = newsletterMarkup({ state, escape: value => value, successHref: "/success/", errorHref: "/error/", privacyHref: "/privacy/" });
    assert.equal(state.live, false, unsafeEndpoint);
    assert.equal(state.action, null, unsafeEndpoint);
    assert.doesNotMatch(markup, /action="https?:\/\//, unsafeEndpoint);
    assert.doesNotMatch(markup, /token@|user:password@/, unsafeEndpoint);
  }
  const html = readFileSync("out/newsletter/index.html", "utf8");
  assert.match(html, /NEWSLETTER_LIVE=false/);
  assert.match(html, /disabled aria-disabled="true"/);
  assert.doesNotMatch(html, /action="https?:\/\//);
  assert.doesNotMatch(html, /api[_-]?key|secret|token/i);
});
