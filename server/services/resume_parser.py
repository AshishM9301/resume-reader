import re
from typing import Optional
import spacy

_nlp = None


def load_model():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_trf")
        except OSError:
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_trf"])
            _nlp = spacy.load("en_core_web_trf")
    return _nlp


def parse_resume(text: str) -> dict:
    nlp = load_model()
    doc = nlp(text[:10000])

    result = {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "experience": [],
        "education": [],
        "companies": [],
    }

    name_candidates = []
    for ent in doc.ents:
        if ent.label_ == "PERSON" and len(ent.text.split()) <= 4:
            name_candidates.append(ent.text)

    if name_candidates:
        result["name"] = name_candidates[0]

    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        result["email"] = emails[0]

    phone_pattern = r'(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        result["phone"] = re.sub(r'[^\d+]', '', phones[0])[:15]

    skill_keywords = [
        "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
        "react", "angular", "vue", "node.js", "nodejs", "express", "django", "flask",
        "fastapi", "spring", "sql", "mysql", "postgresql", "mongodb", "redis",
        "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
        "html", "css", "rest", "graphql", "microservices", "agile", "scrum",
        "machine learning", "deep learning", "nlp", "computer vision",
        "swift", "kotlin", "flutter", "react native", "android", "ios",
    ]

    text_lower = text.lower()
    found_skills = set()
    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())
    result["skills"] = list(found_skills)[:20]

    org_entities = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    result["companies"] = list(set(org_entities))[:10]

    edu_keywords = ["bachelor", "master", "phd", "doctorate", "b.s.", "m.s.", "b.a.", "m.a.",
                    "university", "college", "school", "degree", "graduated"]
    edu_lines = []
    for sent in doc.sents:
        sent_lower = sent.text.lower()
        if any(keyword in sent_lower for keyword in edu_keywords):
            if len(sent.text) < 200:
                edu_lines.append(sent.text.strip())
    result["education"] = edu_lines[:5]

    exp_keywords = ["experience", "worked", "position", "role", "job", "employed"]
    exp_lines = []
    for sent in doc.sents:
        sent_lower = sent.text.lower()
        if any(keyword in sent_lower for keyword in exp_keywords):
            if 50 < len(sent.text) < 300:
                exp_lines.append(sent.text.strip())
    result["experience"] = exp_lines[:5]

    return result


def extract_entities(text: str) -> list:
    nlp = load_model()
    doc = nlp(text[:10000])

    entities = []
    for ent in doc.ents:
        entities.append({
            "type": ent.label_,
            "text": ent.text
        })
    return entities


def extract_from_pdf(pdf_path: str) -> dict:
    import fitz

    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()

    return parse_resume(text)
