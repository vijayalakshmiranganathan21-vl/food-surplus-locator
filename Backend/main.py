import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SECRET_KEY")

supabase = create_client(supabase_url, supabase_key)

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Food Surplus Locator Backend is running!"
    }


@app.get("/test")
def test():
    return {
        "message": "API connection is working!"
    }


class Donation(BaseModel):
    food_name: str
    quantity: str
    location: str


@app.post("/donations")
def create_donation(donation: Donation):
    try:
        response = supabase.table("donations").insert({
            "food_name": donation.food_name,
            "quantity": donation.quantity,
            "location": donation.location
        }).execute()

        return {
            "message": "Donation saved successfully!",
            "data": response.data
        }

    except Exception as e:
        return {
            "message": "Supabase error",
            "error": str(e)
        }


@app.get("/donations")
def get_donations():
    response = supabase.table("donations").select("*").execute()

    return {
        "message": "Donations fetched successfully!",
        "data": response.data
    }
@app.put("/donations/{donation_id}")
def accept_donation(donation_id: int):
    try:
        response = supabase.table("donations").update({
            "status": "Accepted"
        }).eq("id", donation_id).execute()

        return {
            "message": "Donation accepted successfully!",
            "data": response.data
        }

    except Exception as e:
        return {
            "message": "Supabase error",
            "error": str(e)
        }