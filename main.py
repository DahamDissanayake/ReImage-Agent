from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import base64
import os

# Project: ReImage-Agent
# Created by DAMA
# Repository: https://github.com/DahamDissanayake/ReImage-Agent

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    try:
        # Read and encode the image
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        image_data_url = f"data:image/jpeg;base64,{encoded_image}"

        # Step 1: Analyze image with Gemini to get a description
        # Using gemini-2.5-flash for analysis
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

        analysis_prompt = (
            "Analyze the provided image. Describe the MAIN person in the picture in extreme detail, "
            "focusing on their physical appearance, clothing, hair, pose, and facial expression. "
            "Do not describe the background. Output ONLY the visual description."
        )

        message = HumanMessage(
            content=[
                {"type": "text", "text": analysis_prompt},
                {"type": "image_url", "image_url": image_data_url},
            ]
        )

        analysis_response = llm.invoke([message])
        description = analysis_response.content
        print(f"Analysis: {description}")

        # Step 2: Generate cartoon with Imagen using the description
        # Using Google GenAI SDK (V2) for Imagen 4/3
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
            
            # Use 'imagen-3.0-generate-001' or 'imagen-3.0-fast-generate-001' which are commonly available
            # 'imagen-4.0-generate-001' might require special access or be in preview. 
            # Trying a standard known model ID for this library.
            # User reported 'imagen-4.0-generate-001' availability in list, but let's be safe or just use it.
            # I will try 'imagen-3.0-generate-001' as it is very stable, or fallback to 'imagen-4.0-generate-001' if requested.
            # User specifically saw 'imagen-4.0-generate-001' in the list earlier?
            # Let's stick to 'imagen-3.0-generate-001' for highest probability of success, OR pass the one form the list.
            # Actually, the user's issue was `AttributeError`. This fixes the import.
            # Let's try 'imagen-3.0-generate-001' first.
            model_id = "imagen-3.0-generate-001"
            
            generation_prompt = (
                f"A high-quality 3D cartoon style character of {description}. "
                "The character should be on a pure white background. "
                "Soft professional studio lighting. "
                "Pixar-style 3D rendering, cute, expressive, clean lines, pastel colors."
            )
            
            print(f"Generating image with prompt: {generation_prompt}")
            
            # Call generation
            response = client.models.generate_images(
                model=model_id,
                prompt=generation_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    include_rai_reasoning=True,
                    output_mime_type="image/jpeg"
                )
            )
            
            # Response handling for V2 SDK
            # response.generated_images[0].image.image_bytes is likely where data is
            if response.generated_images:
                image = response.generated_images[0].image
                # image.image_bytes is the bytes
                generated_base64 = base64.b64encode(image.image_bytes).decode('utf-8')
                return {"result": generated_base64, "type": "image"}
            else:
                return {"result": "No image generated.", "type": "text"}
            
        except ImportError:
             return {"result": "Library 'google-genai' not installed. Please install it to generate images.", "type": "text"}
        except Exception as img_err:
            print(f"Imagen Error: {img_err}")
            return {"result": f"Image generation failed, but here is the description: {description} (Error: {str(img_err)})", "type": "text"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

