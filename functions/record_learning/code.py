# Function:   record_learning
# Description: Create a new learning, or strengthen existing ones, from a fresh result. Idempotent on insight text.
# Source:      Exported from the pod via `lemma --json functions get`.
# Hash:        3257d78bedc0e94a3a580ff7c36d922687e2e15cfcb9c849ca2c817c33aed35d
# Visibility:  POD


#input_type_name: RecordLearningInput
#output_type_name: RecordLearningResult
#function_name: record_learning

from datetime import datetime, timezone
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class RecordLearningInput(BaseModel):
    insight: str
    applies_to: str
    confidence: str
    source_result_id: str
    linked_existing_learning_ids: list[str] = []
    action: str  # "created" | "strengthened"

class RecordLearningResult(BaseModel):
    action: str
    learning_ids: list[str]
    evidence_count: int

async def record_learning(ctx: FunctionContext, data: RecordLearningInput) -> RecordLearningResult:
    pod = Pod.from_env()
    now = datetime.now(timezone.utc).isoformat()
    learning_ids: list[str] = []
    total_count = 0
    if data.action == "strengthened" and data.linked_existing_learning_ids:
        for lid in data.linked_existing_learning_ids:
            row = pod.table("learnings").get(lid)
            new_count = int(row.get("evidence_count", 1)) + 1
            sources = list(row.get("source_result_ids", []) or [])
            sources.append(data.source_result_id)
            pod.table("learnings").update(lid, {
                "evidence_count": new_count,
                "source_result_ids": sources,
                "last_referenced_at": now,
            })
            learning_ids.append(lid)
            total_count += new_count
        return RecordLearningResult(action="strengthened", learning_ids=learning_ids, evidence_count=total_count)
    row = pod.table("learnings").create({
        "insight": data.insight,
        "applies_to": data.applies_to,
        "evidence_count": 1,
        "source_result_ids": [data.source_result_id],
        "last_referenced_at": now,
    })
    return RecordLearningResult(action="created", learning_ids=[str(row["id"])], evidence_count=1)
