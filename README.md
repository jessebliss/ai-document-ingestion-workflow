# AI Document Ingestion Workflow

An architecture reference for AI-assisted document ingestion: converting unstructured documents (PDFs, images, scans) into structured data for operational systems such as CRMs and case management platforms.

---

## Overview

### The Problem

Organizations receive high volumes of unstructured documents—invoices, contracts, forms, correspondence—that must be turned into actionable records. Manual data entry is slow, error-prone, and does not scale. Pure automation risks propagating extraction errors into downstream systems. A robust solution combines AI extraction with validation gates and human oversight.

This repository documents a **human-in-the-loop** ingestion pipeline that balances automation with control.

### Design Principles

- **Structured output first**: Every extracted entity maps to a defined schema.
- **Confidence-aware routing**: Low-confidence extractions go to human review; high-confidence can auto-proceed with optional audit.
- **Audit trail**: Document source, extraction version, and approval steps are traceable.
- **Business rules over raw AI**: Validation rules catch logical and domain errors before records are created.

---

## Ingestion Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     AI DOCUMENT INGESTION PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────┐  │
│  │ Document │   │   OCR    │   │   LLM    │   │  Structured  │   │ Business │  │
│  │  Upload  │──▶│Processing│──▶│Extraction│──▶│ JSON Output  │──▶│  Rule    │  │
│  │          │   │          │   │          │   │              │   │Validation│  │
│  └──────────┘   └──────────┘   └──────────┘   └──────┬───────┘   └────┬─────┘  │
│        │                │                │            │                │        │
│        │                │                │            │                │        │
│        ▼                ▼                ▼            ▼                ▼        │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Storage  │     │ Text +   │     │ Entities │  │ Confidence   │  │ Pass /   │  │
│  │ (blob)   │     │ layout   │     │ + types  │  │ scores       │  │ Review   │  │
│  └──────────┘     └──────────┘     └──────────┘  └──────────────┘  └────┬─────┘  │
│                                                                         │        │
│  ┌──────────────────────────────────────────────────────────────────────▼─────┐  │
│  │                    HUMAN REVIEW QUEUE (when needed)                        │  │
│  │  • Low confidence fields  • Rule violations  • Manual override / reject     │  │
│  └──────────────────────────────────────────┬────────────────────────────────┘  │
│                                             │                                    │
│                                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                    RECORD CREATION IN CRM / CASE SYSTEM                    │   │
│  │  • Idempotent upsert  • Source document linked  • Audit log                │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Stages

| Stage | Description | Output |
|-------|-------------|--------|
| **1. Document upload** | Accept file (PDF, image); store in blob storage; generate document ID. | Document ID, storage path |
| **2. OCR processing** | Extract text and optional layout (tables, regions). Handles scans and images. | Raw text, optional structured layout |
| **3. LLM extraction** | Run extraction against schema; return entities + confidence. | Structured JSON + per-field confidence |
| **4. Structured JSON output** | Normalize to canonical schema (dates, amounts, IDs). | Canonical JSON document |
| **5. Business rule validation** | Apply rules (e.g., date ranges, required fields, cross-field checks). | Pass / fail + violation list |
| **6. Human review queue** | Route by confidence and rule failures; present UI for edit/approve/reject. | Approved payload or rejection |
| **7. Record creation** | Upsert into CRM/case system; link source document; write audit log. | Record ID, audit entry |

---

## Human-in-the-Loop Validation

Human review is triggered when:

- **Confidence below threshold** (e.g., any field &lt; 0.85 or document-level &lt; 0.90).
- **Business rule violation** that cannot be auto-corrected.
- **Document type ambiguous** or unsupported.
- **Manual request** (e.g., high-value or legal documents).

Review actions:

- **Approve** — Accept extraction (with or without edits); proceed to record creation.
- **Edit** — Correct fields; optionally re-run validation; then approve.
- **Reject** — Do not create record; optionally tag reason and route to exception handling.

Approved extractions are treated as ground truth for audit and for optional model fine-tuning.

---

## AI Confidence Handling

- **Per-field confidence**: Each extracted field has a score (0–1). Use for routing and UI (e.g., highlight low-confidence cells).
- **Document-level confidence**: Aggregate (e.g., minimum or weighted average) for overall routing.
- **Thresholds**: Define in config per document type or use case (e.g., invoices: 0.92; general correspondence: 0.85).
- **Missing vs. low confidence**: Distinguish “field not present” from “present but uncertain”; both can route to review with different UX.

See `examples/extraction-with-confidence.json` for a sample payload.

---

## Example JSON Output Structure

Canonical extraction output should include:

- **Document metadata**: ID, type, source file, processing timestamp.
- **Entities**: Array of typed entities (e.g., parties, line items, dates, amounts).
- **Confidence**: Per-field and optional document-level scores.
- **Validation**: Result of business rules (pass/fail, list of violations).

See:

- `examples/extraction-with-confidence.json` — Full extraction with confidence scores.
- `examples/canonical-entity-schema.json` — Reference schema for common entity types.

---

## Repository Structure

```
ai-document-ingestion-workflow/
├── README.md                 # This file
├── architecture/
│   ├── pipeline-overview.md  # Stage-by-stage pipeline description
│   └── confidence-routing.md # Confidence thresholds and routing logic
├── examples/
│   ├── extraction-with-confidence.json
│   ├── canonical-entity-schema.json
│   └── business-rules-example.md
└── docs/
    ├── glossary.md           # Terms: OCR, LLM extraction, confidence, etc.
    ├── integration-notes.md  # Hooks for CRM/case system integration
    └── metrics-and-kpis.md   # Quality, SLA, and cost metrics
```

---

## Related Topics

- **Schema design**: Keep entity schemas stable and versioned for downstream consumers.
- **Idempotency**: Use document ID (and optional version) so re-processing does not duplicate records.
- **Cost and latency**: OCR + LLM cost and time scale with document size; consider async processing and queue-based design.

For measurement guidance, see `docs/metrics-and-kpis.md`.

For SaaS integration patterns (APIs, webhooks, retries), see the companion repository **saas-integration-patterns**. For product thinking on AI-assisted workflows and human oversight, see **ai-product-workflow-experiments**.
