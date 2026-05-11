# Prompt and Schema Versioning

Versioning for extraction prompts, models, and canonical JSON schemas so audits, reprocessing, and regressions stay explainable.

## What to version

| Artifact | Example identifier | Stored where |
|----------|-------------------|--------------|
| Canonical entity schema | `schema_v3` | Repo, registry, or config store |
| Extraction prompt / instructions | `prompt_invoice_v12` | Template store with hash |
| Model | `gpt-4o-2024-08-06` | Pipeline config |
| OCR profile | `ocr_scan_aggressive_v2` | Pipeline config |

Every processed document should persist **at minimum**: `schema_version`, `prompt_id` (or hash), `model_id`, and `pipeline_build` (optional) on the extraction record and in the audit log.

## Compatibility rules

- **Additive schema changes** (new optional fields): bump minor version; old consumers ignore new fields.
- **Breaking schema changes** (rename, type change, new required field): bump major version; run parallel pipelines or migrate downstream mappers before cutover.
- **Prompt-only changes**: bump prompt revision; keep schema stable when possible so A/B tests isolate prompt impact.

## Reprocessing and regression

- When a bug is fixed in normalization or rules, define a **cohort** (e.g., `document_type=invoice` and `processed_at` range) and re-queue with `reprocess_reason` logged.
- Compare outputs schema-to-schema; sample human diff for high-risk fields before bulk re-approve.

## Product-facing notes

- In review UI, show a short “Extraction version” string so reviewers know which rules applied.
- Communicate deprecation windows for old schema versions to teams owning CRM field mappings.
