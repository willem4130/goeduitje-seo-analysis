from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import os
from typing import List, Optional
import sqlite3

app = FastAPI(title="Content Calendar API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./content_calendar.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    platform = Column(String(50), nullable=False)  # instagram, linkedin, facebook
    post_type = Column(String(50), nullable=False)  # image, video, text
    scheduled_date = Column(DateTime, nullable=False)
    predicted_score = Column(Float, default=0.0)
    actual_score = Column(Float, nullable=True)
    status = Column(String(20), default="scheduled")  # scheduled, published, cancelled
    hashtags = Column(Text, nullable=True)
    media_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models for API
class PostCreate(BaseModel):
    title: str
    content: str
    platform: str
    post_type: str
    scheduled_date: datetime
    hashtags: Optional[str] = None
    media_url: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    platform: str
    post_type: str
    scheduled_date: datetime
    predicted_score: float
    actual_score: Optional[float]
    status: str
    hashtags: Optional[str]
    media_url: Optional[str]
    created_at: datetime

class PerformancePrediction(BaseModel):
    platform: str
    post_type: str
    scheduled_time: datetime
    predicted_score: float
    confidence: float
    optimal_times: List[str]

# Create tables
Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Performance prediction logic using existing scoring system
def calculate_instagram_score(likes: int, comments: int, video_views: int = 0, video_plays: int = 0) -> float:
    """Original Instagram scoring from existing system"""
    return (likes * 1) + (comments * 5) + (video_views * 0.1) + (video_plays * 0.5)

def calculate_linkedin_score(likes: int, total_reactions: int, comments: int, shares: int) -> float:
    """Original LinkedIn scoring from existing system"""
    return (likes * 2) + (total_reactions * 2) + (comments * 10) + (shares * 15)

def predict_post_performance(platform: str, post_type: str, scheduled_time: datetime) -> dict:
    """Predict performance based on historical patterns"""

    # Base scores by platform and type (from existing data analysis)
    base_scores = {
        "instagram": {
            "video": 800,  # Workshop behind-scenes videos perform well
            "image": 400,
            "text": 200
        },
        "linkedin": {
            "video": 300,
            "image": 200,
            "text": 150
        },
        "facebook": {
            "video": 250,
            "image": 150,
            "text": 100
        }
    }

    # Time multipliers based on day and hour
    day_of_week = scheduled_time.weekday()  # 0 = Monday
    hour = scheduled_time.hour

    # Optimal timing multipliers (based on social media best practices)
    time_multipliers = {
        "instagram": {
            "weekday": 1.2 if day_of_week < 5 else 0.8,
            "hour": 1.3 if 11 <= hour <= 14 else 1.0 if 18 <= hour <= 21 else 0.7
        },
        "linkedin": {
            "weekday": 1.4 if day_of_week < 5 else 0.6,
            "hour": 1.5 if 8 <= hour <= 10 else 1.2 if 17 <= hour <= 19 else 0.6
        },
        "facebook": {
            "weekday": 1.0 if day_of_week < 5 else 1.2,
            "hour": 1.3 if 19 <= hour <= 21 else 1.0 if 12 <= hour <= 15 else 0.7
        }
    }

    base_score = base_scores.get(platform, {}).get(post_type, 100)
    platform_multipliers = time_multipliers.get(platform, {"weekday": 1.0, "hour": 1.0})

    predicted_score = base_score * platform_multipliers["weekday"] * platform_multipliers["hour"]

    # Confidence based on how much data we have for this combination
    confidence = 0.8 if platform in ["instagram", "linkedin"] else 0.6

    # Optimal times for this platform
    optimal_times = {
        "instagram": ["Tuesday 14:00", "Wednesday 11:00", "Thursday 13:00"],
        "linkedin": ["Tuesday 09:00", "Wednesday 17:00", "Thursday 08:30"],
        "facebook": ["Friday 20:00", "Saturday 19:30", "Sunday 18:00"]
    }

    return {
        "predicted_score": round(predicted_score, 1),
        "confidence": confidence,
        "optimal_times": optimal_times.get(platform, [])
    }

# API Routes
@app.get("/")
async def root():
    return {"message": "Content Calendar API is running"}

@app.get("/posts", response_model=List[PostResponse])
async def get_all_posts(db: Session = Depends(get_db)):
    """Get all scheduled posts"""
    posts = db.query(ScheduledPost).order_by(ScheduledPost.scheduled_date).all()
    return posts

@app.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get specific post by ID"""
    post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.post("/posts", response_model=PostResponse)
async def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """Create new scheduled post with performance prediction"""

    # Get performance prediction
    prediction = predict_post_performance(post.platform, post.post_type, post.scheduled_date)

    # Create database entry
    db_post = ScheduledPost(
        title=post.title,
        content=post.content,
        platform=post.platform,
        post_type=post.post_type,
        scheduled_date=post.scheduled_date,
        predicted_score=prediction["predicted_score"],
        hashtags=post.hashtags,
        media_url=post.media_url
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    return db_post

@app.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(post_id: int, post: PostCreate, db: Session = Depends(get_db)):
    """Update existing post and recalculate prediction"""

    db_post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Update fields
    db_post.title = post.title
    db_post.content = post.content
    db_post.platform = post.platform
    db_post.post_type = post.post_type
    db_post.scheduled_date = post.scheduled_date
    db_post.hashtags = post.hashtags
    db_post.media_url = post.media_url

    # Recalculate prediction
    prediction = predict_post_performance(post.platform, post.post_type, post.scheduled_date)
    db_post.predicted_score = prediction["predicted_score"]

    db.commit()
    db.refresh(db_post)

    return db_post

@app.delete("/posts/{post_id}")
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete scheduled post"""

    db_post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(db_post)
    db.commit()

    return {"message": "Post deleted successfully"}

@app.post("/predict", response_model=PerformancePrediction)
async def get_performance_prediction(
    platform: str,
    post_type: str,
    scheduled_time: datetime
):
    """Get performance prediction for post parameters"""

    prediction = predict_post_performance(platform, post_type, scheduled_time)

    return PerformancePrediction(
        platform=platform,
        post_type=post_type,
        scheduled_time=scheduled_time,
        predicted_score=prediction["predicted_score"],
        confidence=prediction["confidence"],
        optimal_times=prediction["optimal_times"]
    )

@app.get("/analytics/optimal-times/{platform}")
async def get_optimal_times(platform: str):
    """Get optimal posting times for platform"""

    optimal_schedules = {
        "instagram": {
            "best_days": ["Tuesday", "Wednesday", "Thursday"],
            "best_hours": ["11:00", "13:00", "14:00", "19:00"],
            "peak_performance": "Tuesday 14:00 (Workshop videos)"
        },
        "linkedin": {
            "best_days": ["Tuesday", "Wednesday", "Thursday"],
            "best_hours": ["08:00", "09:00", "17:00", "18:00"],
            "peak_performance": "Wednesday 09:00 (Professional content)"
        },
        "facebook": {
            "best_days": ["Friday", "Saturday", "Sunday"],
            "best_hours": ["18:00", "19:00", "20:00"],
            "peak_performance": "Friday 20:00 (Community events)"
        }
    }

    if platform not in optimal_schedules:
        raise HTTPException(status_code=404, detail="Platform not found")

    return optimal_schedules[platform]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)