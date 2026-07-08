#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_THRESHOLD = 0.9;

export function routeExtraction({
  documentConfidence,
  fieldConfidences = [],
  threshold = DEFAULT_THRESHOLD,
  criticalFields = [],
}) {
  const reasons = [];
  const docScore = Number(documentConfidence);
  const cutoff = Number(threshold);

  if (!Number.isFinite(docScore)) {
    return { action: "review", reasons: ["invalid_document_confidence"] };
  }

  if (docScore < cutoff) {
    reasons.push("document_confidence_below_threshold");
  }

  for (const field of fieldConfidences) {
    const score = Number(field.confidence);
    if (!Number.isFinite(score)) {
      reasons.push(`invalid_field_confidence:${field.path}`);
      continue;
    }
    if (score < cutoff) {
      reasons.push(`field_below_threshold:${field.path}`);
    }
    if (criticalFields.includes(field.path) && score < 0.95) {
      reasons.push(`critical_field_requires_review:${field.path}`);
    }
  }

  return {
    action: reasons.length === 0 ? "auto_approve" : "review",
    reasons,
  };
}

function readJsonArg() {
  const payload = process.argv[2];
  if (!payload) {
    console.error("Usage: node tools/score-confidence-routing.mjs '<json>'");
    process.exit(1);
  }
  return JSON.parse(payload);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = readJsonArg();
  const result = routeExtraction(input);
  console.log(JSON.stringify(result, null, 2));
}
