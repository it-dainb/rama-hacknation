#!/usr/bin/env python3
"""
Resume Import Script for CV Analysis System
This script imports resumes from a JSON file into the Milvus vector database
"""

import json
import logging
import os
import sys
from typing import List, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass

# Add the current directory to Python path to import from chatbot.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import List, Optional
from enum import Enum
from pydantic import BaseModel
import json

# Step 1: Enum definitions
class TitleEnum(str, Enum):
    AIEngineer = "AI Engineer"
    AIResearcher = "AI Researcher"
    DataScientist = "Data Scientist"
    DataEngineer = "Data Engineer"

class WorkTypeEnum(str, Enum):
    Remote = "Remote"
    OnSite = "On-site"
    Hybrid = "Hybrid"

# Step 2: schema definitions
class Address(BaseModel):
    region: str
    detail: str

class Contact(BaseModel):
    address: Address
    phone: str
    email: str
    linkedin: str
    github: str

class DateRange(BaseModel):
    start: int
    end: Optional[int]

class ExperienceItem(BaseModel):
    name: str
    date: DateRange
    bullets: List[str]

class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]
    year: int

class EducationItem(BaseModel):
    name: str
    date: DateRange
    degree: str

class Certification(BaseModel):
    name: str
    date: int

class Resume(BaseModel):
    name: str
    title: TitleEnum
    work_type: WorkTypeEnum
    prefer_culture: str
    contact: Contact
    summary: str
    experience: List[ExperienceItem]
    projects: List[Project]
    education: List[EducationItem]
    skills: List[str]
    achievements: List[str]
    certifications: List[Certification]

from BE.main import (
    get_embedding, milvus_client, COLLECTION_NAME, DIM,
    initialize_milvus_collection, logger
)

@dataclass
class ImportStats:
    """Track import statistics"""
    total_resumes: int = 0
    successful_imports: int = 0
    failed_imports: int = 0
    errors: List[str] = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []

