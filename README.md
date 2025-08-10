# Rama HackNation - CV Analysis Platform

A comprehensive CV/Resume analysis platform that leverages AI and machine learning to match candidates with job descriptions. The platform uses advanced vector embeddings, semantic search, and intelligent scoring to provide detailed candidate analysis and recommendations.

## 🚀 Features

- **AI-Powered CV Analysis**: Uses OpenAI embeddings and DSPy for intelligent candidate evaluation
- **Vector Search**: Milvus vector database for semantic similarity matching
- **Dynamic Aspect Weighting**: Automatically adjusts scoring criteria based on job requirements and user queries
- **Interactive Chat Interface**: Natural language queries for candidate analysis
- **Real-time Candidate Ranking**: Dynamic re-ranking based on customizable criteria
- **Comprehensive Metrics**: Detailed scoring across multiple candidate aspects

## 🏗️ Architecture

The platform consists of two main components:

### Backend (BE)
- **Framework**: FastAPI (Python)
- **AI/ML**: DSPy, OpenAI GPT-4, LangChain
- **Vector Database**: Milvus
- **Database**: SQLite
- **Key Features**:
  - CV embedding generation
  - Semantic search and matching
  - Dynamic aspect weighting
  - Chat-based analysis

### Frontend (FE)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **UI Components**: Lucide React icons
- **Key Features**:
  - Job listing interface
  - Candidate search and filtering
  - Interactive candidate profiles
  - Chat interface for analysis

## 🛠️ Technology Stack

### Backend Technologies
- **Python 3.10+**
- **FastAPI** - Modern web framework
- **DSPy** - AI pipeline framework
- **OpenAI API** - GPT-4 and embeddings
- **Milvus** - Vector database
- **LangChain** - LLM application framework
- **SQLite** - Relational database
- **Poetry** - Dependency management

### Frontend Technologies
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library

## 📁 Project Structure

```
rama-hacknation/
├── BE/                     # Backend application
│   ├── main.py            # FastAPI application entry point
│   ├── import_resumes.py  # Resume import utilities
│   ├── pyproject.toml     # Python dependencies
│   ├── poetry.lock        # Locked dependencies
│   └── resumes.json       # Sample resume data
├── FE/                     # Frontend application
│   ├── src/               # React source code
│   │   ├── App.jsx        # Main application component
│   │   ├── HomePage.jsx   # Home page component
│   │   ├── SearchResultsPage.jsx
│   │   ├── CandidateProfilePage.jsx
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rama-hacknation
```

### 2. Backend Setup
```bash
cd BE
# Install dependencies using Poetry
poetry install
# Or using pip
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Frontend Setup
```bash
cd FE
npm install
```

### 4. Run the Application

**Start Backend:**
```bash
cd BE
poetry run python main.py
# Backend will run on http://localhost:8000
```

**Start Frontend:**
```bash
cd FE
npm run dev
# Frontend will run on http://localhost:5173
```

## 📖 Usage

1. **Access the Application**: Open http://localhost:5173 in your browser
2. **Browse Jobs**: View available job listings on the home page
3. **Analyze Candidates**: Select a job to see matched candidates
4. **Interactive Analysis**: Use the chat interface to ask specific questions about candidates
5. **Dynamic Ranking**: Candidates are automatically re-ranked based on your queries

## 🔧 Configuration

### Backend Configuration
Key configuration options in `BE/main.py`:
- `OPENAI_EMBEDDING_MODEL`: OpenAI embedding model (default: text-embedding-3-large)
- `OPENAI_CHAT_MODEL`: OpenAI chat model (default: gpt-4)
- `MILVUS_DB`: Milvus database path
- `SQLITE_DB_PATH`: SQLite database path

### Frontend Configuration
Configuration files:
- `vite.config.js`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `package.json`: Dependencies and scripts

## 🧪 Development

### Backend Development
```bash
cd BE
# Run with auto-reload
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd FE
# Run development server
npm run dev
# Build for production
npm run build
# Preview production build
npm run preview
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `GET /get_jobs` - Retrieve all job listings
- `GET /get_candidates?jd_id={job_id}` - Get candidates for a job
- `POST /chat` - Interactive CV analysis
- `GET /chat/weights/{job_id}` - Preview aspect weights

## 🤝 Contribiters And Contributing
Đại Nguyễn Bá (Me)
Tayyab Nisar (https://github.com/Tayyab666-star) Emaill(tnasir536@gmail.com)
Jennifer Long (jl115@wellesley.edu)
Damian Dumitru Lache (dashlache22@gmail.com)


1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embedding models
- Milvus for vector database technology
- DSPy for AI pipeline framework
- FastAPI and React communities
