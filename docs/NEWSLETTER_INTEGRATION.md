# Newsletter integration scaffold

Status: `NEWSLETTER_LIVE=false`.

The static site has no subscriber database and no server API. Before enabling a
provider-hosted form, manually supply a hosted HTTPS form endpoint and update
the generated newsletter form action. Do not commit credentials.

Implementation checklist:

- Configure a provider-hosted endpoint outside this repository.
- Add final consent language and a link to the published privacy policy.
- Require double opt-in and retain the provider's consent record.
- Configure provider-side success and error redirects to `/newsletter/success` and `/newsletter/error`.
- Emit only aggregate events such as `newsletter_form_view`, `newsletter_submit_attempt`, `newsletter_success`, and `newsletter_error`; never include email addresses or other personal data.
- Manually set `NEWSLETTER_LIVE=true` only after legal review and endpoint configuration.
