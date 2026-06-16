from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from database import get_db, Lawyer, Client, Case, Appointment
from models import (
    LawyerCreate, LawyerUpdate, LawyerResponse,
    ClientCreate, ClientUpdate, ClientResponse,
    CaseCreate, CaseUpdate, CaseResponse,
    AppointmentCreate, AppointmentUpdate, AppointmentResponse,
)

app = FastAPI(
    title="律师管理平台",
    description="Lawyer Management Platform Demo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"message": "律师管理平台 API", "docs": "/docs"}


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "lawyer_count": db.query(Lawyer).count(),
        "client_count": db.query(Client).count(),
        "case_count": db.query(Case).count(),
        "appointment_count": db.query(Appointment).count(),
        "active_case_count": db.query(Case).filter(Case.status == "进行中").count(),
    }


# ==================== 律师管理 ====================
@app.get("/api/lawyers", response_model=List[LawyerResponse])
def list_lawyers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Lawyer).offset(skip).limit(limit).all()


@app.post("/api/lawyers", response_model=LawyerResponse, status_code=status.HTTP_201_CREATED)
def create_lawyer(lawyer: LawyerCreate, db: Session = Depends(get_db)):
    db_lawyer = Lawyer(**lawyer.dict())
    db.add(db_lawyer)
    db.commit()
    db.refresh(db_lawyer)
    return db_lawyer


@app.get("/api/lawyers/{lawyer_id}", response_model=LawyerResponse)
def get_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="律师不存在")
    return lawyer


@app.put("/api/lawyers/{lawyer_id}", response_model=LawyerResponse)
def update_lawyer(lawyer_id: int, lawyer: LawyerUpdate, db: Session = Depends(get_db)):
    db_lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="律师不存在")
    for key, value in lawyer.dict(exclude_unset=True).items():
        setattr(db_lawyer, key, value)
    db.commit()
    db.refresh(db_lawyer)
    return db_lawyer


@app.delete("/api/lawyers/{lawyer_id}")
def delete_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    db_lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="律师不存在")
    db.delete(db_lawyer)
    db.commit()
    return {"message": "律师已删除"}


# ==================== 客户管理 ====================
@app.get("/api/clients", response_model=List[ClientResponse])
def list_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Client).offset(skip).limit(limit).all()


@app.post("/api/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@app.get("/api/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="客户不存在")
    return client


@app.put("/api/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="客户不存在")
    for key, value in client.dict(exclude_unset=True).items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client


@app.delete("/api/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="客户不存在")
    db.delete(db_client)
    db.commit()
    return {"message": "客户已删除"}


# ==================== 案件管理 ====================
@app.get("/api/cases", response_model=List[CaseResponse])
def list_cases(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Case).options(joinedload(Case.lawyer), joinedload(Case.client))
    if status:
        query = query.filter(Case.status == status)
    return query.offset(skip).limit(limit).all()


@app.post("/api/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    # 检查关联是否存在
    lawyer = db.query(Lawyer).filter(Lawyer.id == case.lawyer_id).first()
    client = db.query(Client).filter(Client.id == case.client_id).first()
    if not lawyer or not client:
        raise HTTPException(status_code=400, detail="律师或客户不存在")

    existing = db.query(Case).filter(Case.case_number == case.case_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="案件编号已存在")

    db_case = Case(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@app.get("/api/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).options(joinedload(Case.lawyer), joinedload(Case.client)).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="案件不存在")
    return case


@app.put("/api/cases/{case_id}", response_model=CaseResponse)
def update_case(case_id: int, case: CaseUpdate, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案件不存在")

    update_data = case.dict(exclude_unset=True)
    if "lawyer_id" in update_data:
        lawyer = db.query(Lawyer).filter(Lawyer.id == update_data["lawyer_id"]).first()
        if not lawyer:
            raise HTTPException(status_code=400, detail="律师不存在")
    if "client_id" in update_data:
        client = db.query(Client).filter(Client.id == update_data["client_id"]).first()
        if not client:
            raise HTTPException(status_code=400, detail="客户不存在")

    for key, value in update_data.items():
        setattr(db_case, key, value)
    db_case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_case)
    return db_case


@app.delete("/api/cases/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案件不存在")
    db.delete(db_case)
    db.commit()
    return {"message": "案件已删除"}


# ==================== 预约管理 ====================
@app.get("/api/appointments", response_model=List[AppointmentResponse])
def list_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return (
        db.query(Appointment)
        .options(joinedload(Appointment.lawyer), joinedload(Appointment.client))
        .order_by(Appointment.start_time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@app.post("/api/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    lawyer = db.query(Lawyer).filter(Lawyer.id == appointment.lawyer_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()
    if not lawyer or not client:
        raise HTTPException(status_code=400, detail="律师或客户不存在")

    if appointment.end_time <= appointment.start_time:
        raise HTTPException(status_code=400, detail="结束时间必须晚于开始时间")

    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.lawyer), joinedload(Appointment.client))
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="预约不存在")
    return appointment


@app.put("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, appointment: AppointmentUpdate, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="预约不存在")

    update_data = appointment.dict(exclude_unset=True)
    if "lawyer_id" in update_data:
        lawyer = db.query(Lawyer).filter(Lawyer.id == update_data["lawyer_id"]).first()
        if not lawyer:
            raise HTTPException(status_code=400, detail="律师不存在")
    if "client_id" in update_data:
        client = db.query(Client).filter(Client.id == update_data["client_id"]).first()
        if not client:
            raise HTTPException(status_code=400, detail="客户不存在")

    for key, value in update_data.items():
        setattr(db_appointment, key, value)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="预约不存在")
    db.delete(db_appointment)
    db.commit()
    return {"message": "预约已删除"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
