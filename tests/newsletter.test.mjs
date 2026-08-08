import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { newsletterErrorMessage, newsletterMarkup, newsletterState, newsletterStatus, newsletterSuccessMessage, newsletterView } from "../lib/newsletter.mjs";

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
    assert.match(markup, new RegExp(newsletterStatus(state)), item.name);
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
  const pages = ["out/index.html", "out/newsletter/index.html", "out/products/index.html", "out/products/audit-first-toolkit/index.html", "out/products/from-backtest-to-evidence/index.html"];
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    assert.match(html, /Newsletter signup is not active/);
    assert.doesNotMatch(html, /NEWSLETTER_LIVE=(?:true|false)/);
  }
  const newsletter = readFileSync("out/newsletter/index.html", "utf8");
  assert.match(newsletter, /disabled aria-disabled="true"/);
  assert.doesNotMatch(newsletter, /action="https?:\/\//);
  assert.doesNotMatch(newsletter, /api[_-]?key|secret|token/i);
  assert.match(readFileSync("out/newsletter/success/index.html", "utf8"), /No subscription confirmation is available/);
  assert.match(readFileSync("out/newsletter/error/index.html", "utf8"), /Return to the newsletter page for current availability/);
});

test("newsletter view renders every page from one resolved live predicate", () => {
  const cases = [
    { name: "live false without endpoint", live: "false", endpoint: null, expected: false },
    { name: "live false with endpoint", live: "false", endpoint, expected: false },
    { name: "live true without endpoint", live: "true", endpoint: null, expected: false },
    { name: "live true with HTTP endpoint", live: "true", endpoint: "http://newsletter.example/subscribe", expected: false },
    { name: "live true with credential endpoint", live: "true", endpoint: "https://token@newsletter.example/subscribe", expected: false },
    { name: "live true with HTTPS endpoint", live: "true", endpoint, expected: true },
  ];
  for (const item of cases) {
    const state = newsletterState(item);
    const view = newsletterView(state);
    const newsletter = newsletterMarkup({ state, view, escape: value => value, successHref: "/success/", errorHref: "/error/", privacyHref: "/privacy/" });
    assert.equal(state.live, item.expected, item.name);
    assert.equal(view.buildSummary, item.expected, item.name);
    assert.equal(view.status, newsletterStatus(state), item.name);
    assert.equal(view.successMessage, newsletterSuccessMessage(state), item.name);
    assert.equal(view.errorMessage, newsletterErrorMessage(state), item.name);
    assert.match(view.cta, item.expected ? /Subscribe to the newsletter/ : /Newsletter signup is not active/, item.name);
    assert.match(newsletter, new RegExp(view.status), item.name);
    if (item.expected) {
      assert.match(newsletter, new RegExp(`action="${endpoint}" method="post"`), item.name);
      assert.match(newsletter, /<input[^>]*aria-disabled="false"/, item.name);
      assert.match(newsletter, /<button[^>]*aria-disabled="false"/, item.name);
    } else {
      assert.doesNotMatch(newsletter, /action="https?:\/\//, item.name);
      assert.match(newsletter, /<input[^>]*disabled aria-disabled="true"/, item.name);
      assert.match(newsletter, /<button[^>]*disabled aria-disabled="true"/, item.name);
    }
  }
});
