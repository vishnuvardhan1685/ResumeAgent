from typing import Any, Dict

try:
    from langgraph.graph import END, StateGraph
except ImportError:  # pragma: no cover - optional at runtime
    END = "__end__"
    StateGraph = None

from agents.editor import suggest_resume_edits
from agents.extractor import extract_resume_data
from agents.interviewer import generate_interview_questions
from agents.matcher import match_resume_to_job
from models.responses import MatchResult
from state import PipelineState


def _append_event(state: PipelineState, name: str, data: Dict[str, Any]) -> PipelineState:
    events = list(state.get("events", []))
    events.append({"event": name, "data": data})
    return {**state, "events": events}


def extraction_node(state: PipelineState) -> PipelineState:
    extracted = extract_resume_data(state.get("parsed_text", ""))
    next_state = {**state, "extracted_data": extracted.model_dump()}
    return _append_event(next_state, "extractor", next_state["extracted_data"])


def matcher_node(state: PipelineState) -> PipelineState:
    extracted = extract_resume_data(state.get("parsed_text", ""))
    if "extracted_data" in state:
        extracted = extracted.model_validate(state["extracted_data"])
    match = match_resume_to_job(state.get("parsed_text", ""), state.get("job_text", ""), extracted)
    next_state = {**state, "match_result": match.model_dump()}
    return _append_event(next_state, "matcher", next_state["match_result"])


def interviewer_node(state: PipelineState) -> PipelineState:
    match = MatchResult()
    if "match_result" in state:
        match = MatchResult.model_validate(state["match_result"])
    questions = generate_interview_questions(match, state.get("job_text", ""))
    next_state = {**state, "questions": questions}
    return _append_event(next_state, "interviewer", {"questions": questions})


def editor_node(state: PipelineState) -> PipelineState:
    match = MatchResult()
    if "match_result" in state:
        match = MatchResult.model_validate(state["match_result"])
    suggestions = suggest_resume_edits(match)
    next_state = {**state, "suggestions": suggestions}
    return _append_event(next_state, "editor", suggestions)


def build_graph():
    if StateGraph is None:
        return None
    graph = StateGraph(PipelineState)
    graph.add_node("extractor", extraction_node)
    graph.add_node("matcher", matcher_node)
    graph.add_node("interviewer", interviewer_node)
    graph.add_node("editor", editor_node)
    graph.set_entry_point("extractor")
    graph.add_edge("extractor", "matcher")
    graph.add_edge("matcher", "interviewer")
    graph.add_edge("interviewer", "editor")
    graph.add_edge("editor", END)
    return graph.compile()


async def run_pipeline(state: PipelineState) -> PipelineState:
    app = build_graph()
    if app is not None:
        return await app.ainvoke(state)

    for node in (extraction_node, matcher_node, interviewer_node, editor_node):
        state = node(state)
    return state
