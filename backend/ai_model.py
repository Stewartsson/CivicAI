# ============================================================
# CIVICAI
# ai_model.py
# AI CATEGORY MODEL TRAINING
# ============================================================

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

from training_data import training_texts, training_labels


# ============================================================
# CREATE TF-IDF VECTORIZER
# ============================================================

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True
)


# ============================================================
# CONVERT TEXT TO NUMERICAL FEATURES
# ============================================================

X = vectorizer.fit_transform(
    training_texts
)


# ============================================================
# CREATE LOGISTIC REGRESSION MODEL
# ============================================================

model = LogisticRegression(
    max_iter=2000,
    random_state=42
)


# ============================================================
# TRAIN MODEL
# ============================================================

model.fit(
    X,
    training_labels
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    "civicai_model.pkl"
)


# ============================================================
# SAVE VECTORIZER
# ============================================================

joblib.dump(
    vectorizer,
    "civicai_vectorizer.pkl"
)


# ============================================================
# TRAINING INFORMATION
# ============================================================

print()
print("==============================================")
print(" CivicAI AI MODEL TRAINING")
print("==============================================")
print()

print(
    f"Training samples : {len(training_texts)}"
)

print(
    "Categories       : "
    + ", ".join(
        sorted(
            set(training_labels)
        )
    )
)

print()

print(
    "Model            : Logistic Regression"
)

print(
    "Vectorizer       : TF-IDF"
)

print()

print(
    "Model saved      : civicai_model.pkl"
)

print(
    "Vectorizer saved : civicai_vectorizer.pkl"
)

print()

print(
    "CivicAI AI model trained successfully!"
)

print("==============================================")