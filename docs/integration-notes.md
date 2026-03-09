# Integration Notes: CRM / Case Management

Notes for integrating the ingestion pipeline with downstream operational systems.

## Record Creation Contract

- **Input**: Approved canonical JSON + document ID + audit context (user ID, timestamp, source).
- **Output**: Record ID(s) in target system; optional link to document asset.
- **Idempotency**: Use document ID (or tenant + document ID) as idempotency key. Re-sends should upsert, not duplicate.

## Linking Source Document

- Store document blob reference (URI or asset ID) on the created record.
- Downstream systems can display “View source document” and re-run extraction if needed.

## Audit Log

For each record creation, log:

- Document ID
- Extraction version / schema version
- Approval type (auto vs. human)
- Approver (if human)
- Timestamp
- Target system and record ID
- Any overrides or rejections

## Error Handling

- **Transient**: Retry with backoff; use dead-letter queue after N failures.
- **Permanent** (e.g., validation error in target system): Alert; do not retry same payload without change; support manual retry from UI.

## Security and Compliance

- Documents and extractions may contain PII; ensure encryption in transit and at rest.
- Access to review queue and override actions should be role-based and audited.
