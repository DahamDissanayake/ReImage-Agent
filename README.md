# ReImage-Agent Backend

This is the FastAPI backend for the ReImage Agent project.

## Prerequisites

- Python 3.8+
- pip

## Setup

1.  **Clone or navigate to the project directory:**

    ```bash
    cd d:\Github\ReImage-Agent
    ```

2.  **Create a virtual environment:**

    It is recommended to use a virtual environment to manage dependencies.

    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    - **Windows (Command Prompt):**
      ```bash
      .\venv\Scripts\activate
      ```
    - **Windows (PowerShell):**
      ```powershell
      .\venv\Scripts\Activate.ps1
      ```
    - **Unix/MacOS:**
      ```bash
      source venv/bin/activate
      ```

4.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

Start the development server using `uvicorn`:

```bash
uvicorn main:app --reload
```

Or if `uvicorn` is not recognized:

```bash
python -m uvicorn main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## API Documentation

FastAPI provides automatic interactive API documentation. Once the server is running, visit:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Development Workflow

### Project Structure

- `main.py`: Entry point of the application. Contains the app initialization and routes.
- `requirements.txt`: List of Python dependencies.

### Adding New Routes

1.  Open `main.py`.
2.  Define a new path operation function using standard FastAPI decorators (e.g., `@app.get`, `@app.post`).

    Example:

    ```python
    @app.get("/items/{item_id}")
    def read_item(item_id: int):
        return {"item_id": item_id}
    ```

3.  The server will automatically reload when you save changes.

### Adding Dependencies

If you install a new package, remember to update `requirements.txt`:

```bash
pip freeze > requirements.txt
```
