from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LawyerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(default="执业律师", max_length=100)
    specialty: str = Field(default="", max_length=200)
    email: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=50)
    status: str = Field(default="在职", max_length=20)


class LawyerCreate(LawyerBase):
    pass


class LawyerUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    specialty: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class LawyerResponse(LawyerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    company: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=120)
    notes: str = Field(default="", max_length=2000)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CaseBase(BaseModel):
    case_number: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    status: str = Field(default="进行中", max_length=50)
    lawyer_id: int
    client_id: int


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    case_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    lawyer_id: Optional[int] = None
    client_id: Optional[int] = None


class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    lawyer: Optional[LawyerResponse] = None
    client: Optional[ClientResponse] = None

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    start_time: datetime
    end_time: datetime
    location: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=2000)
    status: str = Field(default="待确认", max_length=50)
    lawyer_id: int
    client_id: int


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    lawyer_id: Optional[int] = None
    client_id: Optional[int] = None


class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime
    lawyer: Optional[LawyerResponse] = None
    client: Optional[ClientResponse] = None

    class Config:
        from_attributes = True
