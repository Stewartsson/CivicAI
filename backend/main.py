# ============================================================
# CIVICAI
# main.py
# Version 7.15.0
#
# Smart Civic Issue Reporting System
#
# Features:
# - AI category prediction using TF-IDF + Logistic Regression
# - Keyword-assisted category prediction
# - Severity detection
# - Priority calculation
# - Complaint submission
# - Complaint listing
# - Complaint details
# - Status update
# - Delete complaint
# - Latitude / longitude support
# - Automatic location geocoding
# - Automatic coordinate backfill for old complaints
# - OpenStreetMap / Nominatim support
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import (
    BaseModel,
    Field,
    field_validator
)

from sqlalchemy.orm import Session

from typing import Optional

from datetime import datetime

import os
import time
import joblib
import json
import urllib.parse
import urllib.request

import database
import models


# ============================================================
# DATABASE TABLE CREATION
# ============================================================

models.Base.metadata.create_all(
    bind=database.engine
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CivicAI",
    description="Smart Civic Issue Reporting System",
    version="7.15.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db():

    db = database.SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ============================================================
# LOAD AI MODEL
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "civicai_model.pkl"
)


VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "civicai_vectorizer.pkl"
)


ai_model = None

ai_vectorizer = None


try:

    if (
        os.path.exists(MODEL_PATH)
        and
        os.path.exists(VECTORIZER_PATH)
    ):

        ai_model = joblib.load(
            MODEL_PATH
        )

        ai_vectorizer = joblib.load(
            VECTORIZER_PATH
        )

        print()
        print(
            "=============================================="
        )
        print(
            " CivicAI AI MODEL LOADED"
        )
        print(
            "=============================================="
        )
        print(
            "Model      : civicai_model.pkl"
        )
        print(
            "Vectorizer : civicai_vectorizer.pkl"
        )
        print(
            "Status     : READY"
        )
        print(
            "=============================================="
        )
        print()

    else:

        print()
        print(
            "WARNING: AI model files were not found."
        )
        print(
            "Run: python ai_model.py"
        )
        print()

except Exception as error:

    print()
    print(
        "ERROR loading AI model:"
    )
    print(
        error
    )
    print()


# ============================================================
# COMPLAINT INPUT
# ============================================================

class ComplaintCreate(BaseModel):

    title: str = Field(
        ...,
        min_length=3,
        max_length=120
    )

    description: str = Field(
        ...,
        min_length=10,
        max_length=1000
    )

    category: Optional[str] = "Other"

    location: str = Field(
        ...,
        min_length=3,
        max_length=200
    )

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180
    )

    @field_validator(
        "title",
        "description",
        "location"
    )
    @classmethod
    def validate_text(
        cls,
        value
    ):

        value = value.strip()

        if not value:

            raise ValueError(
                "This field cannot be empty"
            )

        return value


# ============================================================
# STATUS UPDATE INPUT
# ============================================================

class StatusUpdate(BaseModel):

    status: str


# ============================================================
# LOCATION GEOCODING
# ============================================================

def geocode_location(
    location
):
    """
    Convert a human-readable Chennai location
    into latitude and longitude using
    OpenStreetMap Nominatim.

    Returns:
        (latitude, longitude)
        or
        (None, None)
    """

    if not location:

        return None, None


    location = str(
        location
    ).strip()


    if not location:

        return None, None


    try:

        query = location


        # ----------------------------------------------------
        # Add Chennai / India when the user enters a
        # local location such as:
        #
        # Anna Nagar
        # Chetpet
        # T Nagar
        # ----------------------------------------------------

        location_lower = location.lower()


        if "india" not in location_lower:

            if "chennai" not in location_lower:

                query = (
                    f"{location}, Chennai, Tamil Nadu, India"
                )

            else:

                query = (
                    f"{location}, Tamil Nadu, India"
                )


        encoded_query = urllib.parse.urlencode(
            {
                "q": query,
                "format": "jsonv2",
                "limit": 1,
                "countrycodes": "in"
            }
        )


        url = (
            "https://nominatim.openstreetmap.org/search?"
            + encoded_query
        )


        request = urllib.request.Request(

            url,

            headers={
                "User-Agent":
                    "CivicAI/7.15.0 "
                    "(Smart Civic Issue Reporting System)"
            }

        )


        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            raw_data = response.read().decode(
                "utf-8"
            )


        data = json.loads(
            raw_data
        )


        if (
            isinstance(data, list)
            and
            len(data) > 0
        ):

            latitude = float(
                data[0]["lat"]
            )

            longitude = float(
                data[0]["lon"]
            )


            if (
                -90 <= latitude <= 90
                and
                -180 <= longitude <= 180
            ):

                print(
                    f"📍 Geocoded: {location}"
                )

                print(
                    f"   Latitude : {latitude}"
                )

                print(
                    f"   Longitude: {longitude}"
                )


                return (
                    latitude,
                    longitude
                )


    except Exception as error:

        print(
            "⚠️ Geocoding failed:"
        )

        print(
            f"   Location: {location}"
        )

        print(
            f"   Error: {error}"
        )


    return None, None


