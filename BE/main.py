# Standard library imports
import json
import logging
import os
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

# Third-party imports
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain.schema import Document
from langchain_openai import ChatOpenAI
from openai import OpenAI
from pydantic import BaseModel
from pymilvus import MilvusClient
import dspy

load_dotenv()  # Load environment variables from .env

# Configure logging for debugging and monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="CV Analysis API", version="1.0.0")

# Configuration constants for easy deployment adjustments
MILVUS_DB = "./milvus_resumes.db"
COLLECTION_NAME = "candidates_dynamic"
DIM = 3072  # text-embedding-3-large dimension
OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"
OPENAI_CHAT_MODEL = "gpt-4"  # Fixed model name
SQLITE_DB_PATH = "cv_analysis.db"

# Initialize external service clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
milvus_client = MilvusClient(MILVUS_DB)

# --- Pydantic Models for Request/Response Validation ---

class Job(BaseModel):
    """Response model for job listings with validation"""
    job_id: UUID
    title: str
    post_time: datetime
    desc: str

class CandidateCategory(str, Enum):
    """Enumeration for candidate matching categories"""
    GREAT_MATCH = "great match"
    GOOD_MATCH = "good match"
    FAIR_MATCH = "fair match"
    POOR_MATCH = "poor match"

class Metric(BaseModel):
    """Enhanced response model for comprehensive metrics"""
    metric_id: UUID
    job_id: UUID

class Candidate(BaseModel):
    """Response model for candidate information with categorization"""
    name: str
    title: str
    metric: Metric

class ChatRequest(BaseModel):
    """Request model for chat functionality"""
    query: str
    job_id: UUID

class ChatResponse(BaseModel):
    """Enhanced response model for chat functionality"""
    analysis: str
    recommendations: str
    key_insights: str
    aspect_weights: Dict[str, float]
    reasoning: str
    top_candidates: List[Dict[str, Any]]
    query_processed: str
    job_title: str

# --- DSPy Configuration and Models ---

class AspectWeightsSignature(dspy.Signature):
    """
    Analyze job description and user query to determine optimal aspect weights for candidate matching.
    Focus on the most relevant skills, experience, and qualifications mentioned.
    """
    job_description: str = dspy.InputField(desc="The job description text")
    user_query: str = dspy.InputField(desc="User's specific question or requirements")
    common_aspects: list[str] = dspy.InputField(desc="List of aspects found across all candidates")
    
    aspect_weights: dict[str, float] = dspy.OutputField(desc="Weights with aspect names as keys and weights (0.0-1.0) as values, must sum to 1.0")
    reasoning: str = dspy.OutputField(desc="Brief explanation of why these weights were chosen")

class CVAnalysisSignature(dspy.Signature):
    """
    Provide comprehensive CV analysis and recommendations based on user query and candidate data.
    Focus on practical insights and actionable recommendations.
    """
    user_query: str = dspy.InputField(desc="User's question about the candidates")
    job_description: str = dspy.InputField(desc="The job description")
    top_candidates: str = dspy.InputField(desc="Top 10 re-weighted candidates with their scores and details")
    aspect_weights: dict[str, float] = dspy.InputField(desc="The aspect weights used for re-ranking")
    
    analysis: str = dspy.OutputField(desc="Detailed analysis answering the user's query")
    recommendations: str = dspy.OutputField(desc="Specific recommendations for candidate selection or hiring process")
    key_insights: str = dspy.OutputField(desc="3-5 key insights about the candidate pool")

@dataclass
class ChatAnalysisResult:
    """Structured result from chat analysis"""
    analysis: str
    recommendations: str
    key_insights: str
    aspect_weights: Dict[str, float]
    top_candidates: List[Dict]
    reasoning: str

# --- DSPy Modules ---

