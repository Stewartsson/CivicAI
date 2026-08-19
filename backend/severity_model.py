from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

from severity_data import (
    severity_texts,
    severity_labels,
    priority_labels
)


# ==========================================
# Create TF-IDF vectorizer
# ==========================================

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english"
)


# Convert complaint text into numbers
X = vectorizer.fit_transform(severity_texts)


# ==========================================
# Train Severity Model
# ==========================================

severity_model = LogisticRegression(
    max_iter=1000
)

severity_model.fit(
    X,
    severity_labels
)


# ==========================================
# Train Priority Model
# ==========================================

priority_model = LogisticRegression(
    max_iter=1000
)

priority_model.fit(
    X,
    priority_labels
)


# ==========================================
# Save the models
# ==========================================

joblib.dump(
    severity_model,
    "civicai_severity_model.pkl"
)

joblib.dump(
    priority_model,
    "civicai_priority_model.pkl"
)

joblib.dump(
    vectorizer,
    "civicai_severity_vectorizer.pkl"
)


# ==========================================
# Success message
# ==========================================

print("CivicAI Severity AI model trained successfully!")
print("CivicAI Priority AI model trained successfully!")

print("Saved:")
print("civicai_severity_model.pkl")
print("civicai_priority_model.pkl")
print("civicai_severity_vectorizer.pkl")