# ============================================================
# BACKFILL MISSING COMPLAINT COORDINATES
# ============================================================

def update_missing_coordinates(
    db
):
    """
    Find existing complaints that do not have
    latitude and longitude.

    The function geocodes their existing location
    and saves the coordinates into the database.

    This allows old complaints created before
    coordinate support was added to appear
    correctly on the map.
    """

    try:

        missing_complaints = (

            db.query(
                models.Complaint
            )

            .filter(
                (
                    models.Complaint.latitude == None
                )
                |
                (
                    models.Complaint.longitude == None
                )
            )

            .all()

        )


        if not missing_complaints:

            print(
                "📍 All complaints already have coordinates."
            )

            return


        print()

        print(
            "=============================================="
        )

        print(
            " CIVICAI LOCATION BACKFILL"
        )

        print(
            "=============================================="
        )

        print(
            f"Missing coordinate records: "
            f"{len(missing_complaints)}"
        )


        # ----------------------------------------------------
        # Cache repeated locations
        # ----------------------------------------------------

        location_cache = {}


        # ----------------------------------------------------
        # Process every complaint
        # ----------------------------------------------------

        for complaint in missing_complaints:

            location = str(
                complaint.location or ""
            ).strip()


            if not location:

                print()

                print(
                    f"⚠️ Complaint #{complaint.id} "
                    f"has no location."
                )

                continue


            print()

            print(
                f"📍 Processing complaint "
                f"#{complaint.id}"
            )

            print(
                f"   Location: {location}"
            )


            # ------------------------------------------------
            # Check cache
            # ------------------------------------------------

            if location in location_cache:

                latitude, longitude = (
                    location_cache[
                        location
                    ]
                )


            else:

                latitude, longitude = (
                    geocode_location(
                        location
                    )
                )


                location_cache[
                    location
                ] = (
                    latitude,
                    longitude
                )


                # ------------------------------------------------
                # Respect Nominatim request rate
                # ------------------------------------------------

                time.sleep(
                    1
                )


            # ------------------------------------------------
            # Save coordinates
            # ------------------------------------------------

            if (
                latitude is not None
                and
                longitude is not None
            ):

                complaint.latitude = (
                    latitude
                )

                complaint.longitude = (
                    longitude
                )


                print(
                    f"   ✅ Latitude: "
                    f"{latitude}"
                )

                print(
                    f"   ✅ Longitude: "
                    f"{longitude}"
                )


            else:

                print(
                    "   ❌ Could not geocode location."
                )


        # ----------------------------------------------------
        # Commit changes
        # ----------------------------------------------------

        db.commit()


        print()

        print(
            "=============================================="
        )

        print(
            " LOCATION BACKFILL COMPLETE"
        )

        print(
            "=============================================="
        )

        print()


    except Exception as error:

        db.rollback()


        print()

        print(
            "❌ Location backfill failed:"
        )

        print(
            error
        )

        print()


# ============================================================
# AI CATEGORY PREDICTION
# ============================================================

