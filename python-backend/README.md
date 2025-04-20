
# Python PDF Processing Backend

This is a Python Flask server that handles PDF operations for the PDF Tools application.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python app.py
```

The server will run on port 8000 by default.

## Docker

You can also run this using Docker:

```bash
docker build -t pdf-python-backend .
docker run -p 8000:8000 pdf-python-backend
```

## Deployment

You can deploy this to any hosting service that supports Python or Docker containers, such as:

- Heroku
- Google Cloud Run
- AWS Lambda (with some modifications)
- Digital Ocean App Platform
- Render
- Railway

After deployment, update the `PYTHON_BACKEND_URL` in the Supabase edge function.
