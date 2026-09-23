import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aivoa.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Deviation(Base):
    __tablename__ = "deviations"
    id = Column(Integer, primary_key=True)
    deviation_no = Column(String, unique=True)
    site = Column(String)
    date_of_occurrence = Column(Date, nullable=True)
    title = Column(String)
    source = Column(String)
    product = Column(String)
    batch_no = Column(String)
    description = Column(Text)
    impact = Column(String)
    severity = Column(String)
    ai_reason = Column(Text)
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)