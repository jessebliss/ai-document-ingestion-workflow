# Failure Modes and Recovery

Operational playbook for common ingestion failures: what breaks, how users and systems experience it, and how to recover without corrupting downstream records.

## Failure modes by stage

### 1. Document upload

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| Reject before processing | Unsupported MIME, size limit, virus scan | Return clear error; allow re-upload after fix |
| Duplicate upload | Same file retried | Idempotent key on document ID; no duplicate CRM rows |

### 2. OCR

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| Empty or garbled text | Scan quality, handwriting, wrong language | Retry with alternate OCR profile; route to human with “OCR uncertain” flag |
| Partial layout | Complex tables, rotated pages | Fall back to text-only extraction; flag table fields for review |

### 3. LLM extraction

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| Timeout / 5xx from provider | Load, outage | Bounded retries with backoff; then queue for retry or human |
| Invalid JSON / schema mismatch | Model drift, prompt change | Log raw output; fail closed to review; do not auto-create |
| Systematic wrong entity type | Prompt or classifier error | Roll back prompt version; re-run affected batch from checkpoint |

### 4. Normalization and business rules

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| Normalization errors | Ambiguous dates, currency | Human edit in review UI; tighten rules or examples in prompt |
| Rule false positives | Over-strict rules | Tune rules; allow override with reason in audit |

### 5. Human review queue

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| SLA breach | Volume spike, staffing | Escalation routing; temporary lower auto-approve threshold only with explicit risk acceptance |
| Stuck items | Bug in UI or API | Admin release or bulk reject with reason; fix root cause |

### 6. Record creation (CRM / case system)

| Symptom | Likely cause | Recovery |
|--------|--------------|----------|
| Transient API errors | Provider 5xx, rate limit | Retry with idempotency key; dead-letter after cap |
| Permanent validation error | Mapping mismatch | Fix mapping; manual retry from approved payload |
| Duplicate detected | Idempotency gap | Reconcile by document ID; merge or archive duplicate |

## Design principles

- **Fail closed for money and identity fields**: Prefer review over silent wrong data.
- **Checkpoint after durable steps**: After OCR and after approval, persist state so retries do not redo expensive work unnecessarily.
- **Reprocessing**: Re-run from OCR or from extraction with same document ID; downstream upsert must remain idempotent.

## Metrics to watch

- Stage-level error rates and latency (see `docs/metrics-and-kpis.md`).
- Retry counts and dead-letter volume per stage.
- Time in review queue by document type.
