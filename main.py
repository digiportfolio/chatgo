import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import json
from typing import AsyncGenerator
import asyncio

load_dotenv()

app = FastAPI(title="ChatGO", description="AI Chat dengan Groq API")

# CORS - biar frontend bisa akses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Model AI yang tersedia GRATIS
AVAILABLE_MODELS = [
    "llama-3.3-70b-versatile",   # ✅ Pengganti Mixtral (lebih bagus!)
    "llama-3.1-8b-instant",      # ✅ Llama 3.1 8B (cepat)
]

class ChatRequest(BaseModel):
    message: str
    model: str = "llama-3.3-70b-versatile"  # Model terbaru & stabil

class ChatResponse(BaseModel):
    reply: str

# ============ ENDPOINT TANPA STREAMING (Lebih sederhana) ============
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": "Anda adalah asisten AI yang ramah dan membantu. Jawab dalam bahasa Indonesia."},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        reply = completion.choices[0].message.content
        return ChatResponse(reply=reply)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dari AI: {str(e)}")

# ============ ENDPOINT DENGAN STREAMING ============
@app.post("/chat-stream")
async def chat_stream(request: ChatRequest):
    async def generate() -> AsyncGenerator[str, None]:
        try:
            stream = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "system", "content": "Anda adalah asisten AI yang ramah. Jawab dalam bahasa Indonesia."},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.7,
                max_tokens=1024,
                stream=True,  # <-- Aktifkan streaming
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0.01)  # Efek mengetik natural
            
            yield "data: [DONE]\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

# ============ Endpoint untuk cek kesehatan ============
@app.get("/health")
async def health():
    return {"status": "ok", "available_models": AVAILABLE_MODELS}

# ============ Serve file statis (HTML, CSS, JS) ============
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("🚀 ChatGO berjalan di http://localhost:8000")
    print(f"📋 Model tersedia: {AVAILABLE_MODELS}")
    uvicorn.run(app, host="0.0.0.0", port=8000)