def predict_category(
    title,
    description
):

    text = (
        str(title)
        + " "
        + str(description)
    ).strip()


    # --------------------------------------------------------
    # EMPTY TEXT
    # --------------------------------------------------------

    if not text:

        return "Other"


    text_lower = text.lower()


    # ========================================================
    # POTHOLE
    # ========================================================

    pothole_keywords = [

        "pothole",
        "potholes",
        "pot hole",
        "pot holes",
        "pathole",
        "patholes",
        "path hole",
        "path holes",
        "road hole",
        "road holes",
        "deep hole",
        "deep pothole",
        "huge hole",
        "huge pothole",
        "large pothole",
        "road damage",
        "damaged road",
        "broken road",
        "road is broken",
        "road surface is damaged",
        "road surface damaged"

    ]


    if any(
        keyword in text_lower
        for keyword in pothole_keywords
    ):

        return "Pothole"


    # ========================================================
    # GARBAGE
    # ========================================================

    garbage_keywords = [

        "garbage",
        "trash",
        "rubbish",
        "waste",
        "dumped waste",
        "dustbin",
        "litter",
        "plastic waste",
        "garbage bin",
        "garbage bins",
        "waste dump",
        "dumping waste"

    ]


    if any(
        keyword in text_lower
        for keyword in garbage_keywords
    ):

        return "Garbage"


    # ========================================================
    # DRAINAGE
    # ========================================================

    drainage_keywords = [

        "drainage",
        "drain",
        "sewage",
        "waterlogging",
        "water logging",
        "blocked drain",
        "drain blocked",
        "stagnant water",
        "drainage overflow",
        "sewage water",
        "dirty water overflow",
        "drain overflow",
        "clogged drain"

    ]


    if any(
        keyword in text_lower
        for keyword in drainage_keywords
    ):

        return "Drainage"


    # ========================================================
    # STREETLIGHT
    # ========================================================

    streetlight_keywords = [

        "streetlight",
        "streetlights",
        "street light",
        "street lights",
        "street lamp",
        "street lamps",
        "lamp post",
        "lamp posts",
        "light not working",
        "lights not working",
        "road is dark",
        "street is dark",
        "no light",
        "dark street",
        "dark road"

    ]


    if any(
        keyword in text_lower
        for keyword in streetlight_keywords
    ):

        return "Streetlight"


    # ========================================================
    # WATER
    # ========================================================

    water_keywords = [

        "water supply",
        "water shortage",
        "drinking water",
        "water pipeline",
        "water pipe",
        "pipeline",
        "pipe leak",
        "water leak",
        "water leakage",
        "no water",
        "water is leaking",
        "pipeline leak",
        "pipeline burst"

    ]


    if any(
        keyword in text_lower
        for keyword in water_keywords
    ):

        return "Water"


    # ========================================================
    # MACHINE LEARNING MODEL
    # ========================================================

    if (
        ai_model is not None
        and
        ai_vectorizer is not None
    ):

        try:

            vector = ai_vectorizer.transform(
                [text]
            )


            prediction = ai_model.predict(
                vector
            )[0]


            probabilities = (
                ai_model.predict_proba(
                    vector
                )[0]
            )


            confidence = max(
                probabilities
            )


            print(
                "AI prediction:",
                prediction
            )


            print(
                "AI confidence:",
                round(
                    confidence * 100,
                    2
                ),
                "%"
            )


            allowed_predictions = [

                "Garbage",
                "Pothole",
                "Drainage",
                "Streetlight",
                "Water"

            ]


            if prediction in allowed_predictions:

                return prediction


        except Exception as error:

            print(
                "AI prediction error:",
                error
            )


    # ========================================================
    # FALLBACK
    # ========================================================

    return "Other"


# ============================================================
# SEVERITY CALCULATION
# ============================================================

def calculate_severity(
    title,
    description
):

    text = (
        str(title)
        + " "
        + str(description)
    ).lower()


    # ========================================================
    # HIGH SEVERITY
    # ========================================================

    high_words = [

        "danger",
        "dangerous",
        "accident",
        "accidents",
        "fire",
        "emergency",
        "critical",
        "severe",
        "major",
        "collapsed",
        "collapse",
        "open manhole",
        "electrical hazard",
        "life threatening",
        "life-threatening",
        "injury",
        "injuries",
        "death",
        "fatal",
        "risk to life",
        "causing accidents",
        "caused accident",
        "school accident",
        "serious accident"

    ]


    # ========================================================
    # MEDIUM SEVERITY
    # ========================================================

    medium_words = [

        "broken",
        "damaged",
        "damage",
        "leak",
        "leaking",
        "blocked",
        "overflow",
        "flood",
        "flooding",
        "pothole",
        "potholes",
        "pathole",
        "patholes",
        "not working",
        "clogged",
        "unsafe",
        "burst",
        "huge",
        "large",
        "deep"

    ]


    # ========================================================
    # HIGH CHECK FIRST
    # ========================================================

    if any(
        word in text
        for word in high_words
    ):

        return "High"


    # ========================================================
    # MEDIUM CHECK
    # ========================================================

    if any(
        word in text
        for word in medium_words
    ):

        return "Medium"


    # ========================================================
    # LOW
    # ========================================================

    return "Low"


