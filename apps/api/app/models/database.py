import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use SQLite for the prototype for zero-configuration demo setup
# Can be overridden by DATABASE_URL environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./synchrolink.db")

# Add check_same_thread=False for SQLite to work with FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
