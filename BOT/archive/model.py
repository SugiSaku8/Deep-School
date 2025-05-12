# app/main.py
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.offense_detector import OffenseDetector
import json
from datetime import datetime

Base = declarative_base()

class TextData(Base):
    __tablename__ = 'text_data'
    
    id = Column(Integer, primary_key=True)
    content = Column(String)
    is_offensive = Column(Boolean)
    created_at = Column(DateTime)
    feedback = relationship("Feedback", back_populates="text_data")

class Feedback(Base):
    __tablename__ = 'feedback'
    
    id = Column(Integer, primary_key=True)
    text_data_id = Column(Integer, ForeignKey('text_data.id'))
    user_label = Column(Boolean)
    feedback_at = Column(DateTime)
    text_data = relationship("TextData", back_populates="feedback")

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.on_event("startup")
async def startup_event():
    global engine, SessionLocal
    engine = create_engine('sqlite:///offense_detection.db')
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)

@app.post("/analyze")
async def analyze_text(request: TextRequest):
    detector = OffenseDetector()
    
    if not hasattr(detector, 'model'):
        raise HTTPException(status_code=503, detail="モデルが準備されていません")
        
    probability, is_offensive = detector.predict(request.text)
    
    db = SessionLocal()
    text_data = TextData(
        content=request.text,
        is_offensive=is_offensive,
        created_at=datetime.now()
    )
    db.add(text_data)
    db.commit()
    
    return {
        "is_offensive": is_offensive,
        "probability": probability,
        "text_id": text_data.id
    }

@app.post("/feedback/{text_id}")
async def provide_feedback(text_id: int, label: bool):
    db = SessionLocal()
    text_data = db.query(TextData).filter_by(id=text_id).first()
    
    if not text_data:
        raise HTTPException(status_code=404, detail="テキストデータが見つかりません")
        
    feedback = Feedback(
        text_data_id=text_id,
        user_label=label,
        feedback_at=datetime.now()
    )
    db.add(feedback)
    db.commit()
    
    return {"message": "フィードバックを受け付けました"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)