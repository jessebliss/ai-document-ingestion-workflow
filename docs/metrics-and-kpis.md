# Metrics and KPIs

Metrics for evaluating an AI-assisted document ingestion system from both product and platform perspectives.

## Quality Metrics

- **Field-level precision**: Of extracted fields, how many are correct.
- **Field-level recall**: Of expected fields, how many were captured.
- **Document-level pass rate**: Percentage of documents that pass validation without manual correction.
- **Critical field accuracy**: Accuracy for high-risk fields (e.g., amount, date, party).

## Operational Metrics

- **Review rate**: Percentage of documents routed to human review.
- **Review turnaround SLA**: Time from queue entry to human decision.
- **Auto-processing rate**: Percentage completed without human touch.
- **Exception rate**: Percentage that fail and require escalation.

## Performance and Cost

- **End-to-end latency**: Upload to record creation.
- **Stage latency**: OCR time, extraction time, validation time.
- **Cost per document**: OCR + model + infrastructure cost.
- **Cost per accepted record**: Useful for comparing automation strategies.

## Product Impact

- **Time saved per document** vs. manual baseline.
- **Data quality improvement** vs. previous process.
- **Rework reduction** in downstream systems.
- **User satisfaction** for reviewers/operators.

## Suggested Reporting Cadence

- **Daily**: Throughput, failures, queue depth, SLA breaches.
- **Weekly**: Precision/recall trend, review rate, cost per document.
- **Monthly**: Product outcomes, major failure modes, threshold tuning decisions.
