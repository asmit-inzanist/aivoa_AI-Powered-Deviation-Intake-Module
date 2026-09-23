from datetime import date
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from parser import file_to_text
from graph import graph, llm, Source, Impact, Severity, normalize_date
from db import Session, Deviation

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10MB


# ---------- 1. extract from file or text ----------
@app.post("/api/ai/extract")
async def extract(file: Optional[UploadFile] = File(None), text: Optional[str] = Form(None)):
    if file:
        data = await file.read()
        if len(data) > MAX_FILE_BYTES:
            raise HTTPException(400, "File is larger than 10MB")
        try:
            raw = file_to_text(file.filename, data)
        except ValueError as e:
            raise HTTPException(400, str(e))
    elif text and text.strip():
        raw = text
    else:
        raise HTTPException(400, "Provide a file or text")

    if not raw.strip():
        raise HTTPException(400, "Could not read any text from the input")

    try:
        out = graph.invoke({"raw_text": raw[:15000]})
    except Exception:
        raise HTTPException(502, "The AI service had a problem. Please try again.")
    return {"form": out["extracted"], "assessment": out["assessment"]}


# ---------- 2. chat: answers questions AND updates the form ----------
class ChatIn(BaseModel):
    message: str
    form: Optional[dict] = None

class FormUpdate(BaseModel):
    title: Optional[str] = None
    site: Optional[str] = None
    date_of_occurrence: Optional[str] = Field(None, description="YYYY-MM-DD only")
    source: Optional[Source] = None
    product: Optional[str] = None
    batch_no: Optional[str] = None
    description: Optional[str] = None
    impact: Optional[Impact] = None
    severity: Optional[Severity] = None

class ChatOut(BaseModel):
    reply: str = Field(description="Short answer to the user, 1-3 sentences")
    updates: FormUpdate = Field(description="Only the fields the user stated or asked to change. Leave all others null.")

@app.post("/api/ai/chat")
def chat(body: ChatIn):
    prompt = (
        f"Today is {date.today().isoformat()}. You are a pharma deviation management assistant. "
        "If the user describes an event or asks to change a field, put ONLY those fields in 'updates'. "
        "If it is just a question, leave every field in 'updates' null. "
        "Never invent values the user did not give.\n"
        f"Current form: {body.form}\nUser: {body.message}"
    )
    try:
        out = llm.with_structured_output(ChatOut).invoke(prompt)
    except Exception:
        raise HTTPException(502, "The AI service had a problem. Please try again.")

    updates = {k: v for k, v in out.updates.model_dump().items() if v is not None}
    if "date_of_occurrence" in updates:
        d = normalize_date(updates["date_of_occurrence"])
        if d:
            updates["date_of_occurrence"] = d
        else:
            del updates["date_of_occurrence"]
    return {"reply": out.reply, "updates": updates}


# ---------- 3. save + list ----------
class DeviationIn(BaseModel):
    site: str
    date_of_occurrence: Optional[date] = None
    title: str
    source: Source
    product: Optional[str] = None
    batch_no: Optional[str] = None
    description: str
    impact: Impact
    severity: Severity
    ai_reason: Optional[str] = None

@app.post("/api/deviations")
def save(d: DeviationIn):
    with Session() as s:
        count = s.query(Deviation).count() + 1
        row = Deviation(**d.model_dump(), deviation_no=f"DEV-{date.today().year}-{count:04d}")
        s.add(row)
        s.commit()
        return {"id": row.id, "deviation_no": row.deviation_no}

@app.get("/api/deviations")
def list_all():
    with Session() as s:
        return [
            {"deviation_no": r.deviation_no, "title": r.title, "severity": r.severity, "status": r.status}
            for r in s.query(Deviation).order_by(Deviation.id.desc())
        ]