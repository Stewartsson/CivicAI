# ============================================================
# CIVICAI
# models.py
# ============================================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime
)

from sqlalchemy.sql import func

from database import Base


# ============================================================
# COMPLAINT MODEL
# ============================================================

class Complaint(Base):

    __tablename__ = "complaints"

    # --------------------------------------------------------
    # ID
    # --------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    title = Column(
        String(255),
        nullable=False
    )

    # --------------------------------------------------------
    # DESCRIPTION
    # --------------------------------------------------------

    description = Column(
        Text,
        nullable=False
    )

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    category = Column(
        String(100),
        nullable=False,
        default="Other"
    )

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    location = Column(
        String(500),
        nullable=False
    )

    # --------------------------------------------------------
    # LATITUDE
    # Used by the map when exact coordinates exist
    # --------------------------------------------------------

    latitude = Column(
        Float,
        nullable=True
    )

    # --------------------------------------------------------
    # LONGITUDE
    # Used by the map when exact coordinates exist
    # --------------------------------------------------------

    longitude = Column(
        Float,
        nullable=True
    )

    # --------------------------------------------------------
    # SEVERITY
    # --------------------------------------------------------

    severity = Column(
        String(50),
        nullable=False,
        default="Medium"
    )

    # --------------------------------------------------------
    # PRIORITY
    # --------------------------------------------------------

    priority = Column(
        String(50),
        nullable=False,
        default="Important"
    )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )

    # --------------------------------------------------------
    # CREATED TIME
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=True
    )

    # --------------------------------------------------------
    # UPDATED TIME
    # --------------------------------------------------------

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True
    )