class AspectWeightsGenerator(dspy.Module):
    """Generate optimal aspect weights based on job description and user query"""
    
    def __init__(self):
        super().__init__()
        self.generate_weights = dspy.ChainOfThought(AspectWeightsSignature)
    
    def forward(self, job_description: str, user_query: str, common_aspects: List[str]) -> Dict[str, Any]:
        aspects_str = ", ".join(common_aspects)
        
        try:
            result = self.generate_weights(
                job_description=job_description,
                user_query=user_query,
                common_aspects=aspects_str
            )
            
            # Parse the JSON weights
            try:
                import json
                weights = json.loads(result.aspect_weights)
                
                # Normalize weights to sum to 1.0
                total_weight = sum(weights.values())
                if total_weight > 0:
                    weights = {k: v/total_weight for k, v in weights.items()}
                
                return {
                    "weights": weights,
                    "reasoning": result.reasoning
                }
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to parse aspect weights JSON: {e}")
                # Fallback: equal weights for all common aspects
                equal_weight = 1.0 / len(common_aspects) if common_aspects else 0.0
                weights = {aspect: equal_weight for aspect in common_aspects}
                return {
                    "weights": weights,
                    "reasoning": "Used equal weights due to parsing error."
                }
                
        except Exception as e:
            logger.error(f"Error generating aspect weights: {e}")
            # Fallback to equal weights
            equal_weight = 1.0 / len(common_aspects) if common_aspects else 0.0
            weights = {aspect: equal_weight for aspect in common_aspects}
            return {
                "weights": weights,
                "reasoning": "Used equal weights due to generation error."
            }

class CVAnalyzer(dspy.Module):
    """Analyze CVs and provide comprehensive insights"""
    
    def __init__(self):
        super().__init__()
        self.analyze = dspy.ChainOfThought(CVAnalysisSignature)
    
    def forward(self, user_query: str, job_description: str, top_candidates: List[Dict], 
                aspect_weights: Dict[str, float]) -> Dict[str, str]:
        try:
            # Format candidates for analysis
            candidates_text = self._format_candidates(top_candidates)
            weights_text = json.dumps(aspect_weights, indent=2)
            
            result = self.analyze(
                user_query=user_query,
                job_description=job_description,
                top_candidates=candidates_text,
                aspect_weights=weights_text
            )
            
            return {
                "analysis": result.analysis,
                "recommendations": result.recommendations,
                "key_insights": result.key_insights
            }
        except Exception as e:
            logger.error(f"Error in CV analysis: {e}")
            return {
                "analysis": "Unable to perform detailed analysis due to processing error.",
                "recommendations": "Please review candidates manually.",
                "key_insights": "Analysis temporarily unavailable."
            }
    
    def _format_candidates(self, candidates: List[Dict]) -> str:
        """Format candidate data for LLM analysis"""
        formatted = []
        for i, candidate in enumerate(candidates, 1):
            formatted.append(
                f"Candidate {i}: {candidate.get('name', 'Unknown')}\n"
                f"Title: {candidate.get('title', 'Unknown')}\n"
                f"Weighted Score: {candidate.get('weighted_score', 0.0):.3f}\n"
                f"Top Aspects: {', '.join(list(candidate.get('aspect_scores', {}).keys())[:5])}\n"
                f"Summary: {candidate.get('full_text', '')[:200]}...\n"
            )
        return "\n".join(formatted)

# --- Enhanced Candidate Re-weighting Functions ---

def calculate_weighted_score(candidate: Dict, aspect_weights: Dict[str, float]) -> float:
    """
    Calculate weighted score for a candidate based on aspect weights
    """
    try:
        aspect_scores = candidate.get("aspect_scores", {})
        weighted_score = 0.0
        total_weight = 0.0
        
        for aspect, weight in aspect_weights.items():
            if aspect in aspect_scores:
                score = aspect_scores[aspect]
                weighted_score += score * weight
                total_weight += weight
        
        # Normalize by actual weights used (in case some aspects are missing)
        if total_weight > 0:
            weighted_score /= total_weight
        
        return float(weighted_score)
    except Exception as e:
        logger.error(f"Error calculating weighted score: {e}")
        return 0.0

def reweight_candidates(candidates: List[Dict], aspect_weights: Dict[str, float]) -> List[Dict]:
    """
    Re-weight and re-rank candidates based on new aspect weights
    """
    try:
        # Calculate new weighted scores
        for candidate in candidates:
            candidate["weighted_score"] = calculate_weighted_score(candidate, aspect_weights)
        
        # Sort by weighted score (descending)
        candidates_sorted = sorted(candidates, key=lambda x: x.get("weighted_score", 0.0), reverse=True)
        
        # Add ranking information
        for i, candidate in enumerate(candidates_sorted, 1):
            candidate["new_rank"] = i
        
        return candidates_sorted
        
    except Exception as e:
        logger.error(f"Error re-weighting candidates: {e}")
        return candidates

# --- Vector Operations and Embedding Functions ---

