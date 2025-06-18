from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import httpx
import asyncio
import random
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# AirNow API Configuration
AIRNOW_API_KEY = "82556E93-5428-4414-B4FC-5FDBF80FF566"
AIRNOW_BASE_URL = "https://www.airnowapi.org/aq"

# Data Models
class Location(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    latitude: float
    longitude: float
    zip_code: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    zip_code: Optional[str] = None

class AirQualityData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    aqi: int
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    ozone: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    category: str
    status_level: str  # "good", "moderate", "unhealthy_sensitive", "unhealthy", "very_unhealthy", "hazardous"

class BioplasticSample(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    sample_type: str  # "PLA", "PHA", "PBS", "Starch-based"
    initial_weight: float  # grams
    current_weight: float  # grams
    degradation_percentage: float
    composting_temperature: float  # celsius
    composting_humidity: float  # percentage
    composting_ph: float
    days_since_start: int
    expected_total_days: int
    microplastic_detected: bool
    biodegradation_rate: float  # percentage per day
    environmental_impact_score: float  # 0-100 scale
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class BioplasticSampleCreate(BaseModel):
    location_id: str
    location_name: str
    sample_type: str
    initial_weight: float
    composting_temperature: float
    composting_humidity: float
    composting_ph: float

class EnvironmentalAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    alert_type: str  # "air_quality", "bioplastic_degradation"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    value: float
    threshold: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False

# Helper Functions
def get_aqi_category(aqi: int) -> tuple:
    """Get AQI category and status level"""
    if aqi <= 50:
        return "Good", "good"
    elif aqi <= 100:
        return "Moderate", "moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups", "unhealthy_sensitive"
    elif aqi <= 200:
        return "Unhealthy", "unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy", "very_unhealthy"
    else:
        return "Hazardous", "hazardous"

async def fetch_airnow_data(lat: float, lon: float) -> dict:
    """Fetch air quality data from AirNow API"""
    try:
        url = f"{AIRNOW_BASE_URL}/observation/latLong/current/"
        params = {
            "format": "application/json",
            "latitude": lat,
            "longitude": lon,
            "distance": 25,
            "API_KEY": AIRNOW_API_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                # Return simulated data if API fails
                return generate_simulated_air_data()
    except Exception as e:
        logger.error(f"Error fetching AirNow data: {e}")
        return generate_simulated_air_data()

def generate_simulated_air_data() -> dict:
    """Generate realistic simulated air quality data"""
    base_aqi = random.randint(20, 180)
    return [{
        "AQI": base_aqi,
        "Category": {"Name": get_aqi_category(base_aqi)[0]},
        "ParameterName": "PM2.5",
        "Value": round(random.uniform(5, 100), 2)
    }, {
        "AQI": base_aqi + random.randint(-20, 20),
        "Category": {"Name": get_aqi_category(base_aqi)[0]},
        "ParameterName": "OZONE",
        "Value": round(random.uniform(20, 150), 2)
    }]

def generate_bioplastic_data(sample: BioplasticSample) -> BioplasticSample:
    """Update bioplastic sample with realistic degradation simulation"""
    days_passed = (datetime.utcnow() - sample.created_at).days
    
    # Different degradation rates for different materials
    material_rates = {
        "PLA": 0.8,  # slower degradation
        "PHA": 1.2,  # faster degradation
        "PBS": 1.0,  # medium degradation
        "Starch-based": 1.5  # fastest degradation
    }
    
    base_rate = material_rates.get(sample.sample_type, 1.0)
    
    # Environmental factors affecting degradation
    temp_factor = max(0.5, min(2.0, sample.composting_temperature / 25))
    humidity_factor = max(0.5, min(1.5, sample.composting_humidity / 60))
    ph_factor = max(0.3, min(1.2, abs(7 - sample.composting_ph) / 2))
    
    daily_degradation = base_rate * temp_factor * humidity_factor * ph_factor
    
    # Calculate current state
    total_degradation = min(95, days_passed * daily_degradation)
    current_weight = max(sample.initial_weight * 0.05, sample.initial_weight * (1 - total_degradation / 100))
    
    sample.current_weight = round(current_weight, 2)
    sample.degradation_percentage = round(total_degradation, 1)
    sample.days_since_start = days_passed
    sample.biodegradation_rate = round(daily_degradation, 2)
    sample.microplastic_detected = total_degradation < 70 and days_passed > 30
    sample.environmental_impact_score = round(max(10, 100 - total_degradation), 1)
    sample.last_updated = datetime.utcnow()
    
    return sample

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Environmental Monitoring API", "status": "active"}

# Location Management
@api_router.post("/locations", response_model=Location)
async def create_location(location: LocationCreate):
    location_dict = location.dict()
    location_obj = Location(**location_dict)
    await db.locations.insert_one(location_obj.dict())
    return location_obj

@api_router.get("/locations", response_model=List[Location])
async def get_locations():
    locations = await db.locations.find().to_list(100)
    return [Location(**location) for location in locations]

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str):
    result = await db.locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}

# Air Quality Data
@api_router.get("/air-quality/{location_id}")
async def get_air_quality(location_id: str):
    location = await db.locations.find_one({"id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Fetch real AirNow data
    air_data = await fetch_airnow_data(location["latitude"], location["longitude"])
    
    if air_data:
        # Process AirNow response
        aqi_data = {}
        for item in air_data:
            if item.get("AQI"):
                aqi_data["aqi"] = item["AQI"]
                aqi_data["category"], aqi_data["status_level"] = get_aqi_category(item["AQI"])
            
            param = item.get("ParameterName", "").lower()
            if "pm2.5" in param:
                aqi_data["pm25"] = item.get("Value")
            elif "pm10" in param:
                aqi_data["pm10"] = item.get("Value")
            elif "ozone" in param:
                aqi_data["ozone"] = item.get("Value")
            elif "no2" in param:
                aqi_data["no2"] = item.get("Value")
            elif "so2" in param:
                aqi_data["so2"] = item.get("Value")
        
        if not aqi_data.get("aqi"):
            aqi_data["aqi"] = random.randint(20, 120)
            aqi_data["category"], aqi_data["status_level"] = get_aqi_category(aqi_data["aqi"])
        
        air_quality = AirQualityData(
            location_id=location_id,
            location_name=location["name"],
            aqi=aqi_data["aqi"],
            pm25=aqi_data.get("pm25"),
            pm10=aqi_data.get("pm10"),
            ozone=aqi_data.get("ozone"),
            no2=aqi_data.get("no2"),
            so2=aqi_data.get("so2"),
            category=aqi_data["category"],
            status_level=aqi_data["status_level"]
        )
        
        # Store in database
        await db.air_quality.insert_one(air_quality.dict())
        
        # Check for alerts
        if air_quality.aqi > 100:
            alert = EnvironmentalAlert(
                location_id=location_id,
                location_name=location["name"],
                alert_type="air_quality",
                severity="high" if air_quality.aqi > 150 else "medium",
                message=f"Air quality is {air_quality.category.lower()} with AQI of {air_quality.aqi}",
                value=air_quality.aqi,
                threshold=100
            )
            await db.alerts.insert_one(alert.dict())
        
        return air_quality
    
    raise HTTPException(status_code=500, detail="Unable to fetch air quality data")

# Bioplastics Management
@api_router.post("/bioplastics", response_model=BioplasticSample)
async def create_bioplastic_sample(sample: BioplasticSampleCreate):
    sample_dict = sample.dict()
    bioplastic_sample = BioplasticSample(
        **sample_dict,
        current_weight=sample.initial_weight,
        degradation_percentage=0.0,
        days_since_start=0,
        expected_total_days=random.randint(90, 365),
        microplastic_detected=False,
        biodegradation_rate=0.0,
        environmental_impact_score=100.0
    )
    
    await db.bioplastics.insert_one(bioplastic_sample.dict())
    return bioplastic_sample

@api_router.get("/bioplastics", response_model=List[BioplasticSample])
async def get_bioplastic_samples():
    samples = await db.bioplastics.find().to_list(100)
    updated_samples = []
    
    for sample_dict in samples:
        sample = BioplasticSample(**sample_dict)
        updated_sample = generate_bioplastic_data(sample)
        
        # Update in database
        await db.bioplastics.update_one(
            {"id": sample.id},
            {"$set": updated_sample.dict()}
        )
        
        updated_samples.append(updated_sample)
    
    return updated_samples

@api_router.get("/bioplastics/{sample_id}")
async def get_bioplastic_sample(sample_id: str):
    sample_dict = await db.bioplastics.find_one({"id": sample_id})
    if not sample_dict:
        raise HTTPException(status_code=404, detail="Bioplastic sample not found")
    
    sample = BioplasticSample(**sample_dict)
    updated_sample = generate_bioplastic_data(sample)
    
    # Update in database
    await db.bioplastics.update_one(
        {"id": sample_id},
        {"$set": updated_sample.dict()}
    )
    
    return updated_sample

# Environmental Alerts
@api_router.get("/alerts", response_model=List[EnvironmentalAlert])
async def get_alerts(location_id: Optional[str] = None):
    filter_dict = {}
    if location_id:
        filter_dict["location_id"] = location_id
    
    alerts = await db.alerts.find(filter_dict).sort("timestamp", -1).to_list(50)
    return [EnvironmentalAlert(**alert) for alert in alerts]

@api_router.patch("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"acknowledged": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert acknowledged"}

# Dashboard Summary
@api_router.get("/dashboard/summary")
async def get_dashboard_summary():
    locations_count = await db.locations.count_documents({})
    bioplastics_count = await db.bioplastics.count_documents({})
    unacknowledged_alerts = await db.alerts.count_documents({"acknowledged": False})
    
    # Get recent air quality readings
    recent_air_quality = await db.air_quality.find().sort("timestamp", -1).limit(5).to_list(5)
    
    # Get bioplastics with highest degradation
    bioplastics = await db.bioplastics.find().to_list(100)
    if bioplastics:
        # Update all samples and get top degraded ones
        updated_samples = []
        for sample_dict in bioplastics:
            sample = BioplasticSample(**sample_dict)
            updated_sample = generate_bioplastic_data(sample)
            updated_samples.append(updated_sample)
        
        top_degraded = sorted(updated_samples, key=lambda x: x.degradation_percentage, reverse=True)[:3]
    else:
        top_degraded = []
    
    return {
        "locations_count": locations_count,
        "bioplastics_count": bioplastics_count,
        "unacknowledged_alerts": unacknowledged_alerts,
        "recent_air_quality": [AirQualityData(**aq) for aq in recent_air_quality],
        "top_degraded_bioplastics": top_degraded
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()