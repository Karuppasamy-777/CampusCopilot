import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path


# ======================================================
# Functions
# ======================================================

def create_institution(row):
    """Convert one Excel row into a CampusCopilot institution."""

    return {
        "institutionCode": f"UGC-{int(row['Sr.No']):04d}",
        "name": row["Name of the University"],
        "searchName": row["Name of the University"].lower().replace('"', ""),
        "type": row["Type"],
        "state": row["state"],
        "address": row["Address"],
        "postalCode": str(row["Zip"]),
        "status": row["Status"],
        "country": "India",
        "source": "UGC",
        "verified": True
    }


def upload_institution(db, institution):
    """Upload one institution to Firestore."""

    doc_id = institution["institutionCode"]

    db.collection("institutions").document(doc_id).set(institution)


def read_ugc_excel(dataset_dir):
    """Read the official UGC dataset."""

    print("📖 Reading UGC dataset...")

    df = pd.read_excel(dataset_dir / "ugc.xlsx", header=1)

    print(f"✅ Loaded {len(df)} universities")

    return df


def import_all_institutions(db, df):
    """Import every institution into Firestore."""

    print("\n🚀 Starting UGC import...\n")

    total = len(df)
    success = 0
    failed = 0

    for index, row in df.iterrows():
        try:
            institution = create_institution(row)

            upload_institution(db, institution)

            success += 1

            print(
                f"[{index + 1}/{total}] "
                f"✅ {institution['institutionCode']} - "
                f"{institution['name']}"
            )

        except Exception as e:
            failed += 1

            print(
                f"[{index + 1}/{total}] "
                f"❌ Failed"
            )

            print(e)

    print("\n===================================")
    print("        IMPORT SUMMARY")
    print("===================================")
    print(f"Total Records : {total}")
    print(f"Successful    : {success}")
    print(f"Failed        : {failed}")
    print("===================================")


# ======================================================
# Main Program
# ======================================================

# Get project folder
BASE_DIR = Path(__file__).resolve().parent

# Firebase connection
cred = credentials.Certificate(BASE_DIR / "firebase-key.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("✅ Successfully connected to Firebase!")

# Dataset folder
DATASET_DIR = BASE_DIR.parent / "datasets"

# Read dataset
ugc_df = read_ugc_excel(DATASET_DIR)

print("\n📋 Column Names")
print(ugc_df.columns.tolist())

print(f"\n📊 Total Universities: {len(ugc_df)}")

# Import every university
import_all_institutions(db, ugc_df)