CivicAI

Smart Civic Issue Reporting System using AI, FastAPI and
OpenStreetMap

CivicAI is a web-based civic issue reporting system that lets users
submit civic complaints and automatically analyzes them using an AI
model. Complaints are categorized, assigned severity and priority,
geocoded, stored in a database, and displayed on an interactive map.

🚀 Live Demo

Website: https://civicai-1-boql.onrender.com

Backend API: https://civicai-vo9g.onrender.com

Swagger API: https://civicai-vo9g.onrender.com/docs

GitHub: https://github.com/Stewartsson/CivicAI

✨ Features

📝 Submit civic complaints

🤖 AI-based complaint categorization

⚠️ Automatic severity detection

🚨 Automatic priority calculation

📍 Location geocoding with OpenStreetMap Nominatim

🗺️ Interactive complaint map

📊 Complaint statistics

🔎 Search and filter complaints

🔄 Update complaint status

👁️ View complaint details

🗑️ Delete complaints

🗄️ Database-backed storage

🌐 Live deployment

🧠 AI Processing

When a complaint is submitted, CivicAI analyzes its title and
description to determine the civic issue category.

The system also calculates severity and priority and converts the
supplied location into coordinates for map display.

Example

Complaint: Large pothole on main road
Location: Anna Nagar, Chennai

The system can identify:

AI Category: Pothole

Severity: Medium

Priority: Important

Status: Pending

🔌 API Endpoints

Method   Endpoint                              Purpose

GET      /                                   API status
GET      /health                             Health check
GET      /complaints                         Get complaints
POST     /complaints                         Create complaint
GET      /complaints/{complaint_id}          Get one complaint
DELETE   /complaints/{complaint_id}          Delete complaint
PUT      /complaints/{complaint_id}/status   Update complaint status
GET      /api-info                           API information

Interactive documentation:

https://civicai-vo9g.onrender.com/docs

🛠️ Technology Stack

Frontend

HTML

CSS

JavaScript

Leaflet

OpenStreetMap

Backend

Python

FastAPI

Uvicorn

SQLAlchemy

Pydantic

Scikit-learn

Joblib

Deployment

GitHub

Render

📁 Project Structure

CivicAI/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── ...
├── .gitignore
└── README.md

💻 Run Locally

Clone the repository:

git clone https://github.com/Stewartsson/CivicAI.git
cd CivicAI

Install backend dependencies:

cd backend
pip install -r requirements.txt

Start the backend:

uvicorn main:app --host 0.0.0.0 --port 8000

Local API:

http://127.0.0.1:8000

Local Swagger documentation:

http://127.0.0.1:8000/docs

📋 Complaint Workflow

User submits complaint
        ↓
AI analyzes complaint
        ↓
Category detected
        ↓
Severity calculated
        ↓
Priority calculated
        ↓
Location geocoded
        ↓
Complaint stored in database
        ↓
Complaint displayed on dashboard
        ↓
Complaint displayed on map
        ↓
Status can be updated

🎯 Project Status

CivicAI 7.15.0 --- Live

The deployed system includes complaint reporting, AI model integration,
geocoding, database storage, an interactive map, and complaint
management.

👨‍💻 Author

Stewartsson

GitHub: https://github.com/Stewartsson/CivicAI

📄 License

This project is provided for educational and demonstration purposes.