# ============================================================
# PRIORITY CALCULATION
# ============================================================

def calculate_priority(
    severity
):

    if severity == "High":

        return "Urgent"


    if severity == "Medium":

        return "Important"


    return "Normal"


# ============================================================
# SERIALISE COMPLAINT
# ============================================================

def complaint_to_dict(
    complaint
):

    return {

        "id":
            complaint.id,

        "title":
            complaint.title,

        "description":
            complaint.description,

        "category":
            complaint.category,

        "location":
            complaint.location,

        "latitude":
            complaint.latitude,

        "longitude":
            complaint.longitude,

        "severity":
            complaint.severity,

        "priority":
            complaint.priority,

        "status":
            complaint.status,

        "created_at":
            (
                complaint.created_at.isoformat()
                if complaint.created_at
                else None
            ),

        "updated_at":
            (
                complaint.updated_at.isoformat()
                if complaint.updated_at
                else None
            )

    }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "CivicAI API is running",

        "version":
            "7.15.0",

        "status":
            "online",

        "ai_model":
            (
                "loaded"
                if ai_model is not None
                else "not loaded"
            )

    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

        "service":
            "CivicAI Backend",

        "ai_model":
            (
                "ready"
                if ai_model is not None
                else "not ready"
            )

    }


# ============================================================
# GET ALL COMPLAINTS
# ============================================================

@app.get("/complaints")
def get_complaints(
    db: Session = Depends(get_db)
):

    complaints = (

        db.query(
            models.Complaint
        )

        .order_by(
            models.Complaint.id.desc()
        )

        .all()

    )


    return [

        complaint_to_dict(
            complaint
        )

        for complaint in complaints

    ]


# ============================================================
# GET SINGLE COMPLAINT
# ============================================================

@app.get(
    "/complaints/{complaint_id}"
)
def get_single_complaint(

    complaint_id: int,

    db: Session = Depends(get_db)

):

    complaint = (

        db.query(
            models.Complaint
        )

        .filter(
            models.Complaint.id ==
            complaint_id
        )

        .first()

    )


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    return complaint_to_dict(
        complaint
    )


# ============================================================
# CREATE COMPLAINT
# ============================================================

@app.post("/complaints")
def create_complaint(

    complaint: ComplaintCreate,

    db: Session = Depends(get_db)

):

    # --------------------------------------------------------
    # CLEAN USER INPUT
    # --------------------------------------------------------

    title = complaint.title.strip()

    description = complaint.description.strip()

    location = complaint.location.strip()


    if not title:

        raise HTTPException(

            status_code=400,

            detail="Issue title is required"

        )


    if not description:

        raise HTTPException(

            status_code=400,

            detail="Description is required"

        )


    if not location:

        raise HTTPException(

            status_code=400,

            detail="Location is required"

        )


    allowed_categories = [

        "Garbage",
        "Pothole",
        "Drainage",
        "Streetlight",
        "Water",
        "Other"

    ]


    if complaint.category not in allowed_categories:

        raise HTTPException(

            status_code=400,

            detail="Invalid category selected"

        )


    # ========================================================
    # AI CATEGORY
    # ========================================================

    ai_category = predict_category(
        title,
        description
    )


    # ========================================================
    # SEVERITY
    # ========================================================

    severity = calculate_severity(
        title,
        description
    )


    # ========================================================
    # PRIORITY
    # ========================================================

    priority = calculate_priority(
        severity
    )


    # ========================================================
    # LOCATION COORDINATES
    # ========================================================

    latitude = complaint.latitude

    longitude = complaint.longitude


    # --------------------------------------------------------
    # Automatically geocode if coordinates were not supplied
    # --------------------------------------------------------

    if (
        latitude is None
        or
        longitude is None
    ):

        (
            latitude,
            longitude
        ) = geocode_location(
            location
        )


    # ========================================================
    # PRINT RESULT
    # ========================================================

    print()

    print(
        "=============================================="
    )

    print(
        " NEW CIVICAI COMPLAINT"
    )

    print(
        "=============================================="
    )

    print(
        "Title:",
        title
    )

    print(
        "Description:",
        description
    )

    print(
        "User selected category:",
        complaint.category
    )

    print(
        "AI category:",
        ai_category
    )

    print(
        "Severity:",
        severity
    )

    print(
        "Priority:",
        priority
    )

    print(
        "Location:",
        location
    )

    print(
        "Latitude:",
        latitude
    )

    print(
        "Longitude:",
        longitude
    )

    print(
        "=============================================="
    )

    print()


    # ========================================================
    # CREATE DATABASE RECORD
    # ========================================================

    new_complaint = models.Complaint(

        title=title,

        description=description,

        category=ai_category,

        location=location,

        latitude=latitude,

        longitude=longitude,

        severity=severity,

        priority=priority,

        status="Pending"

    )


    # ========================================================
    # SAVE
    # ========================================================

    db.add(
        new_complaint
    )


    db.commit()


    db.refresh(
        new_complaint
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "message":
            "Complaint submitted successfully",

        "complaint_id":
            new_complaint.id,

        "ai_category":
            new_complaint.category,

        "severity":
            new_complaint.severity,

        "priority":
            new_complaint.priority,

        "status":
            new_complaint.status,

        "location":
            new_complaint.location,

        "latitude":
            new_complaint.latitude,

        "longitude":
            new_complaint.longitude

    }