def get_embedding(text: str) -> List[float]:
    """Generate embedding vector for text using OpenAI API"""
    try:
        response = openai_client.embeddings.create(
            input=text,
            model=OPENAI_EMBEDDING_MODEL
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

def flatten_for_aspects(value: Any) -> List[str]:
    """Recursively extract string aspects from nested data structures"""
    results = []
    
    def _extract_strings(val):
        """Inner function to recursively extract strings"""
        if val is None:
            return
        elif isinstance(val, Enum):
            results.append(val.value)
        elif isinstance(val, BaseModel):
            for field_val in val.__dict__.values():
                _extract_strings(field_val)
        elif isinstance(val, dict):
            for v in val.values():
                _extract_strings(v)
        elif isinstance(val, list):
            for item in val:
                _extract_strings(item)
        elif isinstance(val, (str, int, float)):
            results.append(str(val))
    
    _extract_strings(value)
    return results

# --- Milvus Vector Database Operations ---

def initialize_milvus_collection():
    """Initialize Milvus collection with proper error handling"""
    try:
        if COLLECTION_NAME not in milvus_client.list_collections():
            # Import required classes
            from pymilvus import DataType, CollectionSchema, FieldSchema
            
            # Define fields properly
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="full_text", dtype=DataType.VARCHAR, max_length=8192),
                FieldSchema(name="full_vector", dtype=DataType.FLOAT_VECTOR, dim=DIM),
                FieldSchema(name="aspects", dtype=DataType.ARRAY, element_type=DataType.VARCHAR, max_capacity=256, max_length=512),
                FieldSchema(name="aspect_vectors", dtype=DataType.ARRAY, element_type=DataType.FLOAT_VECTOR, max_capacity=256, dim=DIM)
            ]
            
            # Create schema
            schema = CollectionSchema(fields, description="CV candidates collection")
            
            # Create collection
            milvus_client.create_collection(
                collection_name=COLLECTION_NAME,
                schema=schema
            )
            
            # Create index for vector field
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "COSINE",
                "params": {"nlist": 128}
            }
            
            milvus_client.create_index(
                collection_name=COLLECTION_NAME,
                field_name="full_vector",
                index_params=index_params
            )
            
            logger.info(f"Created Milvus collection: {COLLECTION_NAME}")
        else:
            logger.info(f"Milvus collection {COLLECTION_NAME} already exists")
            
        # Load collection
        milvus_client.load_collection(COLLECTION_NAME)
        
    except Exception as e:
        logger.error(f"Milvus collection initialization failed: {e}")
        raise HTTPException(status_code=500, detail="Vector database initialization failed")

def search_full_text(jd_vec: List[float], top_k: int = 100) -> List[Dict]:
    """Perform vector similarity search in Milvus collection"""
    try:
        results = milvus_client.search(
            collection_name=COLLECTION_NAME,
            data=[jd_vec],
            anns_field="full_vector",
            limit=top_k,
            output_fields=["full_text", "aspects", "aspect_vectors"]
        )
        return results[0] if results else []
    except Exception as e:
        logger.error(f"Vector search operation failed: {e}")
        raise HTTPException(status_code=500, detail="Search operation failed")

def score_per_aspect(jd_vec: List[float], candidate: Dict) -> Dict[str, float]:
    """Calculate cosine similarity scores for each candidate aspect"""
    scores = {}
    try:
        aspects = candidate.get("entity", {}).get("aspects", [])
        aspect_vecs = candidate.get("entity", {}).get("aspect_vectors", [])
        
        if not aspects or not aspect_vecs:
            return scores
        
        jd_vec_norm = np.linalg.norm(jd_vec)
        
        for cand_aspect, cand_vec in zip(aspects, aspect_vecs):
            if cand_vec and len(cand_vec) > 0:
                cand_vec_norm = np.linalg.norm(cand_vec)
                
                # Calculate cosine similarity
                if jd_vec_norm > 0 and cand_vec_norm > 0:
                    similarity = np.dot(jd_vec, cand_vec) / (jd_vec_norm * cand_vec_norm)
                    scores[cand_aspect] = float(similarity)
                else:
                    scores[cand_aspect] = 0.0
                    
        return scores
    except Exception as e:
        logger.error(f"Aspect scoring calculation failed: {e}")
        return {}

