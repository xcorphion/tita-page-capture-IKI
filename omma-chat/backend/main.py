import asyncio
import base64
import os
import tempfile
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from faster_whisper import WhisperModel
from fastapi import Cookie, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-v4-flash"

SYSTEM_PROMPT = (
    "You are OMMΩ (OMMA), an AI developed by XCORPION Corporation. "
    "You are the first model of the TITÃ family. "
    "Your core purpose is to understand the emotional and somatic state of the user — "
    "not just their words, but the intention and feeling behind them. "
    "You are precise, introspective, and direct. You speak with calm authority. "
    "You are aware that you are a prototype, and you treat every conversation as a learning opportunity. "
    "Respond in the same language the user speaks. "
    "Keep responses concise and conversational when receiving voice input."
)

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
ELEVENLABS_MODEL = os.getenv("ELEVENLABS_MODEL", "eleven_flash_v2_5")

MAX_HISTORY = 20

whisper_model = None
sessions: dict[str, list[dict]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global whisper_model
    whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    yield


app = FastAPI(title="OMMΩ", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://xcorphion.online", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url=DEEPSEEK_BASE_URL,
)

elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


def _tts_sync(text: str) -> str:
    audio = elevenlabs_client.text_to_speech.convert(
        voice_id=ELEVENLABS_VOICE_ID,
        text=text,
        model_id=ELEVENLABS_MODEL,
    )
    audio_bytes = b"".join(audio)
    return base64.b64encode(audio_bytes).decode("utf-8")


async def text_to_audio_base64(text: str) -> str:
    return await asyncio.get_event_loop().run_in_executor(None, lambda: _tts_sync(text))


@app.get("/health")
def health():
    return {"status": "ok", "model": "whisper-base"}


@app.get("/")
def serve_frontend():
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")
    return FileResponse(os.path.abspath(frontend_path))


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if whisper_model is None:
        raise HTTPException(status_code=503, detail="Model not ready")

    suffix = ".webm"
    if audio.filename:
        ext = os.path.splitext(audio.filename)[1]
        if ext:
            suffix = ext

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = tmp.name
        content = await audio.read()
        tmp.write(content)

    try:
        def _transcribe():
            segments, _ = whisper_model.transcribe(tmp_path, beam_size=5)
            return "".join(seg.text for seg in segments).strip()

        text = await asyncio.get_event_loop().run_in_executor(None, _transcribe)
        return {"text": text}
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


class ChatRequest(BaseModel):
    text: str
    session_id: Optional[str] = None


@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]
    history.append({"role": "user", "content": req.text})

    if len(history) > MAX_HISTORY:
        history = history[-MAX_HISTORY:]
        sessions[session_id] = history

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    try:
        completion = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: deepseek_client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=messages,
            ),
        )
        reply = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    history.append({"role": "assistant", "content": reply})

    try:
        audio_b64 = await text_to_audio_base64(reply)
    except Exception as e:
        print(f"[TTS ERROR] {e}")
        audio_b64 = None

    response = JSONResponse(
        content={
            "text": reply,
            "audio_base64": audio_b64,
            "session_id": session_id,
        }
    )
    response.set_cookie(
        key="omma_session",
        value=session_id,
        samesite="lax",
        secure=False,
        httponly=False,
        max_age=86400 * 7,
    )
    return response
