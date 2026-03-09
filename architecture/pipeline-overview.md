# Pipeline Overview

This document describes each stage of the AI document ingestion pipeline in enough detail to implement or evaluate the design.

## 1. Document Upload

- **Input**: File (PDF, image), optional metadata (source system, document type hint).
- **Actions**: Validate file type and size; store in blob storage; assign immutable document ID; optionally create initial job record.
- **Output**: Document ID, storage URI, MIME type, size.
- **Failure handling**: Reject unsupported types; enforce size limits; return clear error codes.

## 2. OCR Processing

- **Input**: Document ID or storage URI.
- **Actions**: Run OCR (e.g., cloud vision, Tesseract, or document-specific APIs); extract text and optionally layout (tables, blocks).
- **Output**: Plain text, optional structured layout JSON (regions, tables).
- **Failure handling**: Retry transient failures; mark as failed after N attempts; support manual re-run.

## 3. LLM Extraction

- **Input**: OCR text (and optionally layout); document type; extraction schema.
- **Actions**: Call LLM with structured-output instructions (or use a dedicated extraction model); parse response into entities; compute or receive per-field confidence.
- **Output**: Structured JSON matching schema; confidence scores per field (and optionally per entity).
- **Failure handling**: Timeout and retry; fallback to “review required” if parsing fails.

## 4. Structured JSON Output

- **Input**: Raw LLM extraction output.
- **Actions**: Normalize formats (dates ISO 8601, amounts with currency, IDs trimmed); validate types; map to canonical entity schema.
- **Output**: Canonical JSON document ready for validation and persistence.
- **Failure handling**: Log normalization errors; flag record for review if critical fields cannot be normalized.

## 5. Business Rule Validation

- **Input**: Canonical JSON; rule set for document type.
- **Actions**: Run rules (required fields, date ranges, cross-field consistency, allowlists/denylists); collect violations.
- **Output**: Pass/fail; list of violations with field and rule ID.
- **Failure handling**: Fail open (send to review) or fail closed (block) per policy.

## 6. Human Review Queue

- **Input**: Documents that failed confidence threshold or business rules; optional manual queue.
- **Actions**: Present extraction in UI; allow edit, approve, reject; record decisions and edits.
- **Output**: Approved payload (possibly edited) or rejection with reason.
- **Failure handling**: Timeouts for SLA; escalation if queue backs up.

## 7. Record Creation in CRM / Case System

- **Input**: Approved canonical JSON; document ID; audit context (user, timestamp).
- **Actions**: Idempotent upsert (keyed by document ID or business key); link document asset; write audit log.
- **Output**: Record ID(s), success/failure.
- **Failure handling**: Retry with backoff; dead-letter for permanent failures; alert on repeated failures.