def insert_candidate(resume: BaseModel):
    """Insert candidate resume into vector database"""
    try:
        aspects = flatten_for_aspects(resume)
        full_text = " ".join(aspects)
        full_vec = get_embedding(full_text)
        aspect_vecs = [get_embedding(aspect) for aspect in aspects]
        
        milvus_client.insert(
            collection_name=COLLECTION_NAME,
            data=[{
                "full_text": full_text,
                "full_vector": full_vec,
                "aspects": aspects,
                "aspect_vectors": aspect_vecs
            }]
        )
        logger.info("Successfully inserted candidate resume")
    except Exception as e:
        logger.error(f"Candidate insertion failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to insert candidate")

# --- Database Management Classes ---

class DatabaseManager:
    """Centralized database connection and transaction management""" 
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._initialize_database()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections with automatic cleanup"""
        connection = None
        try:
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = sqlite3.Row  # Enable dict-like access
            yield connection
        except sqlite3.Error as e:
            if connection:
                connection.rollback()
            logger.error(f"Database error: {e}")
            raise HTTPException(status_code=500, detail="Database operation failed")
        finally:
            if connection:
                connection.close()
    
    def _initialize_database(self):
        """Create database tables if they don't exist"""
        try:
            with self.get_connection() as conn:
                self._create_jobs_table(conn)
                self._create_candidates_table(conn)
                self._create_job_candidates_table(conn)
                self._create_common_aspects_table(conn)
                self._insert_sample_data(conn)
                conn.commit()
                logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def _create_jobs_table(self, conn):
        """Create jobs table with appropriate indexes"""
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                post_time TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_jobs_post_time ON jobs(post_time)")
    
    def _create_candidates_table(self, conn):
        """Create candidates table with JSON storage for scores"""
        conn.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                candidate_id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL,
                name TEXT,
                title TEXT,
                scores TEXT NOT NULL,
                full_text TEXT,
                overall_similarity REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(job_id)
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id)")
    
    def _create_job_candidates_table(self, conn):
        """Create relationship table between jobs and candidates"""
        conn.execute("""
            CREATE TABLE IF NOT EXISTS job_candidates (
                job_id TEXT,
                candidate_id TEXT,
                rank INTEGER,
                PRIMARY KEY (job_id, candidate_id),
                FOREIGN KEY (job_id) REFERENCES jobs(job_id),
                FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
            )
        """)

    def _create_common_aspects_table(self, conn):
        """Create common_aspects table to store aspects that exist across all candidates"""
        conn.execute("""
            CREATE TABLE IF NOT EXISTS common_aspects (
                job_id TEXT PRIMARY KEY,
                common_aspects TEXT NOT NULL,
                total_candidates INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(job_id)
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_common_aspects_job_id ON common_aspects(job_id)")

    
    def _insert_sample_data(self, conn):
        """Insert sample data for testing and demonstration"""
        # Check if sample data already exists
        existing_jobs = conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0]
        if existing_jobs > 0:
            return
        
        # Insert sample jobs
        sample_jobs = [
            {
                'job_id': str(uuid4()),
                'title': 'Senior Python Developer',
                'post_time': datetime.now().isoformat(),
                'description': 'Looking for experienced Python developer with FastAPI knowledge'
            },
            {
                'job_id': str(uuid4()),
                'title': 'Data Scientist',
                'post_time': datetime.now().isoformat(),
                'description': 'Seeking data scientist with ML and AI expertise'
            }
        ]
        
        for job in sample_jobs:
            conn.execute("""
                INSERT INTO jobs (job_id, title, post_time, description)
                VALUES (?, ?, ?, ?)
            """, (job['job_id'], job['title'], job['post_time'], job['description']))

class JobRepository:
    """Data access layer for job-related operations"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def get_all_jobs(self) -> List[Job]:
        """Retrieve all jobs from database"""
        try:
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT job_id, title, post_time, description 
                    FROM jobs 
                    ORDER BY post_time DESC
                """)
                
                jobs = []
                for row in cursor.fetchall():
                    jobs.append(Job(
                        job_id=UUID(row['job_id']),
                        title=row['title'],
                        post_time=datetime.fromisoformat(row['post_time']),
                        desc=row['description']
                    ))
                
                logger.info(f"Retrieved {len(jobs)} jobs from database")
                return jobs
        except Exception as e:
            logger.error(f"Failed to retrieve jobs: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve jobs")
    
    def get_job_by_id(self, job_id: UUID) -> Optional[Job]:
        """Retrieve specific job by ID"""
        try:
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT job_id, title, post_time, description 
                    FROM jobs 
                    WHERE job_id = ?
                """, (str(job_id),))
                
                row = cursor.fetchone()
                if row:
                    return Job(
                        job_id=UUID(row['job_id']),
                        title=row['title'],
                        post_time=datetime.fromisoformat(row['post_time']),
                        desc=row['description']
                    )
                return None
        except Exception as e:
            logger.error(f"Failed to retrieve job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve job")

