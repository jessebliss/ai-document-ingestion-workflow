# Confidence Routing

How to use AI confidence scores to route documents to auto-approval vs. human review.

## Per-Field Confidence

- Each extracted field can have a score in [0, 1].
- Sources: model-provided scores, self-consistency checks, or heuristic rules (e.g., format match).
- Use per-field scores to highlight uncertain fields in the review UI and to compute aggregates.

## Document-Level Confidence

Common aggregates:

- **Minimum**: Any field below threshold → review. Conservative; good for high-stakes documents.
- **Weighted average**: Weight by importance (e.g., amount, date) so critical fields drive the decision.
- **Critical-field gate**: Only certain fields must meet threshold; others can be lower.

Choose based on risk tolerance and review capacity.

## Thresholds

Define in configuration, not code. Example:

| Document type   | Auto-approve threshold | Notes                    |
|-----------------|------------------------|--------------------------|
| Invoices        | 0.92                   | Amounts and dates critical |
| Contracts       | 0.95                   | Legal; prefer review     |
| General correspondence | 0.85           | More tolerance           |

## Routing Matrix

| Document confidence | Rule validation | Action        |
|---------------------|-----------------|---------------|
| High                | Pass            | Auto-create   |
| High                | Fail            | Review (fix rules or data) |
| Low                 | Pass            | Review        |
| Low                 | Fail            | Review        |

## Edge Cases

- **Missing field**: Treat as confidence 0 for that field unless “optional.”
- **Ambiguous document type**: Route to review; do not auto-approve.
- **Schema version mismatch**: Route to review or fail safely; do not guess.
