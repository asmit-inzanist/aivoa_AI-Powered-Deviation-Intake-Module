from typing import TypedDict, Optional, Literal
from pydantic import BaseModel, Field,SecretStr
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
from datetime import datetime, date
import re



load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

def normalize_date(s):
    if not s:
        return None
    # already ISO, possibly with a time after it
    m = re.search(r"\d{4}-\d{2}-\d{2}", s)
    if m:
        return m.group(0)
    # 18-Sep-2026, 18 September 2026, 18/09/2026, 18-09-2026
    m = re.search(r"(\d{1,2})[\s\-/.]+([A-Za-z]{3,9}|\d{1,2})[\s\-/.,]+(\d{4})", s)
    if not m:
        return None
    day, mon, year = m.groups()
    if mon.isalpha():
        mon = mon[:3]          # September / Sept -> Sep
    for fmt in ("%d %b %Y", "%d %m %Y"):
        try:
            return datetime.strptime(f"{day} {mon} {year}", fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

# ---- dropdown values (must match the frontend exactly) ----
Source = Literal[
    "Quality Control (Analytical)",
    "Production (In-Process)",
    "Warehouse & Logistics",
    "Packaging Operations",
    "Engineering / Facilities",
]
Impact = Literal[
    "Product Quality & Identity",
    "Patient Safety Direct Risk",
    "Regulatory / Statutory Breach",
    "Operational Process Only",
]
Severity = Literal[
    "Critical (Batch Rejection Likely)",
    "Major (Requires Formal CAPA)",
    "Minor (Immediate Remediation)",
]

llm = ChatGroq(model="openai/gpt-oss-20b", api_key=SecretStr(groq_api_key))
class Extraction(BaseModel):
    title: str = Field(description="Short title, max 12 words")
    site: Optional[str] = None
    date_of_occurrence: Optional[str] = Field(None, description="Date only in YYYY-MM-DD, no time. null if not stated")
    source: Optional[Source] = Field(None, description="Department where the event happened. Reactor/process events = Production (In-Process); lab/OOS results = Quality Control (Analytical)")
    product: Optional[str] = None
    batch_no: Optional[str] = None
    description: str = Field(description="Clear summary of what happened, where, when and how it was detected. Always include key numbers such as measured value, approved limit and duration. Max 1500 characters.")

class Assessment(BaseModel):
    impact: Impact
    severity: Severity
    reason: str = Field(description="1-2 sentences explaining the recommendation")

class State(TypedDict, total=False):
    raw_text: str
    extracted: dict
    assessment: dict

def extract_fields(state: State):
    prompt = (f"Today is {date.today().isoformat()}. "
              "You are a pharma QA assistant for an API manufacturer. Extract deviation details "
              "from the text. If a field is not present, return null. Never invent values.\n\n"
              + state["raw_text"])
    result = llm.with_structured_output(Extraction).invoke(prompt)
    data = result.model_dump()
    data["date_of_occurrence"] = normalize_date(data["date_of_occurrence"])
    return {"extracted": data}

def assess_risk(state: State):
    prompt = (
        "You are a pharma QA reviewer. Recommend an initial impact and severity for this deviation.\n\n"
        "IMPACT:\n"
        "- Product Quality & Identity = affects purity, potency, assay, specification or identity of the product\n"
        "- Patient Safety Direct Risk = product already released or shipped, or a direct risk to patients\n"
        "- Regulatory / Statutory Breach = violates a regulation, license or data-integrity rule\n"
        "- Operational Process Only = process or documentation issue with no effect on product quality\n\n"
        "SEVERITY:\n"
        "- Critical (Batch Rejection Likely) = released product affected, patient risk, or batch likely rejected\n"
        "- Major (Requires Formal CAPA) = critical parameter out of range or OOS, needs formal investigation and CAPA\n"
        "- Minor (Immediate Remediation) = no product impact, can be fixed immediately\n\n"
        f"Deviation: {state['extracted']}"
    )
    result = llm.with_structured_output(Assessment).invoke(prompt)
    return {"assessment": result.model_dump()}

g = StateGraph(State)
g.add_node("extract_fields", extract_fields)
g.add_node("assess_risk", assess_risk)
g.set_entry_point("extract_fields")
g.add_edge("extract_fields", "assess_risk")
g.add_edge("assess_risk", END)
graph = g.compile()