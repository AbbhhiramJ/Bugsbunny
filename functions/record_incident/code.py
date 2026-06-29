# Function:   record_incident
# Description: Writes one row to the incidents table for a single cluster incident produced by the buggs-incident-triage workflow. Pulls the agent's structured output plus the cluster's bug ids and the full bug dicts.
# Source:      Exported from the pod via `lemma --json functions get`.
# Hash:        f2185c527a5ed2e2ffec70ec04fb81c5bbe17f9d91cbcc146d93a1fe7a3e76a1
# Visibility:  POD


#input_type_name: RecordIncidentInput
#output_type_name: RecordIncidentOutput
#function_name: record_incident

from __future__ import annotations

from pydantic import BaseModel, Field
from lemma_sdk import FunctionContext, Pod


class RecordIncidentInput(BaseModel):
    cluster_id: str = Field(..., description="Dedup cluster id (e.g. dup-001)")
    run_id: str = Field("", description="Workflow run id (optional — caller may not know it)")
    confidence: str | None = Field(None, description="Cluster confidence from dedupe_bugs (high|medium|low)")
    cluster_bug_ids: list[str] = Field(..., description="Bug ids in this cluster")
    all_bugs: list[dict] = Field(default_factory=list, description="Full batch passed to the workflow")
    agent_output: dict = Field(..., description="Structured agent output (10 fields)")


class RecordIncidentOutput(BaseModel):
    incident_row_id: str
    bug_count: int


async def record_incident(ctx: FunctionContext, data: RecordIncidentInput) -> RecordIncidentOutput:
    pod = Pod.from_env()

    # Filter bug dicts down to just the cluster members.
    ids = set(data.cluster_bug_ids)
    original_reports = [b for b in data.all_bugs if b.get("id") in ids]

    payload = dict(data.agent_output)
    payload.update({
        "row_type":              "incident",
        "confidence":            data.confidence,
        "incident_id":           data.cluster_id,
        "run_id":                data.run_id or None,
        "bug_count":             len(data.cluster_bug_ids),
        "bug_ids":               data.cluster_bug_ids,
        "original_reports":      original_reports,
        "decision":              "pending",  # in-memory on the app side
    })

    row = pod.table("incidents").create(payload)
    return RecordIncidentOutput(
        incident_row_id=str(row["id"]),
        bug_count=len(data.cluster_bug_ids),
    )
