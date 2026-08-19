# ============================================================
# CIVICAI
# training_data.py
# AI CATEGORY TRAINING DATA
# ============================================================

# ============================================================
# TRAINING TEXT
# ============================================================

training_texts = [

    # ========================================================
    # GARBAGE
    # ========================================================

    "Garbage is dumped on the road",
    "There is a lot of waste near the bus stop",
    "Garbage bins are overflowing",
    "Waste has not been collected for many days",
    "Plastic and garbage are scattered on the street",
    "The public garbage area is full",
    "Garbage is lying on the roadside",
    "The dustbin is overflowing with garbage",
    "People are dumping waste in the street",
    "Household waste is dumped near the road",
    "The garbage collection has not happened",
    "There is rubbish everywhere near the street",
    "Waste is scattered around the bus stand",
    "The garbage container is full",
    "Trash is blocking the roadside",
    "Garbage is creating a bad smell",
    "The street is filled with garbage",
    "Plastic waste is dumped near the road",
    "The garbage truck has not collected waste",
    "Uncollected garbage is piling up",

    # ========================================================
    # POTHOLE
    # ========================================================

    "There is a large pothole on the road",
    "The road has many potholes",
    "A deep pothole is dangerous for vehicles",
    "The street surface is damaged",
    "There is a hole in the middle of the road",
    "Road needs immediate repair",
    "There is a huge pothole near the bus stop",
    "The road is full of potholes",
    "A pothole is causing accidents",
    "There are deep holes on the road",
    "The road surface is broken",
    "A large hole has appeared on the street",
    "Vehicles are getting damaged because of potholes",
    "The road is damaged and needs repair",
    "There is a dangerous pothole",
    "The street has a large road hole",
    "Potholes are making the road unsafe",
    "The main road is badly damaged",
    "There are several holes in the road",
    "The road requires urgent repair",

    # ========================================================
    # DRAINAGE
    # ========================================================

    "The drainage is blocked",
    "Sewage water is overflowing onto the road",
    "The drain is full of waste",
    "Dirty water is coming from the drainage",
    "The drainage system is clogged",
    "Water is stagnant because of blocked drains",
    "The drainage is overflowing",
    "The drain is blocked with garbage",
    "Sewage is flowing onto the street",
    "There is stagnant water near the road",
    "The storm water drain is blocked",
    "Dirty drainage water is flooding the street",
    "The drainage pipe is clogged",
    "Waste is blocking the drain",
    "Water is accumulating because the drain is blocked",
    "The sewage drain is overflowing",
    "The roadside drain needs cleaning",
    "Flood water is not draining",
    "The drainage channel is blocked",
    "The street is flooded because of drainage problems",

    # ========================================================
    # STREETLIGHT
    # ========================================================

    "The streetlight is not working",
    "There is no light on the road at night",
    "Street lamp is broken",
    "The street is very dark because the light is not working",
    "Several streetlights are not functioning",
    "The road needs a new streetlight",
    "The streetlight has stopped working",
    "The lamp post is not working",
    "There is no street light in this area",
    "The road is dark at night",
    "Street lights are broken",
    "The street lamp needs repair",
    "The streetlight is damaged",
    "The lamp is not turning on",
    "The road has poor lighting",
    "The streetlight has been off for many days",
    "Several lamps are not working",
    "The street is unsafe because there is no lighting",
    "The public light is not functioning",
    "The lamp post needs maintenance",

    # ========================================================
    # WATER
    # ========================================================

    "There is no water supply",
    "Water is leaking from the pipeline",
    "The public water pipe is broken",
    "There is a water shortage in the area",
    "Drinking water is not available",
    "A water pipeline has burst",
    "There is no drinking water",
    "The water supply has stopped",
    "A pipe is leaking water",
    "The public water pipeline is damaged",
    "There is a water leakage near the road",
    "Water is not reaching the houses",
    "The water pipe has broken",
    "There is a shortage of drinking water",
    "The pipeline is leaking",
    "Water supply is unavailable",
    "A broken pipe is wasting water",
    "The area has no water",
    "Water is leaking from a broken pipe",
    "The water distribution pipeline needs repair"
]


# ============================================================
# TRAINING LABELS
# ============================================================

training_labels = [

    # Garbage - 20
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",
    "Garbage",

    # Pothole - 20
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",
    "Pothole",

    # Drainage - 20
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",
    "Drainage",

    # Streetlight - 20
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",
    "Streetlight",

    # Water - 20
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water",
    "Water"
]


# ============================================================
# VALIDATION
# ============================================================

if len(training_texts) != len(training_labels):

    raise ValueError(
        "Training texts and labels count do not match!"
    )


print(
    f"CivicAI training dataset loaded: "
    f"{len(training_texts)} samples"
)