class ResumeImporter:
    """Handles importing resumes from JSON file to Milvus database"""
    
    def __init__(self, json_file_path: str):
        self.json_file_path = Path(json_file_path)
        self.stats = ImportStats()
        
        # Ensure Milvus collection exists
        try:
            initialize_milvus_collection()
            logger.info("Milvus collection initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Milvus collection: {e}")
            raise
    
    def load_resumes_from_json(self) -> List[Dict[str, Any]]:
        """Load resumes from JSON file"""
        try:
            if not self.json_file_path.exists():
                raise FileNotFoundError(f"JSON file not found: {self.json_file_path}")
            
            with open(self.json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle both single resume and list of resumes
            if isinstance(data, list):
                resumes_data = data
            elif isinstance(data, dict):
                # If it's a single resume object
                resumes_data = [data]
            else:
                raise ValueError("JSON file must contain a resume object or list of resumes")
            
            logger.info(f"Loaded {len(resumes_data)} resume(s) from {self.json_file_path}")
            return resumes_data
            
        except Exception as e:
            logger.error(f"Failed to load JSON file: {e}")
            raise
    
    def validate_and_parse_resume(self, resume_data: Dict[str, Any]) -> Optional[Resume]:
        """Validate and parse a single resume using Pydantic"""
        try:
            # Create Resume object using Pydantic validation
            resume = Resume(**resume_data)
            return resume
        except Exception as e:
            error_msg = f"Resume validation failed for {resume_data.get('name', 'Unknown')}: {e}"
            logger.error(error_msg)
            self.stats.errors.append(error_msg)
            return None
    
    def resume_to_text_aspects(self, resume: Resume) -> tuple[str, List[str]]:
        """Convert resume to full text and individual aspects for vector storage"""
        try:
            # Generate individual aspects
            aspects = []
            
            # Basic information
            aspects.append(f"Name: {resume.name}")
            aspects.append(f"Title: {resume.title.value}")
            aspects.append(f"Work Type: {resume.work_type.value}")
            aspects.append(f"Preferred Culture: {resume.prefer_culture}")
            
            # Contact information
            aspects.append(f"Location: {resume.contact.address.region}, {resume.contact.address.detail}")
            aspects.append(f"Email: {resume.contact.email}")
            aspects.append(f"Phone: {resume.contact.phone}")
            if resume.contact.linkedin:
                aspects.append(f"LinkedIn: {resume.contact.linkedin}")
            if resume.contact.github:
                aspects.append(f"GitHub: {resume.contact.github}")
            
            # Summary
            aspects.append(f"Summary: {resume.summary}")
            
            # Experience
            for exp in resume.experience:
                end_year = exp.date.end if exp.date.end else "Present"
                aspects.append(f"Experience: {exp.name} ({exp.date.start}-{end_year})")
                for bullet in exp.bullets:
                    aspects.append(f"Experience Detail: {bullet}")
            
            # Projects
            for project in resume.projects:
                aspects.append(f"Project: {project.name} ({project.year})")
                aspects.append(f"Project Description: {project.description}")
                for tech in project.technologies:
                    aspects.append(f"Project Technology: {tech}")
            
            # Education
            for edu in resume.education:
                end_year = edu.date.end if edu.date.end else "Present"
                aspects.append(f"Education: {edu.name} - {edu.degree} ({edu.date.start}-{end_year})")
            
            # Skills
            for skill in resume.skills:
                aspects.append(f"Skill: {skill}")
            
            # Achievements
            for achievement in resume.achievements:
                aspects.append(f"Achievement: {achievement}")
            
            # Certifications
            for cert in resume.certifications:
                aspects.append(f"Certification: {cert.name} ({cert.date})")
            
            # Generate full text
            full_text = " | ".join(aspects)
            
            return full_text, aspects
            
        except Exception as e:
            logger.error(f"Failed to convert resume to text aspects: {e}")
            raise
    
    def insert_resume_to_milvus(self, resume: Resume) -> bool:
        """Insert a single resume into Milvus database"""
        try:
            # Convert resume to text and aspects
            full_text, aspects = self.resume_to_text_aspects(resume)
            
            # Generate embeddings
            logger.info(f"Generating embeddings for {resume.name}...")
            full_vector = get_embedding(full_text)
            aspect_vectors = []
            
            # Generate embeddings for each aspect (with batch processing for efficiency)
            batch_size = 10
            for i in range(0, len(aspects), batch_size):
                batch_aspects = aspects[i:i + batch_size]
                for aspect in batch_aspects:
                    try:
                        aspect_vector = get_embedding(aspect)
                        aspect_vectors.append(aspect_vector)
                    except Exception as e:
                        logger.warning(f"Failed to generate embedding for aspect '{aspect}': {e}")
                        # Use zero vector as fallback
                        aspect_vectors.append([0.0] * DIM)
            
            # Prepare data for Milvus insertion
            data_to_insert = [{
                "full_text": full_text,
                "full_vector": full_vector,
                "aspects": aspects,
                "aspect_vectors": aspect_vectors
            }]
            
            # Insert into Milvus
            logger.info(f"Inserting {resume.name} into Milvus collection...")
            milvus_client.insert(
                collection_name=COLLECTION_NAME,
                data=data_to_insert
            )
            
            logger.info(f"Successfully inserted {resume.name} with {len(aspects)} aspects")
            return True
            
        except Exception as e:
            error_msg = f"Failed to insert {resume.name} into Milvus: {e}"
            logger.error(error_msg)
            self.stats.errors.append(error_msg)
            return False
    
    def import_all_resumes(self) -> ImportStats:
        """Main method to import all resumes from JSON file"""
        try:
            # Load resumes from JSON
            resumes_data = self.load_resumes_from_json()
            self.stats.total_resumes = len(resumes_data)
            
            logger.info(f"Starting import of {self.stats.total_resumes} resume(s)...")
            
            for i, resume_data in enumerate(resumes_data, 1):
                try:
                    logger.info(f"Processing resume {i}/{self.stats.total_resumes}...")
                    
                    # Validate and parse resume
                    resume = self.validate_and_parse_resume(resume_data)
                    if not resume:
                        self.stats.failed_imports += 1
                        continue
                    
                    # Insert into Milvus
                    success = self.insert_resume_to_milvus(resume)
                    if success:
                        self.stats.successful_imports += 1
                        logger.info(f"✓ Successfully imported {resume.name}")
                    else:
                        self.stats.failed_imports += 1
                        logger.error(f"✗ Failed to import {resume.name}")
                
                except Exception as e:
                    error_msg = f"Unexpected error processing resume {i}: {e}"
                    logger.error(error_msg)
                    self.stats.errors.append(error_msg)
                    self.stats.failed_imports += 1
            
            # Print final statistics
            self.print_import_summary()
            return self.stats
            
        except Exception as e:
            logger.error(f"Import process failed: {e}")
            raise
    
    def print_import_summary(self):
        """Print import statistics summary"""
        print("\n" + "="*60)
        print("RESUME IMPORT SUMMARY")
        print("="*60)
        print(f"Total Resumes:      {self.stats.total_resumes}")
        print(f"Successful Imports: {self.stats.successful_imports}")
        print(f"Failed Imports:     {self.stats.failed_imports}")
        print(f"Success Rate:       {(self.stats.successful_imports/self.stats.total_resumes)*100:.1f}%")
        
        if self.stats.errors:
            print(f"\nErrors ({len(self.stats.errors)}):")
            for i, error in enumerate(self.stats.errors[:10], 1):  # Show first 10 errors
                print(f"  {i}. {error}")
            if len(self.stats.errors) > 10:
                print(f"  ... and {len(self.stats.errors) - 10} more errors")
        
        print("="*60)

def main():
    """Main function to run the import process"""
    import argparse
    
    # Set up command line arguments
    parser = argparse.ArgumentParser(description="Import resumes from JSON file to Milvus database")
    parser.add_argument("json_file", help="Path to the resumes.json file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Configure logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Create importer and run import
        importer = ResumeImporter(args.json_file)
        stats = importer.import_all_resumes()
        
        # Exit with appropriate code
        if stats.failed_imports == 0:
            print("✓ All resumes imported successfully!")
            sys.exit(0)
        elif stats.successful_imports > 0:
            print("⚠ Some resumes imported successfully, some failed.")
            sys.exit(1)
        else:
            print("✗ No resumes were imported successfully.")
            sys.exit(2)
            
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(3)
    except Exception as e:
        print(f"Unexpected error: {e}")
        logger.exception("Full error details:")
        sys.exit(4)

if __name__ == "__main__":
    main()