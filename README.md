# ReImage Agent

Transform your portraits into high-quality cartoons using AI + Design.

**Created by [DAMA](https://github.com/DahamDissanayake/ReImage-Agent)**

## Prerequisites

- Python 3.10+
- Node.js 18+
- **Google Gemini API Key** - Get from [ai.google.dev](https://ai.google.dev/)

## Setup Instructions

### 1. Backend Setup

1.  Navigate to the project root:
    ```bash
    cd d:\Github\ReImage-Agent
    ```
2.  Set up the environment (Windows):

    ```bash
    setup.bat
    ```

    _This script creates a virtual environment, activates it, and installs dependencies._

3.  **Configure API Key:**
    - Create a `.env` file in the root directory
    - Add your **Google Gemini API key**:
      ```
      GOOGLE_API_KEY=your_google_api_key_here
      ```

4.  Run the Backend Server:
    ```bash
    venv\Scripts\uvicorn main:app --reload
    ```
    The server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1.  Navigate to the exported frontend directory:
    ```bash
    cd frontend
    ```
2.  Install Dependencies:

    ```bash
    npm install
    ```

    _(Note: If you encounter issues, run `npm install lucide-react clsx tailwind-merge` explicitly)_

3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    The UI will be accessible at `http://localhost:3000`.

## Features

- **Drag & Drop Upload**: Easy image uploading.
- **AI Cartoonification**: Uses Gemini 2.5 Flash Image (Nano Banana) for direct image-to-cartoon transformation.
- **White Background**: Automatically removes background and adds professional studio lighting.
- **Feature Preservation**: Maintains facial features and body proportions accurately.
- **Pastel Colors**: Pleasant, eye-catching color palette.
- **Secure**: API keys are managed server-side.
- **Fast Processing**: See your cartoon in 10-15 seconds.

## Troubleshooting

- **Hydration Error**: If you see a hydration mismatch, it is usually harmless (browser extensions). We have suppressed this warning.
- **Image Generation Error**: Ensure your API Key has the "Generative AI API" enabled and quota for Imagen.
