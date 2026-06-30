# What this file does:
# Defines the pipeline as a LangGraph StateGraph — a directed graph where
# each node is one agent. The graph runs:
#   extractor → matcher → (interviewer || editor in parallel) → END
#
# Each node function takes the full pipeline state, does its work,
# and returns an updated state. LangGraph handles passing state between nodes.
#
# analyze.py calls these node functions directly (without LangGraph's runner)
# using asyncio.gather for the parallel step — that's fine and intentional.

from typing import Any, Dict

try:
    from langgraph.graph import END, StateGraph
except ImportError:
    END = "__end__"
    StateGraph = None

from agents.editor import run_editor_agent
from agents.extractor import extract_resume_data
from agents.interviewer import run_interviewer_agent
from agents.matcher import match_resume_to_job
from models.responses import ExtractedData
from state import PipelineState


# ---------------------------------------------------------------------------
# Node wrappers
# What these do: each function is one "step" in the pipeline. They read from
# state, call the agent, and return updated state. LangGraph calls them in
# the order defined by the graph edges below.
# ---------------------------------------------------------------------------

def extraction_node(state: PipelineState) -> PipelineState:
    """
    Calls the Extractor — reads raw resume text, returns structured data:
    skills list, named entities, years of experience, summary.
    """
    extracted = extract_resume_data(state.get("parsed_text", ""))
    events = list(state.get("events", []))
    events.append({"event": "extractor", "data": extracted.model_dump()})
    return {**state, "extracted_data": extracted.model_dump(), "events": events}


def matcher_node(state: PipelineState) -> PipelineState:
    """
    Calls the Matcher — compares resume skills vs JD skills using both
    keyword overlap and semantic (embedding) similarity. Returns a score
    and lists of matched/missing/bonus skills.
    """
    extracted_raw = state.get("extracted_data", {})
    extracted = ExtractedData.model_validate(extracted_raw) if extracted_raw else None

    match = match_resume_to_job(
        state.get("parsed_text", ""),
        state.get("job_text", ""),
        extracted,
    )
    events = list(state.get("events", []))
    events.append({"event": "matcher", "data": match.model_dump()})
    return {**state, "match_result": match.model_dump(), "events": events}


def interviewer_node(state: PipelineState) -> PipelineState:
    """
    Calls the Interviewer Agent — uses the match result + resume summary
    to generate 12 LLM-powered interview questions at the right difficulty.
    """
    return run_interviewer_agent(state)


def editor_node(state: PipelineState) -> PipelineState:
    """
    Calls the Editor Agent — reads actual resume text + JD and produces
    specific copy-pasteable bullet rewrites and new bullet suggestions.
    """
    return run_editor_agent(state)


# ---------------------------------------------------------------------------
# Graph definition
# What this does: wires the nodes together into a directed graph.
# extractor → matcher → interviewer  (parallel branch 1)
#                     → editor       (parallel branch 2)
# Both parallel branches lead to END.
#
# Note: analyze.py handles the parallel execution itself via asyncio.gather,
# so in practice the LangGraph runner isn't used at runtime — but the graph
# is defined correctly here for documentation and future use.
# ---------------------------------------------------------------------------

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

    # Parallel branch: both interviewer and editor start after matcher
    graph.add_edge("matcher", "interviewer")
    graph.add_edge("matcher", "editor")

    graph.add_edge("interviewer", END)
    graph.add_edge("editor", END)

    return graph.compile()


async def run_pipeline(state: PipelineState) -> PipelineState:
    """
    Fallback runner used if LangGraph isn't available.
    Runs nodes sequentially (interviewer then editor, not parallel).
    """
    app = build_graph()
    if app is not None:
        return await app.ainvoke(state)

    for node in (extraction_node, matcher_node, interviewer_node, editor_node):
        state = node(state)
    return state