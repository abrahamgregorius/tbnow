# TBNow - AI-Powered TB Diagnosis App

A comprehensive AI-powered tuberculosis diagnosis application for Indonesian healthcare workers, featuring clinical chat, patient records management, and X-ray analysis.

## 🚀 Deployment Guide

### Vercel Deployment

#### 1. Frontend Deployment
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

#### 2. Environment Variables
Set the following environment variables in Vercel:

```env
VITE_API_URL=https://your-backend-api-url.vercel.app
```

**Important:** Replace `https://your-backend-api-url.vercel.app` with your actual backend URL.

#### 3. Backend Deployment
Deploy the backend (`tbnow-back`) to Vercel or another hosting service:

```bash
# In tbnow-back directory
pip install -r requirements.txt
vercel --prod
```

### Troubleshooting MIME Type Errors

If you encounter "Expected a JavaScript module script but the server responded with a MIME type of text/html" errors:

1. **Check Environment Variables**: Ensure `VITE_API_URL` is set to your production backend URL, not localhost
2. **Rebuild and Redeploy**: Clear build cache and redeploy
3. **Check Vercel Configuration**: The `vercel.json` is configured for proper asset serving

### API Endpoints

- `GET /records` - Get all patient records
- `POST /records` - Create new patient record
- `GET /records/{id}` - Get specific record
- `PUT /records/{id}` - Update record status
- `DELETE /records/{id}` - Delete record
- `POST /records/{id}/chat` - Add chat message to record
- `POST /rag/query` - AI clinical guidance
- `POST /xray/analyze` - X-ray analysis

## 🛠️ Development

```bash
# Frontend
cd tbnow-front
npm install
npm run dev

# Backend
cd tbnow-back
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📱 Features

- **Clinical AI Chat**: Quick guidance and patient diagnosis
- **Patient Records**: Comprehensive record management
- **X-ray Analysis**: AI-powered TB detection with heatmaps
- **Mobile Responsive**: Optimized for healthcare workers
- **Indonesian Language**: Localized for Indonesian healthcare system

## 🔒 Security

- Patient data privacy protection
- Secure API communication
- Medical data handling compliance