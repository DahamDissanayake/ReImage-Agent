# ReImage Agent

Transform your portraits into high-quality cartoons using AI-powered image generation.

**Created by [DAMA](https://github.com/DahamDissanayake/ReImage-Agent)**

## Prerequisites

- Python 3.10+
- Node.js 18+
- **Google Gemini API Key** - Get from [ai.google.dev](https://ai.google.dev/)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the project root:

   ```bash
   cd d:\Github\ReImage-Agent
   ```

2. Set up the environment (Windows):

   ```bash
   setup.bat
   ```

   _This script creates a virtual environment, activates it, and installs dependencies._

3. **Configure API Key:**
   - Create a `.env` file in the root directory
   - Add your **Google Gemini API key**:
     ```
     GOOGLE_API_KEY=your_google_api_key_here
     ```

4. Run the Backend Server:
   ```bash
   venv\Scripts\uvicorn main:app --reload
   ```
   The server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Dependencies:

   ```bash
   npm install
   ```

   _(Note: If you encounter issues, run `npm install lucide-react clsx tailwind-merge` explicitly)_

3. Run the Development Server:
   ```bash
   npm run dev
   ```
   The UI will be accessible at `http://localhost:3000`.

## Features

- **Drag & Drop Upload**: Easy image uploading with preview
- **AI Cartoonification**: Uses `gemini-2.5-flash-image` for direct image-to-cartoon transformation
- **White Background**: Automatically removes background and adds professional studio lighting
- **Feature Preservation**: Maintains 100% facial and body feature likeness
- **Pastel Colors**: Pleasant, eye-catching color palette
- **Retry Logic**: Automatic retry with exponential backoff for rate limit handling
- **Secure**: API keys are managed server-side
- **Fast Processing**: See your cartoon in 10-20 seconds

## How It Works

1. **Upload**: Drag and drop or select an image
2. **AI Processing**: The `gemini-2.5-flash-image` model analyzes the person and generates a cartoon version
3. **Result**: Download your high-quality cartoon with white background and studio lighting

## Technical Details

- **Backend**: FastAPI with `google-genai` SDK
- **Model**: `gemini-2.5-flash-image` with IMAGE response modality
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Rate Limiting**: Automatic retry with exponential backoff (3 attempts)

## Troubleshooting

- **Rate Limit (429)**: The app automatically retries with exponential backoff. If quota is exhausted, wait 24 hours or check [Google AI Studio](https://aistudio.google.com/) for limits.
- **No Image Returned**: Ensure your API key is valid and has access to `gemini-2.5-flash-image` model.
- **Frontend Issues**: Clear browser cache and restart the dev server.

## API Response Format

The backend returns:

```json
{
  "image": "base64_encoded_image_string"
}
```

## License

MIT License - Created by DAMA
