# Backend - CV Analysis API

A powerful FastAPI-based backend service for CV/Resume analysis using advanced AI and machine learning technologies. This service provides intelligent candidate matching, semantic search, and dynamic scoring capabilities.

## 🚀 Features

- **AI-Powered Analysis**: Integration with OpenAI GPT-4 and embeddings
- **Vector Search**: Milvus vector database for semantic similarity matching
- **Dynamic Scoring**: DSPy-powered aspect weighting and candidate ranking
- **RESTful API**: Comprehensive FastAPI endpoints with automatic documentation
- **Conversational AI**: Chat-based candidate analysis with natural language queries
- **Persistent Storage**: SQLite database for job and candidate data management

## 🛠️ Technology Stack

- **Python 3.10+** - Core programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **DSPy** - Framework for programming with foundation models
- **OpenAI API** - GPT-4 for analysis and text-embedding-3-large for vectors
- **Milvus** - Vector database for similarity search
- **LangChain** - Framework for developing LLM applications
- **SQLite** - Lightweight relational database
- **Poetry** - Dependency management and packaging
- **Uvicorn** - ASGI server for running the application

## 📁 Project Structure

```
BE/
├── main.py              # FastAPI application entry point
├── import_resumes.py    # Utility for importing resume data
├── pyproject.toml       # Poetry configuration and dependencies
├── poetry.lock          # Locked dependency versions
├── resumes.json         # Sample resume data
├── cv_analysis.db       # SQLite database (created at runtime)
└── milvus_resumes.db    # Milvus vector database (created at runtime)
```

## 🔧 Installation & Setup

### Prerequisites

- Python 3.10 or higher
- OpenAI API key
- Poetry (recommended) or pip

### 1. Install Dependencies

**Using Poetry (Recommended):**
```bash
cd BE
poetry install
```

### 2. Environment Configuration

Create a `.env` file in the BE directory:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Override default models
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_CHAT_MODEL=gpt-4
```

### 3. Initialize Database

The application will automatically create and initialize the SQLite database on first run. Sample data will be inserted for testing purposes.

## 🚀 Running the Application

### Development Mode
```bash
# Using Poetry
poetry run python main.py

# Or using Poetry with uvicorn directly
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Using pip installation
python main.py
```

### Production Mode
```bash
# Using Poetry
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Using pip installation
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **Interactive Documentation**: http://localhost:8000/docs
- **Alternative Documentation**: http://localhost:8000/redoc

## 📚 API Endpoints

### Job Management
- `GET /get_jobs` - Retrieve all available job listings
- Response: List of jobs with ID, title, description, and post time

### Candidate Analysis
- `GET /get_candidates?jd_id={job_id}` - Get candidates for a specific job
- `DELETE /delete_candidates/{job_id}` - Delete all candidates for a job
- Response: Candidates with similarity scores and aspect analysis

### Interactive Chat Analysis
- `POST /chat` - Analyze candidates using natural language queries
- Request body: `{"query": "string", "job_id": "uuid"}`
- Response: Comprehensive analysis with recommendations and re-ranked candidates

### Aspect Weights Preview
- `GET /chat/weights/{job_id}?query={query}` - Preview aspect weights for a query
- Response: Generated weights and reasoning for the weighting decisions

## 🔍 Core Components

### 1. Vector Database (Milvus)
- Stores CV embeddings for semantic search
- Supports aspect-level similarity scoring
- Automatic collection initialization and indexing

### 2. DSPy Modules
- **AspectWeightsGenerator**: Generates optimal weights based on job requirements
- **CVAnalyzer**: Provides comprehensive candidate analysis and recommendations

### 3. Database Repositories
- **JobRepository**: Manages job data operations
- **CandidateRepository**: Handles candidate storage and retrieval
- **CommonAspectsRepository**: Manages shared candidate aspects

### 4. Chat Service
- Processes natural language queries
- Integrates DSPy modules for intelligent analysis
- Provides structured responses with insights and recommendations

## ⚙️ Configuration

### Key Configuration Constants
```python
# Database Configuration
MILVUS_DB = "./milvus_resumes.db"
COLLECTION_NAME = "candidates_dynamic"
SQLITE_DB_PATH = "cv_analysis.db"

# OpenAI Configuration
OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"
OPENAI_CHAT_MODEL = "gpt-4"
DIM = 3072  # Embedding dimension
```

### Environment Variables
- `OPENAI_API_KEY` - Required for OpenAI API access
- `OPENAI_EMBEDDING_MODEL` - Override default embedding model
- `OPENAI_CHAT_MODEL` - Override default chat model

## 🧪 Development

### Code Structure
The application follows a clean architecture pattern:
- **API Layer**: FastAPI endpoints and request/response models
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access and persistence
- **External Services**: OpenAI, Milvus integrations

### Adding New Features
1. Define Pydantic models for request/response validation
2. Implement business logic in service classes
3. Add repository methods for data operations
4. Create API endpoints with proper error handling
5. Update documentation and tests

### Logging
The application uses Python's built-in logging module:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("Your log message here")
```

## 🔒 Security Considerations

- API key management through environment variables
- Input validation using Pydantic models
- SQL injection prevention through parameterized queries
- Error handling to prevent information leakage

## 🚨 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure `OPENAI_API_KEY` is set in environment variables
   - Verify API key has sufficient credits and permissions

2. **Milvus Connection Issues**
   - Check if Milvus database file is accessible
   - Ensure sufficient disk space for vector storage

3. **Database Initialization Errors**
   - Verify write permissions in the application directory
   - Check SQLite database file permissions

4. **Memory Issues**
   - Monitor memory usage with large resume datasets
   - Consider adjusting batch sizes for embedding generation

### Performance Optimization

- Use connection pooling for database operations
- Implement caching for frequently accessed data
- Optimize vector search parameters based on dataset size
- Monitor API response times and optimize slow endpoints

## 📊 Monitoring & Logging

The application provides comprehensive logging for:
- API request/response cycles
- Database operations
- Vector search performance
- AI model interactions
- Error tracking and debugging

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include docstrings for classes and methods
4. Write unit tests for new functionality
5. Update API documentation for new endpoints

## 📄 Dependencies

Key dependencies managed in `pyproject.toml`:
- `fastapi` - Web framework
- `dspy` - AI pipeline framework
- `pymilvus` - Vector database client
- `langchain-openai` - OpenAI integration
- `uvicorn` - ASGI server
- `python-dotenv` - Environment variable management
