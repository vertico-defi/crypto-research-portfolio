# Non-live payment architecture

Status: `STORE_LIVE=false`; `PAYMENTS_LIVE=false`.

No payment provider, wallet, API key, webhook credential, checkout session, or
digital delivery automation is implemented in this repository.

## Future options

- Hosted fiat checkout after a fresh German merchant eligibility review.
- BTCPay Server payment button or payment request, with no wallet private key in this repository.
- Manual fulfilment pilot with invoice and payment reconciliation outside the static site.
- Later webhook-based digital delivery, implemented only after provider review, threat modelling, and secure secret handling.

Do not integrate Coinbase Business or Stripe stablecoin checkout as a live
German merchant solution without a fresh eligibility review.

## Launch checklist

- Provider account approval
- Merchant identity
- Pricing
- Invoicing
- Payment reconciliation
- Refund process
- Delivery process
- Impressum
- Privacy policy
- Terms
- Withdrawal information
- Digital-download consent
- Tax review
- Cross-border VAT review
