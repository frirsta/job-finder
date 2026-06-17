from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import requests
import os
from typing import List, Optional
from datetime import datetime

# ==================== DATABASE SETUP ====================
DATABASE_URL = "sqlite:///./jobs.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== DATABASE MODELS ====================
class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    job_title = Column(String)
    skills = Column(String)  # comma-separated
    experience_level = Column(String)  # junior, mid, senior
    location = Column(String)
    cv_text = Column(Text, nullable=True)
    created_at = Column(String, default=datetime.now().isoformat())

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)
    title = Column(String, index=True)
    company = Column(String)
    description = Column(Text)
    location = Column(String)
    url = Column(String)
    remote_friendly = Column(Integer, default=0)
    fetched_at = Column(String, default=datetime.now().isoformat())

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    score = Column(Float)
    explanation = Column(Text)

Base.metadata.create_all(bind=engine)

# ==================== PYDANTIC MODELS ====================
class UserProfileCreate(BaseModel):
    name: str
    job_title: str
    skills: str  # "Python, JavaScript, React"
    experience_level: str  # "junior", "mid", "senior"
    location: str
    cv_text: Optional[str] = None

class UserProfileResponse(UserProfileCreate):
    id: int
    created_at: str
    
    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    url: str
    description: str
    remote_friendly: int

