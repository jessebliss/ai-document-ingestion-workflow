# OCR Quality Signals

OCR output quality strongly affects downstream LLM extraction accuracy. Track these signals before running expensive extraction steps.

## Core signals

| Signal | Description | Typical threshold |
|--------|-------------|-------------------|
| `meanWordConfidence` | Average OCR token confidence | `< 0.80` route to enhanced OCR |
| `lowConfidenceTokenRatio` | Share of tokens below 0.70 confidence | `> 0.25` route to review |
| `blankPageRatio` | Pages with near-empty text | `> 0.10` flag source quality issue |
| `layoutComplexityScore` | Tables, stamps, handwriting density | `> 0.65` prefer layout-aware OCR |

## Routing actions

1. **Re-OCR** with alternate engine/settings when confidence is low but document is salvageable.
2. **Pre-review** when OCR is acceptable but layout complexity is high.
3. **Reject early** when blank-page ratio indicates corrupted uploads.

## Example payload

See `examples/ocr-quality-report.json` for a representative OCR quality report used by routing services.

## Operational notes

- Persist OCR engine version with every report for regression analysis.
- Compare OCR quality trends by document source (scanner, email attachment, mobile photo).
- Do not run LLM extraction on documents that fail hard OCR quality gates unless policy requires manual override.
