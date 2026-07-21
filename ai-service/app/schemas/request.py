from pydantic import BaseModel


class IncidentRequest(BaseModel):

    title: str

    description: str

    priority: str

    similar_incidents: list = []