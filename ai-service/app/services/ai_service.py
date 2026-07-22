import json

from google.genai import types

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.gemini import client


def analyze_incident(request):

    prompt = f"""
{SYSTEM_PROMPT}

Incident

Title:
{request.title}

Description:
{request.description}

Priority:
{request.priority}

Previous Similar Incidents:

{json.dumps(request.similar_incidents, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    return json.loads(response.text)