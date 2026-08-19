import joblib


# Load trained model
model = joblib.load("civicai_model.pkl")

# Load TF-IDF vectorizer
vectorizer = joblib.load("civicai_vectorizer.pkl")


def predict_category(text):

    text_vector = vectorizer.transform([text])

    prediction = model.predict(text_vector)

    return prediction[0]


# Test complaints
complaints = [
    "There is a huge pothole near the school",
    "Garbage is overflowing near the bus stop",
    "The streetlight is not working at night",
    "The drainage is blocked and dirty water is overflowing",
    "There is no water supply in our street"
]


for complaint in complaints:

    category = predict_category(complaint)

    print()
    print("Complaint:", complaint)
    print("Predicted Category:", category)