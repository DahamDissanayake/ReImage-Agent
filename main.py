import os
import io
import base64
import time
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv


load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GOOGLE_API_KEY", "")
client = genai.Client(api_key=api_key)

MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 5

async def call_gemini_with_retry(image_bytes, mime_type):
    """Calls Gemini with exponential backoff to handle 429 Rate Limit errors."""
    prompt = (
        "Analyze the provided image. Select ONLY the person in the picture and place them onto a "
        "pure, solid white background (#FFFFFF). Add soft, professional studio shadows to the subject "
        "so it looks like they were shot in a high-end photography studio. "
        "Then, transform the person into a high-quality cartoon. "
        "IMPORTANT: Do not deform their facial features or body features; keep them completely intact "
        "and recognizable. Use a pleasant, eye-catching pastel color palette. "
        "Output ONLY the final generated image."
    )

    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash-image',
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                ],
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE']
                )
            )
            return response
        except Exception as e:
            error_msg = str(e)

            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                if attempt < MAX_RETRIES - 1:
                    wait_time = INITIAL_RETRY_DELAY * (2 ** attempt)
                    print(f"Rate limit hit. Retrying in {wait_time} seconds (Attempt {attempt + 1})...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    raise HTTPException(
                        status_code=429, 
                        detail="Daily free quota exhausted. Please wait 24 hours or check Google AI Studio for limits."
                    )
            raise e

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        

        response = await call_gemini_with_retry(image_bytes, file.content_type)
        
        generated_image_bytes = None
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    generated_image_bytes = part.inline_data.data
                    break
        
        if not generated_image_bytes:
            raise HTTPException(status_code=500, detail="AI returned text instead of an image.")

        base64_result = base64.b64encode(generated_image_bytes).decode('utf-8')
        return {"image": base64_result}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)