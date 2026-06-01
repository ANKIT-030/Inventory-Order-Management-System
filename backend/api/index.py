import sys
import os

# Add the parent directory to sys.path so the 'app' module can be imported correctly by Vercel
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
