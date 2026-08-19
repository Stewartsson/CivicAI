import joblib


# Load trained models
severity_model = joblib.load(
    "civicai_severity_model.pkl"
)

priority_model = joblib.load(
    "civicai_priority_model.pkl"
)


# Load vectorizer
vectorizer = joblib.load(
    "civicai_severity_vectorizer.pkl"
)


def analyse_complaint(text):

    # Convert complaint into TF-IDF features
    text_vector = vectorizer.transform([text])

    # Predict severity
    severity = severity_model.predict(text_vector)[0]

    # Predict priority
    priority = priority_model.predict(text_vector)[0]

    return severity, priority


# Test complaints
complaints = [

    "A small amount of garbage is lying on the roadside",

    "The streetlight is not working at night",

    "Huge pothole near school is causing accidents",

    "Sewage water is overflowing onto the main road",

    "Major water pipeline has burst and the entire street is flooded"
]


# Test each complaint
for complaint in complaints:

    severity, priority = analyse_complaint(
        complaint
    )

    print()
    print("Complaint:", complaint)
    print("Severity:", severity)
    print("Priority:", priority)