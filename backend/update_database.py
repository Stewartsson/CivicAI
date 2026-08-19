import sqlite3

connection = sqlite3.connect("civicai.db")

cursor = connection.cursor()

cursor.execute(
    "ALTER TABLE complaints ADD COLUMN severity VARCHAR(50) DEFAULT 'Medium'"
)

cursor.execute(
    "ALTER TABLE complaints ADD COLUMN priority VARCHAR(50) DEFAULT 'Important'"
)

connection.commit()

connection.close()

print("Database updated successfully!")