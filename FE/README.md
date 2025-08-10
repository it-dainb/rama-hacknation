# Frontend - CV Analysis Platform UI

A modern React-based frontend application for the CV Analysis Platform. Built with React 19, Vite, and Tailwind CSS, providing an intuitive interface for job management, candidate analysis, and interactive AI-powered insights.

## 🚀 Features

- **Modern React 19**: Latest React features with concurrent rendering
- **Lightning Fast**: Vite for instant development server and optimized builds
- **Responsive Design**: Tailwind CSS for mobile-first, responsive layouts
- **Interactive UI**: Lucide React icons and smooth user interactions
- **Client-Side Routing**: React Router DOM for seamless navigation
- **Job Management**: Browse and select job listings
- **Candidate Analysis**: View detailed candidate profiles and scores
- **AI Chat Interface**: Natural language queries for candidate insights
- **Real-time Updates**: Dynamic candidate ranking and filtering

## 🛠️ Technology Stack

- **React 19** - Modern UI library with latest features
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Declarative routing for React
- **Lucide React** - Beautiful & consistent icon library
- **PostCSS** - CSS processing and optimization
- **ESLint** - Code linting and quality assurance

## 📁 Project Structure

```
FE/
├── public/                 # Static assets
│   └── vite.svg           # Vite logo
├── src/                   # Source code
│   ├── assets/            # Application assets
│   │   └── react.svg      # React logo
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   ├── main.jsx           # Application entry point
│   ├── index.css          # Global styles with Tailwind
│   ├── HomePage.jsx       # Home page with job listings
│   ├── SearchResultsPage.jsx    # Candidate search results
│   └── CandidateProfilePage.jsx # Individual candidate profiles
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # This file
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm package manager

### 1. Install Dependencies

```bash
cd FE

# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in the FE directory if needed:
```bash
# API Configuration (if different from default)
VITE_API_BASE_URL=http://localhost:8000

# Development Configuration
VITE_DEV_MODE=true
```

## 🚀 Development

### Start Development Server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at:
- **Development Server**: http://localhost:5173
- **Network Access**: Available on local network (check terminal output)

### Development Features
- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Fast Refresh**: Preserves component state during updates
- **Error Overlay**: Detailed error information in development
- **Source Maps**: Easy debugging with original source code

## 🏗️ Build & Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output
- **dist/**: Production-ready files
- **Optimized Assets**: Minified CSS, JS, and images
- **Code Splitting**: Automatic bundle optimization
- **Tree Shaking**: Unused code elimination

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Traditional Hosting**: Apache, Nginx

## 🎨 Styling & Design

### Tailwind CSS
The application uses Tailwind CSS for styling:
- **Utility-First**: Compose designs using utility classes
- **Responsive**: Mobile-first responsive design
- **Customizable**: Extend theme in `tailwind.config.js`
- **Dark Mode**: Built-in dark mode support (if implemented)

### Custom Styles
- `src/index.css`: Global styles and Tailwind imports
- `src/App.css`: Application-specific styles
- Component-level styles using Tailwind classes

### Icons
Lucide React provides beautiful, consistent icons:
```jsx
import { Search, User, Star } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <Search className="w-5 h-5" />
      <User className="w-6 h-6 text-blue-500" />
      <Star className="w-4 h-4 fill-yellow-400" />
    </div>
  );
}
```

## 🧭 Routing & Navigation

### Route Structure
```jsx
// App.jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/search" element={<SearchResultsPage />} />
  <Route path="/candidate/:candidateId" element={<CandidateProfilePage />} />
</Routes>
```

### Navigation
- **Home Page**: Job listings and selection
- **Search Results**: Candidate list with filtering
- **Candidate Profile**: Detailed candidate information

## 📱 Components Overview

### HomePage.jsx
- Displays available job listings
- Job selection interface
- Navigation to candidate search

### SearchResultsPage.jsx
- Shows candidates for selected job
- Filtering and sorting options
- Candidate ranking display
- Chat interface for AI analysis

### CandidateProfilePage.jsx
- Detailed candidate information
- Skill and experience breakdown
- Similarity scores and metrics
- Action buttons for hiring decisions

## 🔌 API Integration

### Backend Communication
The frontend communicates with the FastAPI backend:

```javascript
// Example API calls
const API_BASE = 'http://localhost:8000';

// Fetch jobs
const jobs = await fetch(`${API_BASE}/get_jobs`);

// Get candidates
const candidates = await fetch(`${API_BASE}/get_candidates?jd_id=${jobId}`);

// Chat analysis
const analysis = await fetch(`${API_BASE}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, job_id: jobId })
});
```

## ⚙️ Configuration

### Vite Configuration (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Tailwind Configuration (tailwind.config.js)
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

## 🧪 Development Best Practices

### Code Organization
- **Component Structure**: One component per file
- **Naming Convention**: PascalCase for components
- **File Organization**: Group related files together
- **Import Order**: External libraries first, then internal modules

### State Management
- **React Hooks**: useState, useEffect for local state
- **Props**: Pass data down component tree
- **Context API**: For global state (if needed)
- **URL State**: Use router for shareable state

### Performance Optimization
- **Code Splitting**: Lazy load components with React.lazy()
- **Memoization**: Use React.memo() for expensive components
- **Bundle Analysis**: Analyze bundle size with build tools
- **Image Optimization**: Optimize images and use appropriate formats

## 🔍 Debugging & Development Tools

### Browser DevTools
- **React Developer Tools**: Component inspection and profiling
- **Network Tab**: Monitor API calls and performance
- **Console**: Debug JavaScript and view logs
- **Performance Tab**: Analyze rendering performance

### Vite DevTools
- **HMR Logs**: Hot module replacement information
- **Build Analysis**: Bundle size and optimization insights
- **Error Overlay**: Detailed error information

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in vite.config.js or use different port
   npm run dev -- --port 3000
   ```

2. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Tailwind Styles Not Loading**
   - Check `tailwind.config.js` content paths
   - Verify `@tailwind` directives in `index.css`
   - Restart development server

4. **API Connection Issues**
   - Verify backend is running on correct port
   - Check CORS configuration in backend
   - Verify API endpoints and request formats

### Performance Issues
- **Slow Development Server**: Clear Vite cache (`rm -rf node_modules/.vite`)
- **Large Bundle Size**: Analyze with `npm run build -- --analyze`
- **Memory Issues**: Increase Node.js memory limit

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Make changes following code style guidelines
3. Test changes thoroughly
4. Run linting: `npm run lint`
5. Create pull request with detailed description

### Code Style
- **ESLint**: Automated code linting
- **Prettier**: Code formatting (if configured)
- **Component Guidelines**: Follow React best practices
- **Accessibility**: Ensure WCAG compliance

## 📦 Scripts

```json
{
  "scripts": {
    "dev": "vite",                    // Start development server
    "build": "vite build",            // Create production build
    "lint": "eslint .",               // Run ESLint
    "preview": "vite preview"         // Preview production build
  }
}
```

## 🔄 Updates & Maintenance

### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update to latest versions (use with caution)
npx npm-check-updates -u
npm install
```

### Security Updates
```bash
# Audit dependencies for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```