class CommonAspectsRepository:
    """Data access layer for common aspects operations"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def calculate_and_store_common_aspects(self, job_id: UUID, candidates: List[Dict]) -> List[str]:
        """Calculate common aspects across all candidates and store them"""
        try:
            if not candidates:
                return []
            
            # Get all aspect names from first candidate
            common_aspects = set()
            if candidates:
                common_aspects = set(candidates[0]["aspect_scores"].keys())
            
            # Find intersection with all other candidates
            for candidate in candidates[1:]:
                candidate_aspects = set(candidate["aspect_scores"].keys())
                common_aspects = common_aspects.intersection(candidate_aspects)
            
            common_aspects_list = list(common_aspects)
            
            # Store in database
            with self.db_manager.get_connection() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO common_aspects 
                    (job_id, common_aspects, total_candidates, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    str(job_id), 
                    json.dumps(common_aspects_list),
                    len(candidates)
                ))
                conn.commit()
            
            logger.info(f"Stored {len(common_aspects_list)} common aspects for job {job_id}")
            return common_aspects_list
            
        except Exception as e:
            logger.error(f"Failed to calculate common aspects for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to calculate common aspects")
    
    def get_common_aspects_by_job_id(self, job_id: UUID) -> Dict[str, Any]:
        """Retrieve common aspects for a specific job"""
        try:
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT common_aspects, total_candidates, created_at, updated_at
                    FROM common_aspects 
                    WHERE job_id = ?
                """, (str(job_id),))
                
                row = cursor.fetchone()
                if row:
                    try:
                        aspects_list = json.loads(row['common_aspects'])
                    except (json.JSONDecodeError, TypeError):
                        aspects_list = []
                    
                    return {
                        "job_id": str(job_id),
                        "common_aspects": aspects_list,
                        "total_candidates": row['total_candidates'],
                        "created_at": row['created_at'],
                        "updated_at": row['updated_at'],
                        "count": len(aspects_list)
                    }
                
                return {
                    "job_id": str(job_id),
                    "common_aspects": [],
                    "total_candidates": 0,
                    "count": 0,
                    "message": "No common aspects found for this job"
                }
                
        except Exception as e:
            logger.error(f"Failed to retrieve common aspects for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve common aspects")
    
    def delete_common_aspects_by_job_id(self, job_id: UUID) -> bool:
        """Delete common aspects for a specific job"""
        try:
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    DELETE FROM common_aspects WHERE job_id = ?
                """, (str(job_id),))
                conn.commit()
                logger.info(f"Deleted common aspects for job {job_id}")
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to delete common aspects for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete common aspects")

class CandidateRepository:
    """Data access layer for candidate-related operations"""
    
    def __init__(self, db_manager: DatabaseManager, job_repository: JobRepository, common_aspects_repo: CommonAspectsRepository):
        self.db_manager = db_manager
        self.job_repository = job_repository
        self.common_aspects_repo = common_aspects_repo

    def get_candidates_by_job_id(self, job_id: UUID) -> Dict[str, Any]:
        """Retrieve candidates with individual scores for a specific job"""
        try:
            # First, get the job
            job = self.job_repository.get_job_by_id(job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            # Check if candidates already exist in database
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT candidate_id, name, title, scores, full_text, overall_similarity
                    FROM candidates 
                    WHERE job_id = ?
                    ORDER BY overall_similarity DESC
                """, (str(job_id),))
                
                existing_candidates = cursor.fetchall()
            
            # If candidates exist, return them
            if existing_candidates:
                candidates = []
                all_aspect_names = set()
                
                for row in existing_candidates:
                    try:
                        aspect_scores = json.loads(row['scores'])
                    except (json.JSONDecodeError, TypeError):
                        aspect_scores = {}
                    
                    all_aspect_names.update(aspect_scores.keys())
                    
                    candidates.append({
                        "candidate_id": row['candidate_id'],
                        "name": row['name'] or "Unknown",
                        "title": row['title'] or "Unknown Position",
                        "overall_similarity": float(row['overall_similarity'] or 0.0),
                        "aspect_scores": aspect_scores,
                        "full_text": row['full_text'] or ""
                    })
                
                common_aspects = self.common_aspects_repo.get_common_aspects_by_job_id(job_id)
                
                return {
                    "job_id": str(job_id),
                    "job_title": job.title,
                    "individual_candidates": candidates,
                    "common_aspects": common_aspects,
                }
            
            # If no candidates exist, generate them using embeddings
            return self._generate_and_store_candidates(job_id, job)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to retrieve candidates for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve candidates")
    
    def _generate_and_store_candidates(self, job_id: UUID, job: Job) -> Dict[str, Any]:
        """Generate candidates using embeddings and store in database"""
        try:
            # Get job description embedding
            jd_vec = get_embedding(job.desc)
            
            # Search for top candidates
            search_results = search_full_text(jd_vec, top_k=100)
            
            candidates = []
            
            if search_results:
                with self.db_manager.get_connection() as conn:
                    for idx, candidate_data in enumerate(search_results):
                        try:
                            # Extract candidate information with safe defaults
                            candidate_text = candidate_data.get("entity", {}).get("full_text", "")
                            candidate_aspects = candidate_data.get("entity", {}).get("aspects", [])
                            
                            # Calculate individual scores for this candidate
                            candidate_scores = score_per_aspect(jd_vec, candidate_data)
                            
                            # Extract candidate name and title with better parsing
                            candidate_name = f"Candidate_{idx + 1}"
                            candidate_title = "Unknown Position"
                            
                            # Try to extract name and title from aspects
                            for aspect in candidate_aspects:
                                aspect_lower = str(aspect).lower()
                                if "name:" in aspect_lower:
                                    name_part = aspect.split(":", 1)[1].strip()
                                    if name_part:
                                        candidate_name = name_part
                                elif any(keyword in aspect_lower for keyword in ["title:", "position:", "role:"]):
                                    title_part = aspect.split(":", 1)[1].strip()
                                    if title_part:
                                        candidate_title = title_part
                            
                            # Create candidate entry
                            candidate_id = str(uuid4())
                            overall_similarity = float(candidate_data.get("distance", 0.0))
                            
                            # Truncate full text if too long
                            if len(candidate_text) > 500:
                                full_text = candidate_text[:500] + "..."
                            else:
                                full_text = candidate_text
                            
                            # Store in database
                            conn.execute("""
                                INSERT INTO candidates 
                                (candidate_id, job_id, name, title, scores, full_text, overall_similarity)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            """, (
                                candidate_id, str(job_id), candidate_name, candidate_title,
                                json.dumps(candidate_scores), full_text, overall_similarity
                            ))
                            
                            # Add to response list
                            candidates.append({
                                "candidate_id": candidate_id,
                                "name": candidate_name,
                                "title": candidate_title,
                                "overall_similarity": overall_similarity,
                                "aspect_scores": candidate_scores,
                                "full_text": full_text
                            })
                        except Exception as candidate_error:
                            logger.error(f"Failed to process candidate {idx}: {candidate_error}")
                            continue
                    
                    conn.commit()
            
            # Calculate aggregate statistics
            if candidates:
                common_aspects = self.common_aspects_repo.calculate_and_store_common_aspects(job_id, candidates)
            
            return {
                "job_id": str(job_id),
                "job_title": job.title,
                "individual_candidates": candidates,
                "common_aspects": common_aspects,
            }
            
        except Exception as e:
            logger.error(f"Failed to generate candidates for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate candidates")
    
    def delete_candidates_by_job_id(self, job_id: UUID) -> bool:
        """Delete all candidates for a specific job"""
        try:
            self.common_aspects_repo.delete_common_aspects_by_job_id(job_id)
            
            with self.db_manager.get_connection() as conn:
                cursor = conn.execute("""
                    DELETE FROM candidates WHERE job_id = ?
                """, (str(job_id),))
                conn.commit()
                logger.info(f"Deleted candidates for job {job_id}")
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to delete candidates for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete candidates")

