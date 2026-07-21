from fastapi import APIRouter

from app.schemas.request import IncidentRequest
from app.services.ai_service import analyze_incident

router = APIRouter()


@router.post("/incident/analyze")
async def analyze(request: IncidentRequest):

    result = analyze_incident(request)

    return result