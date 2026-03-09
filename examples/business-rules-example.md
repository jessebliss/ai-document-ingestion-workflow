# Business Rules Example

Example business rules applied after LLM extraction and before human review or record creation.

## Rule Types

### Required Fields

- **Rule ID**: `REQ_INV_001`
- **Description**: Invoice must have invoice number, invoice date, and total amount.
- **Action**: Fail validation; route to review if any missing.

### Date Consistency

- **Rule ID**: `DATE_001`
- **Description**: Invoice date must be on or before due date.
- **Action**: Fail validation; surface in review UI with suggested correction.

### Amount Consistency

- **Rule ID**: `AMT_001`
- **Description**: Sum of line item amounts must equal total amount (within tolerance, e.g., 0.01).
- **Action**: Fail validation; allow override in review with reason.

### Allowlist / Denylist

- **Rule ID**: `VENDOR_001`
- **Description**: Vendor name must match an allowlisted vendor ID (e.g., from ERP).
- **Action**: Fail or warn; new vendors route to review for onboarding.

### Format Validation

- **Rule ID**: `FMT_001`
- **Description**: Invoice number must match pattern (e.g., `INV-\d{4}-\d+`).
- **Action**: Fail validation; highlight field in review.

## Output Format

Validation result attached to extraction payload:

```json
{
  "validation": {
    "passed": false,
    "violations": [
      {
        "ruleId": "AMT_001",
        "message": "Line item sum (15420.00) does not match total (15420.50)",
        "fields": ["lineItems", "totalAmount"]
      }
    ]
  }
}
```

Rules should be versioned and configurable per document type or tenant.
