import json

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.gemini import model


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

    response = model.generate_content(prompt)

    return json.loads(response.text)