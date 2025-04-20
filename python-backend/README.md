
# Python PDF Processing Backend

This is a Python Flask server that handles PDF operations for the PDF Tools application.

## Features

- PDF merging, splitting, rotation
- Adding watermarks
- Password protection and unlocking
- PDF compression (placeholder implementation)
- PDF conversion (placeholder implementation)

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

After deployment, update the `PYTHON_BACKEND_URL` in the Supabase edge function `python-pdf-bridge/index.ts`.

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the service.

### Process PDF

```
POST /process
```

Process a PDF file based on the specified operation.

Request body:
```json
{
  "operation": "merge|split|compress|rotate|watermark|protect|unlock|convert-to|convert-from",
  "filePaths": ["path/to/file1.pdf", "path/to/file2.pdf"],
  "options": {
    // Operation-specific options
    "pages": [0, 1, 2],  // For split
    "angle": 90,         // For rotate
    "watermarkText": "Confidential",  // For watermark
    "password": "secret",  // For protect/unlock
    "format": "jpg"      // For convert-from
  },
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-supabase-key"
}
```

Response:
```json
{
  "success": true,
  "resultUrl": "https://your-project.supabase.co/storage/v1/object/public/pdfs/results/processed.pdf"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in case of failures.
