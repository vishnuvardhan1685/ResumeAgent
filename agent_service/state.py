from typing import Any, Dict, List, NotRequired, TypedDict


class PipelineState(TypedDict):
    resume_id: str
    job_id: NotRequired[str]
    parsed_text: NotRequired[str]
    job_text: NotRequired[str]
    extracted_data: NotRequired[Dict[str, Any]]
    match_result: NotRequired[Dict[str, Any]]
    difficulty: NotRequired[str] 
    questions: NotRequired[List[Dict[str, Any]]]
    suggestions: NotRequired[Dict[str, Any]]
    discovered_jobs: NotRequired[List[Dict[str, Any]]]
    events: NotRequired[List[Dict[str, Any]]]