class ChatService:
    """Service class for handling chat-based CV analysis"""
    
    def __init__(self, candidate_repository: CandidateRepository, 
                common_aspects_repo: CommonAspectsRepository,
                job_repository: JobRepository):
        self.candidate_repository = candidate_repository
        self.common_aspects_repo = common_aspects_repo
        self.job_repository = job_repository
        
        # Initialize DSPy components
        try:
            # Configure DSPy with LangChain OpenAI (updated syntax)
            import dspy
            from langchain_openai import ChatOpenAI
            
            # Use LangChain's ChatOpenAI as the language model for DSPy
            llm = ChatOpenAI(model=OPENAI_CHAT_MODEL, temperature=0)
            dspy.settings.configure(lm=dspy.LangChain(llm=llm))
            
            self.weights_generator = AspectWeightsGenerator()
            self.cv_analyzer = CVAnalyzer()
            logger.info("DSPy components initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize DSPy components: {e}")
            self.weights_generator = None
            self.cv_analyzer = None
    
    def process_chat_query(self, job_id: UUID, user_query: str) -> ChatAnalysisResult:
        """
        Main method to process chat query and return comprehensive analysis
        """
        try:
            # Step 1: Get job details
            job = self.job_repository.get_job_by_id(job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            # Step 2: Get common aspects
            common_aspects = self.common_aspects_repo.get_common_aspects_by_job_id(job_id)
            
            if not common_aspects:
                raise HTTPException(status_code=404, detail="No common aspects found. Please generate candidates first.")
            
            # Step 3: Generate aspect weights using DSPy
            if self.weights_generator:
                weights_result = self.weights_generator.forward(
                    job_description=job.desc,
                    user_query=user_query,
                    common_aspects=common_aspects
                )
                aspect_weights = weights_result["weights"]
                reasoning = weights_result["reasoning"]
            else:
                # Fallback to equal weights
                equal_weight = 1.0 / len(common_aspects)
                aspect_weights = {aspect: equal_weight for aspect in common_aspects}
                reasoning = "Used equal weights (DSPy unavailable)"
            
            logger.info(f"Generated aspect weights: {aspect_weights}")
            
            # Step 4: Get all candidates and re-weight them
            candidates_data = self.candidate_repository.get_candidates_by_job_id(job_id)
            all_candidates = candidates_data.get("individual_candidates", [])
            
            if not all_candidates:
                raise HTTPException(status_code=404, detail="No candidates found for this job")
            
            # Step 5: Re-weight candidates
            reweighted_candidates = reweight_candidates(all_candidates, aspect_weights)
            
            # Step 6: Get top 10 for analysis
            top_10_candidates = reweighted_candidates[:10]
            
            # Step 7: Generate comprehensive analysis using DSPy
            if self.cv_analyzer:
                analysis_result = self.cv_analyzer.forward(
                    user_query=user_query,
                    job_description=job.desc,
                    top_candidates=top_10_candidates,
                    aspect_weights=aspect_weights
                )
            else:
                # Fallback analysis
                analysis_result = {
                    "analysis": f"Based on your query '{user_query}', I've re-ranked candidates using weighted scoring.",
                    "recommendations": "Review the top 10 candidates shown below.",
                    "key_insights": "Detailed analysis unavailable (DSPy unavailable)."
                }
            
            return ChatAnalysisResult(
                analysis=analysis_result["analysis"],
                recommendations=analysis_result["recommendations"],
                key_insights=analysis_result["key_insights"],
                aspect_weights=aspect_weights,
                top_candidates=top_10_candidates,
                reasoning=reasoning
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing chat query: {e}")
            raise HTTPException(status_code=500, detail="Failed to process chat query")

# Initialize database and repositories
db_manager = DatabaseManager(SQLITE_DB_PATH)
job_repository = JobRepository(db_manager)
common_aspects_repo = CommonAspectsRepository(db_manager)
candidate_repository = CandidateRepository(db_manager, job_repository, common_aspects_repo)

chat_service = ChatService(candidate_repository, common_aspects_repo, job_repository)

# --- LangChain Conversational AI Components ---

def create_milvus_retriever(query: str, top_k: int = 5) -> List[Document]:
    """Create custom retriever for Milvus vector database"""
    try:
        user_vec = get_embedding(query)
        search_results = search_full_text(user_vec, top_k)
        
        documents = []
        for hit in search_results:
            content = hit.get("entity", {}).get("full_text", "")
            if content:
                documents.append(Document(page_content=content))
        
        return documents
    except Exception as e:
        logger.error(f"Document retrieval failed: {e}")
        return []

def initialize_chat_components():
    """Initialize LangChain components for conversational CV analysis"""
    try:
        llm = ChatOpenAI(model=OPENAI_CHAT_MODEL, temperature=0)
        memory = ConversationBufferWindowMemory(
            k=5,  # Keep last 5 exchanges
            memory_key="chat_history",
            return_messages=True
        )
        
        system_template = """
        You are a CV analyst with expertise in metrics interpretation. 
        Use the provided CVs, metrics, and conversation history to answer the user's query in human language. 
        Suggest adjusted weights (e.g., education:0.4, skills:0.6) based on the query and metrics.
        
        Relevant CVs: {context}
        Metrics: {metrics}
        """
        
        human_template = "{question}"
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(system_template),
            HumanMessagePromptTemplate.from_template(human_template)
        ])
        
        return llm, memory, prompt
    except Exception as e:
        logger.error(f"Chat component initialization failed: {e}")
        raise HTTPException(status_code=500, detail="Chat system initialization failed")

