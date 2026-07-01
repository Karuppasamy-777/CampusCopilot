import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path


def connect_to_firebase():
    """
    Connect to Firebase and return a Firestore client.
    """

    BASE_DIR = Path(__file__).resolve().parent

    cred = credentials.Certificate(BASE_DIR / "firebase-key.json")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    print("✅ Connected to Firebase!")

    return firestore.client()


def upload_institution(db, institution):
    """
    Upload one institution to Firestore.
    """

    doc_id = institution["institutionCode"]

    db.collection("institutions").document(doc_id).set(institution)