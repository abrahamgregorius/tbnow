#!/usr/bin/env python3
"""
TBNow Backend Server Startup Script
Clean startup with all warnings suppressed
"""

import os
import sys

# Set environment variables before any imports
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_CPP_MIN_VLOG_LEVEL'] = '3'
os.environ['PYTHONWARNINGS'] = 'ignore'

# Suppress all Python warnings
import warnings
warnings.filterwarnings('ignore')

# Import and run the server
from app.main import app
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting TBNow Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("🔇 All warnings suppressed for clean output")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )