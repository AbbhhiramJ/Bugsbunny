# Function:   record_run_summary
# Description: Writes a single run_summary row to the incidents table with the dedupe_bugs.stats object, so the app can compute the queue's totals (Total Reports Received, Total Incidents Created, Duplicate Reports Eliminated) across all runs.
# Source:      Exported from the pod via `lemma --json functions get`.
# Hash:        94ee95fe359919261a0267ed73aa47c7f4ca3dbff36e3554606195db58b9afc7
# Visibility:  POD


#input_type_name: RecordRunSummaryInput
#output_type_name: RecordRunSummaryOutput
#function_name: record_run_summary

from __future__ import annotations

from pydantic import BaseModel, Field
from lemma_sdk import FunctionContext, Pod


class RecordRunSummaryInput(BaseModel):
    run_id: str = Field("", description="Workflow run id (optional — caller may not know it)")
    stats: dict = Field(..., description="The dedupe_bugs.stats dict for this run")


class RecordRunSummaryOutput(BaseModel):
    run_row_id: str


async def record_run_summary(ctx: FunctionContext, data: RecordRunSummaryInput) -> RecordRunSummaryOutput:
    pod = Pod.from_env()

    payload = {
        "row_type":    "run_summary",
        "incident_id": data.run_id or None,
        "run_id":      data.run_id or None,
        "title":       "Run summary",
        "stats":       data.stats,
        "decision":    "pending",
    }
    row = pod.table("incidents").create(payload)
    return RecordRunSummaryOutput(run_row_id=str(row["id"]))
