# Glossary

| Term | Definition |
|------|------------|
| **OCR** | Optical Character Recognition. Converts images or scanned PDFs into machine-readable text. |
| **LLM extraction** | Use of a Large Language Model (or structured-output model) to extract named entities and structured fields from text according to a schema. |
| **Confidence score** | A value (typically 0–1) indicating how certain the model or system is about an extracted value. Used for routing and UX. |
| **Canonical schema** | A single, stable JSON schema that all extracted data is normalized to before validation and persistence. |
| **Human-in-the-loop** | Design pattern where automated steps are combined with human review or approval before critical actions (e.g., creating a record). |
| **Business rule validation** | Application of domain-specific rules (required fields, consistency, allowlists) on extracted data before approval or record creation. |
| **Idempotent upsert** | Create or update a record keyed by a stable identifier so that repeating the same operation does not create duplicates. |