class MatchedJobResponse(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    url: str
    score: float
    explanation: str

# ==================== FASTAPI APP ====================
app = FastAPI(title="Job Matcher API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== MATCHING LOGIC ====================
def calculate_match_score(user_profile: UserProfile, job: Job) -> tuple[float, str]:
    """
    Calculate match score based on simple rules:
    +10 if skill appears in job title
    +5 if skill appears in job description
    +20 if location matches
    +15 if job is remote
    +10 if job title matches user job title
    """
    score = 0
    explanation_parts = []
    
    # Parse user skills
    user_skills = [s.strip().lower() for s in user_profile.skills.split(",")]
    job_title_lower = job.title.lower()
    job_desc_lower = job.description.lower()
    
    # Skill matching in title
    skills_in_title = [skill for skill in user_skills if skill in job_title_lower]
    if skills_in_title:
        score += len(skills_in_title) * 10
        explanation_parts.append(f"Skills match: {', '.join(skills_in_title)}")
    
    # Skill matching in description
    skills_in_desc = [skill for skill in user_skills if skill in job_desc_lower and skill not in skills_in_title]
    if skills_in_desc:
        score += len(skills_in_desc) * 5
    
    # Location matching
    if user_profile.location.lower() in job.location.lower() or job.location.lower() in user_profile.location.lower():
        score += 20
        explanation_parts.append("Location match")
    
    # Remote preference
    if job.remote_friendly == 1:
        score += 15
        explanation_parts.append("Remote opportunity")
    
    # Job title matching
    user_job_lower = user_profile.job_title.lower()
    if user_job_lower in job_title_lower or job_title_lower in user_job_lower:
        score += 10
        explanation_parts.append("Title match")
    
    # Cap score at 100
    score = min(score, 100)
    
    # Create explanation
    if not explanation_parts:
        explanation = "Relevant job opportunity"
    else:
        explanation = ". ".join(explanation_parts[:2])  # Max 2 parts
    
    return score, explanation

# ==================== API ENDPOINTS ====================

@app.post("/profile", response_model=UserProfileResponse)
def create_profile(profile: UserProfileCreate, db: Session = next(get_db())):
    """Create a new user profile"""
    db_profile = UserProfile(
        name=profile.name,
        job_title=profile.job_title,
        skills=profile.skills,
        experience_level=profile.experience_level,
        location=profile.location,
        cv_text=profile.cv_text
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.get("/profile/{profile_id}", response_model=UserProfileResponse)
def get_profile(profile_id: int, db: Session = next(get_db())):
    """Get a user profile by ID"""
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.get("/jobs/fetch")
def fetch_jobs(db: Session = next(get_db())):
    """
    Fetch jobs from Adzuna API
    Uses a simple, free Adzuna endpoint
    """
    try:
        # Using Adzuna API - free tier
        # For production, you'd need an API key from https://developer.adzuna.com
        # For MVP, we'll use a simplified approach with mock data + real API
        
        ADZUNA_API_ID = os.getenv("ADZUNA_API_ID", "demo")
        ADZUNA_API_KEY = os.getenv("ADZUNA_API_KEY", "demoapikey")
        
        # Try to fetch from Adzuna
        url = f"https://api.adzuna.com/v1/api/jobs/gb/search/1"
        params = {
            "app_id": ADZUNA_API_ID,
            "app_key": ADZUNA_API_KEY,
            "results_per_page": 20,
            "what": "python developer"
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                for result in data.get("results", []):
                    job_data = Job(
                        external_id=str(result.get("id", "")),
                        title=result.get("title", ""),
                        company=result.get("company", {}).get("display_name", "Unknown"),
                        description=result.get("description", "")[:1000],  # Truncate
                        location=result.get("location", {}).get("display_name", ""),
                        url=result.get("redirect_url", ""),
                        remote_friendly=1 if "remote" in result.get("description", "").lower() else 0
                    )
                    
                    # Check if job already exists
                    existing = db.query(Job).filter(Job.external_id == job_data.external_id).first()
                    if not existing:
                        db.add(job_data)
                
                db.commit()
                return {"status": "success", "message": f"Fetched {len(data.get('results', []))} jobs"}
        except requests.exceptions.RequestException:
            pass  # Fall through to mock data
        
        # If API fails or no key, use mock data
        mock_jobs = [
            {
                "title": "Senior Python Developer",
                "company": "TechCorp",
                "description": "We're looking for a Senior Python Developer with expertise in FastAPI, Django, and cloud deployment. You'll work on scalable backend systems.",
                "location": "Stockholm, Sweden",
                "url": "https://example.com/job1",
                "remote": True
            },
            {
                "title": "Frontend React Engineer",
                "company": "StartupXYZ",
                "description": "Join our team as a React Engineer. Experience with Next.js, TailwindCSS, and modern JavaScript required. Remote position available.",
                "location": "Remote",
                "url": "https://example.com/job2",
                "remote": True
            },
            {
                "title": "Full Stack Developer",
                "company": "WebSolutions",
                "description": "Full Stack role using React, Python, and PostgreSQL. Located in central Stockholm with hybrid flexibility.",
                "location": "Stockholm",
                "url": "https://example.com/job3",
                "remote": False
            },
            {
                "title": "JavaScript Developer",
                "company": "DigitalFirst",
                "description": "Looking for a talented JavaScript developer. Node.js, TypeScript, and React skills essential. Can work remotely.",
                "location": "Gothenburg, Sweden",
                "url": "https://example.com/job4",
                "remote": True
            },
            {
                "title": "Data Scientist",
                "company": "AI Labs",
                "description": "Python specialist needed for data analysis and machine learning. Experience with pandas, numpy, and scikit-learn required.",
                "location": "Stockholm",
                "url": "https://example.com/job5",
                "remote": False
            }
        ]
        
        for job_data in mock_jobs:
            external_id = f"mock_{job_data['title'].replace(' ', '_')}"
            existing = db.query(Job).filter(Job.external_id == external_id).first()
            if not existing:
                db.add(Job(
                    external_id=external_id,
                    title=job_data["title"],
                    company=job_data["company"],
                    description=job_data["description"],
                    location=job_data["location"],
                    url=job_data["url"],
                    remote_friendly=1 if job_data["remote"] else 0
                ))
        
        db.commit()
        return {"status": "success", "message": "Using sample job data"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match/{user_id}", response_model=List[MatchedJobResponse])
def match_jobs(user_id: int, db: Session = next(get_db())):
    """
    Match user profile against all jobs and return ranked results
    """
    # Get user profile
    user_profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    # Fetch jobs if database is empty
    jobs = db.query(Job).all()
    if not jobs:
        # Trigger fetch
        fetch_jobs(db)
        jobs = db.query(Job).all()
    
    if not jobs:
        return []
    
    # Calculate matches
    matched_jobs = []
    for job in jobs:
        score, explanation = calculate_match_score(user_profile, job)
        
        # Save match result
        match_result = MatchResult(
            user_id=user_id,
            job_id=job.id,
            score=score,
            explanation=explanation
        )
        db.add(match_result)
        
        matched_jobs.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "url": job.url,
            "score": score,
            "explanation": explanation
        })
    
    db.commit()
    
    # Sort by score descending
    matched_jobs.sort(key=lambda x: x["score"], reverse=True)
    
    return matched_jobs

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
