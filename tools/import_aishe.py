import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path


# ======================================================
# Helper Functions
# ======================================================

def get_value(row, column):
    """Safely get a value from a row."""
    if column in row.index and pd.notna(row[column]):
        return str(row[column]).strip()
    return ""


def create_institution(row):
    """Convert one AISHE row into a CampusCopilot institution."""

    return {
        "institutionCode": f"AISHE-{get_value(row, 'Aishe Code')}",
        "name": get_value(row, "Name"),
        "searchName": get_value(row, "Name").lower(),
        "type": get_value(row, "College Type"),
        "state": get_value(row, "State"),
        "district": get_value(row, "District"),
        "address": get_value(row, "Location"),
        "website": get_value(row, "Website"),
        "establishedYear": get_value(row, "Year Of Establishment"),
        "management": get_value(row, "Manegement"),
        "universityCode": get_value(row, "University Aishe Code"),
        "universityName": get_value(row, "University Name"),
        "universityType": get_value(row, "University Type"),
        "country": "India",
        "source": "AISHE",
        "verified": True,
    }


def upload_institution(db, institution):
    """Upload one institution to Firestore."""

    db.collection("institutions").document(
        institution["institutionCode"]
    ).set(institution)


def read_aishe_excel(dataset_dir):
    """Read AISHE Excel dataset."""

    print("📖 Reading AISHE dataset...")

    # Row 3 contains the headers
    df = pd.read_excel(
        dataset_dir / "aishe.xlsx",
        header=2
    )

    # Remove leading/trailing spaces from headers
    df.columns = df.columns.str.strip()

    print(f"✅ Loaded {len(df)} institutions")

    print("\n📋 Column Names")
    print(df.columns.tolist())

    return df


def import_all_institutions(db, df):
    """Import all AISHE institutions."""

    print("\n🚀 Starting AISHE Import...\n")

    total = len(df)
    success = 0
    failed = 0

    for index, row in df.iterrows():

        try:

            institution = create_institution(row)

            # Skip rows without AISHE Code
            if institution["institutionCode"] == "AISHE-":
                failed += 1
                continue

            upload_institution(db, institution)

            success += 1

            if success % 100 == 0:
                print(f"✅ Imported {success}/{total}")

        except Exception as e:

            failed += 1

            print(f"❌ Row {index + 1} Failed")

            print(e)

    print("\n====================================")
    print("        AISHE IMPORT SUMMARY")
    print("====================================")
    print(f"Total Records : {total}")
    print(f"Successful    : {success}")
    print(f"Failed        : {failed}")
    print("====================================")


# ======================================================
# Main Program
# ======================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR.parent / "datasets"

cred = credentials.Certificate(BASE_DIR / "firebase-key.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("✅ Successfully connected to Firebase!")

aishe_df = read_aishe_excel(DATASET_DIR)

import_all_institutions(db, aishe_df)