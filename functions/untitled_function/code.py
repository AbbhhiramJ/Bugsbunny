# Function:   untitled_function
# Description: None
# Source:      Exported from the pod via `lemma --json functions get`.
# Hash:        53848db589c25f0966e06b162a22aa68d071694bdfdd67a598e9bfaf64afef4d
# Visibility:  POD


#input_type_name: FunctionInput
#output_type_name: FunctionOutput
#function_name: untitled_function

from pydantic import BaseModel
from lemma_sdk import FunctionContext


class FunctionInput(BaseModel):
    message: str = ""


class FunctionOutput(BaseModel):
    result: str


async def untitled_function(ctx: FunctionContext, data: FunctionInput) -> FunctionOutput:
    return FunctionOutput(result=f"Processed: {data.message}")
