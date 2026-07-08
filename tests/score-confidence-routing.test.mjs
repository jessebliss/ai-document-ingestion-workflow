import test from "node:test";
import assert from "node:assert/strict";
import { routeExtraction } from "../tools/score-confidence-routing.mjs";

test("auto approves high-confidence extraction", () => {
  const result = routeExtraction({
    documentConfidence: 0.96,
    fieldConfidences: [{ path: "entities.vendor.name", confidence: 0.94 }],
    threshold: 0.9,
  });
  assert.equal(result.action, "auto_approve");
  assert.equal(result.reasons.length, 0);
});

test("routes to review when document confidence is low", () => {
  const result = routeExtraction({
    documentConfidence: 0.82,
    fieldConfidences: [{ path: "entities.vendor.name", confidence: 0.95 }],
    threshold: 0.9,
  });
  assert.equal(result.action, "review");
  assert.ok(result.reasons.includes("document_confidence_below_threshold"));
});

test("requires review for critical fields below strict cutoff", () => {
  const result = routeExtraction({
    documentConfidence: 0.97,
    fieldConfidences: [{ path: "entities.totals.amountDue", confidence: 0.93 }],
    threshold: 0.9,
    criticalFields: ["entities.totals.amountDue"],
  });
  assert.equal(result.action, "review");
  assert.ok(result.reasons.includes("critical_field_requires_review:entities.totals.amountDue"));
});
