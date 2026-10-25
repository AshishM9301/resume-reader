# Resume Reader - AI Parsing

## Overview

Uses spaCy transformer model for fast (<1 sec) entity extraction from resumes.

## Setup

### 1. Install Dependencies

```bash
cd server
pip install -r requirments.txt
python -m spacy download en_core_web_trf
```

### 2. Run Server

```bash
uvicorn main:app --reload
```

## API Endpoints

### POST /resume/parse

Upload a PDF resume and get structured JSON.

```bash
curl -X POST "http://localhost:8000/resume/parse" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "skills": ["Python", "React", "SQL"],
  "experience": ["5 years software development..."],
  "education": ["BS Computer Science..."],
  "companies": ["Tech Corp"]
}
```

### POST /resume/extract-entities

Get raw NER entities from a resume PDF.

```bash
curl -X POST "http://localhost:8000/resume/extract-entities" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "entities": [
    {"type": "PERSON", "text": "John Doe"},
    {"type": "EMAIL", "text": "john@example.com"},
    {"type": "ORG", "text": "Tech Corp"}
  ]
}
```

## Entity Types (spaCy)

| Label | Description |
|-------|-------------|
| PERSON | Person name |
| EMAIL | Email address |
| ORG | Company/organization |
| DATE | Dates |
| GPE | Countries/cities |
| SKILL | Technical skills (extracted via keyword matching) |
| EDUCATION | Education info (via keyword matching) |

## Speed

- **Target**: <1 second per resume
- **Actual**: ~0.3-0.8 seconds depending on resume length

## Future Improvements

1. Fine-tune on your own labeled data for better accuracy
2. Add project extraction
3. Add validation/evaluation pipeline
4. Batch processing for multiple resumes