# ============================================================
# UPDATE COMPLAINT STATUS
# ============================================================

@app.put(
    "/complaints/{complaint_id}/status"
)
def update_complaint_status(

    complaint_id: int,

    status_data: StatusUpdate,

    db: Session = Depends(get_db)

):

    allowed_statuses = [

        "Pending",
        "In Progress",
        "Resolved"

    ]


    new_status = str(
        status_data.status
    ).strip()


    if new_status not in allowed_statuses:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid status. "
                "Allowed values are: "
                "Pending, In Progress, Resolved"
            )

        )


    complaint = (

        db.query(
            models.Complaint
        )

        .filter(
            models.Complaint.id ==
            complaint_id
        )

        .first()

    )


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    complaint.status = new_status


    complaint.updated_at = datetime.utcnow()


    db.commit()


    db.refresh(
        complaint
    )


    return {

        "message":
            "Complaint status updated successfully",

        "complaint_id":
            complaint.id,

        "status":
            complaint.status,

        "updated_at":
            (
                complaint.updated_at.isoformat()
                if complaint.updated_at
                else None
            )

    }


# ============================================================
# DELETE COMPLAINT
# ============================================================

@app.delete(
    "/complaints/{complaint_id}"
)
def delete_complaint(

    complaint_id: int,

    db: Session = Depends(get_db)

):

    complaint = (

        db.query(
            models.Complaint
        )

        .filter(
            models.Complaint.id ==
            complaint_id
        )

        .first()

    )


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    db.delete(
        complaint
    )


    db.commit()


    return {

        "message":
            "Complaint deleted successfully",

        "complaint_id":
            complaint_id

    }


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api-info")
def api_info():

    return {

        "application":
            "CivicAI",

        "version":
            "7.15.0",

        "ai_model":
            (
                "TF-IDF + Logistic Regression"
                if ai_model is not None
                else "Not loaded"
            ),

        "features": [

            "AI category prediction",

            "Keyword-assisted category prediction",

            "Complaint submission",

            "Severity detection",

            "Priority calculation",

            "Complaint listing",

            "Complaint details",

            "Status update",

            "Complaint deletion",

            "Automatic location geocoding",

            "Automatic coordinate backfill",

            "Latitude / longitude storage",

            "OpenStreetMap support"

        ]

    }


# ============================================================
# STARTUP INFORMATION
# ============================================================

@app.on_event("startup")
def startup_event():

    print()

    print(
        "================================================"
    )

    print(
        " CivicAI 7.15.0"
    )

    print(
        " Smart Civic Issue Reporting System"
    )

    print(
        "================================================"
    )

    print(
        "Backend       : ONLINE"
    )

    print(
        "AI Model      : "
        +
        (
            "LOADED"
            if ai_model is not None
            else "NOT LOADED"
        )
    )

    print(
        "Geocoding     : OpenStreetMap Nominatim"
    )

    print(
        "Database      : READY"
    )

    print(
        "================================================"
    )

    print()


    # ========================================================
    # AUTOMATICALLY UPDATE OLD COMPLAINT COORDINATES
    # ========================================================

    db = database.SessionLocal()

    try:

        update_missing_coordinates(
            db
        )

    finally:

        db.close()