# Initialize Milvus collection on startup
try:
    initialize_milvus_collection()
except Exception as e:
    logger.warning(f"Milvus initialization failed, continuing without vector search: {e}")

# --- API Endpoints ---

@app.get("/get_jobs", response_model=List[Job])
async def get_jobs():
    """Retrieve all available job listings from database"""
    return job_repository.get_all_jobs()

@app.get("/get_candidates", response_model=Dict[str, Any])
async def get_candidates(jd_id: UUID):
    """Retrieve candidates for a specific job description"""
    candidates = candidate_repository.get_candidates_by_job_id(jd_id)
    logger.info(f"Retrieved candidates for job_id: {jd_id}")
    return candidates

@app.delete("/delete_candidates/{job_id}")
async def delete_candidates(job_id: UUID):
    """Delete all candidates for a specific job"""
    success = candidate_repository.delete_candidates_by_job_id(job_id)
    if success:
        return {"message": f"Successfully deleted candidates for job {job_id}"}
    else:
        return {"message": f"No candidates found for job {job_id}"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Enhanced chat endpoint for CV analysis with DSPy integration
    - Generates optimal aspect weights based on job description and user query
    - Re-weights top 100 candidates using new aspect weights  
    - Provides comprehensive analysis of top 10 candidates
    - Returns structured insights and recommendations
    """
    try:
        logger.info(f"Processing chat request for job_id: {request.job_id}, query: {request.query}")
        
        # Process the chat query
        result = chat_service.process_chat_query(request.job_id, request.query)
        
        # Get job title for response
        job = job_repository.get_job_by_id(request.job_id)
        job_title = job.title if job else "Unknown Job"
        
        return ChatResponse(
            analysis=result.analysis,
            recommendations=result.recommendations,
            key_insights=result.key_insights,
            aspect_weights=result.aspect_weights,
            reasoning=result.reasoning,
            top_candidates=result.top_candidates,
            query_processed=request.query,
            job_title=job_title
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in chat processing")

@app.get("/chat/weights/{job_id}")
async def get_aspect_weights_preview(job_id: UUID, query: str = "general analysis"):
    """
    Preview aspect weights that would be generated for a given query
    Useful for testing and understanding the weighting system
    """
    try:
        job = job_repository.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        common_aspects_data = common_aspects_repo.get_common_aspects_by_job_id(job_id)
        common_aspects = common_aspects_data.get("common_aspects", [])
        
        if not common_aspects:
            raise HTTPException(status_code=404, detail="No common aspects found")
        
        if chat_service.weights_generator:
            weights_result = chat_service.weights_generator.forward(
                job_description=job.desc,
                user_query=query,
                common_aspects=common_aspects
            )
            return {
                "job_id": str(job_id),
                "query": query,
                "aspect_weights": weights_result["weights"],
                "reasoning": weights_result["reasoning"],
                "total_aspects": len(common_aspects)
            }
        else:
            equal_weight = 1.0 / len(common_aspects)
            weights = {aspect: equal_weight for aspect in common_aspects}
            return {
                "job_id": str(job_id),
                "query": query,
                "aspect_weights": weights,
                "reasoning": "Equal weights used (DSPy unavailable)",
                "total_aspects": len(common_aspects)
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating aspect weights preview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate aspect weights preview")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)