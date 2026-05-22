# Review Queue Contract

Human reviewers consume queue items produced after extraction and business-rule validation. This contract keeps UI, API, and workflow engines aligned.

## Required fields

| Field | Type | Description |
|-------|------|-------------|
| `documentId` | string | Stable identifier for the source document |
| `documentType` | string | Routing profile (invoice, contract, correspondence, etc.) |
| `status` | string | `pending_review`, `in_review`, `approved`, `rejected` |
| `routing.reason` | string | Why review was required (`low_confidence`, `rule_violation`, `manual_policy`) |
| `reviewerActions` | string[] | Allowed actions in the review UI |

## Optional but recommended

- `lowConfidenceFields[]` with `path`, `value`, and `confidence`
- `ruleViolations[]` with stable `code`, affected `field`, and human-readable `message`
- `submittedAt` ISO-8601 timestamp for SLA tracking

## SLA guidance

- **P1 (money/legal docs)**: first touch within 15 minutes
- **P2 (operational docs)**: first touch within 4 hours
- **P3 (low-risk correspondence)**: first touch within 1 business day

See `examples/review-queue-item.json` for a representative payload.
