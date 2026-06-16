from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lawyer_platform.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Lawyer(Base):
    __tablename__ = "lawyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    title = Column(String(100), default="执业律师")
    specialty = Column(String(200), default="")
    email = Column(String(120), default="")
    phone = Column(String(50), default="")
    status = Column(String(20), default="在职")  # 在职/离职/休假
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("Case", back_populates="lawyer")
    appointments = relationship("Appointment", back_populates="lawyer")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    company = Column(String(200), default="")
    phone = Column(String(50), default="")
    email = Column(String(120), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("Case", back_populates="client")
    appointments = relationship("Appointment", back_populates="client")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="进行中")  # 进行中/已结案/已归档
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lawyer = relationship("Lawyer", back_populates="cases")
    client = relationship("Client", back_populates="cases")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String(200), default="")
    notes = Column(Text, default="")
    status = Column(String(50), default="待确认")  # 待确认/已确认/已完成/已取消
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    lawyer = relationship("Lawyer", back_populates="appointments")
    client = relationship("Client", back_populates="appointments")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
