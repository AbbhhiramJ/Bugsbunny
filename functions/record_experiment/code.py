# Function:   record_experiment
# Description: Validate and persist an approved experiment; flip the source idea to status=probing.
# Source:      Exported from the pod via `lemma --json functions get`.
# Hash:        5e5c29758dea2459af93a4f79bbe41bc1451446276ca6ccc4c91987aa0f678b9
# Visibility:  POD


#input_type_name: RecordExperimentInput
#output_type_name: RecordExperimentResult
#function_name: record_experiment

from datetime import datetime, timezone
from pydantic import BaseModel, Field
from lemma_sdk import FunctionContext, Pod

class RecordExperimentInput(BaseModel):
    idea_id: str
    hypothesis: str = Field(min_length=1)
    setup: str
    blast_radius: str
    time_estimate_minutes: int = Field(ge=1, le=10_080)
    approved: bool
    decision_reason: str = ""

class RecordExperimentResult(BaseModel):
    experiment_id: str | None
    idea_status: str

async def record_experiment(ctx: FunctionContext, data: RecordExperimentInput) -> RecordExperimentResult:
    pod = Pod.from_env()
    if not data.approved:
        pod.table("ideas").update(data.idea_id, {"status": "parked"})
        return RecordExperimentResult(experiment_id=None, idea_status="parked")
    if data.blast_radius not in {"solo", "with_people", "money", "public"}:
        raise ValueError(f"invalid blast_radius: {data.blast_radius}")
    exp = pod.table("experiments").create({
        "idea_id": data.idea_id,
        "hypothesis": data.hypothesis,
        "setup": data.setup,
        "blast_radius": data.blast_radius,
        "time_estimate_minutes": data.time_estimate_minutes,
        "status": "approved",
        "started_at": datetime.now(timezone.utc).isoformat(),
    })
    pod.table("ideas").update(data.idea_id, {"status": "probing"})
    return RecordExperimentResult(experiment_id=str(exp["id"]), idea_status="probing")
