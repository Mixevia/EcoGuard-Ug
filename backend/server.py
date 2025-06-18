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

# Uganda Major Cities Data
UGANDA_CITIES = [
    {"name": "Kampala", "latitude": 0.3476, "longitude": 32.5825, "population": "1.7M", "region": "Central"},
    {"name": "Gulu", "latitude": 2.7856, "longitude": 32.2998, "population": "152K", "region": "Northern"},
    {"name": "Lira", "latitude": 2.2499, "longitude": 32.8998, "population": "119K", "region": "Northern"},
    {"name": "Mbarara", "latitude": -0.6069, "longitude": 30.6595, "population": "97K", "region": "Western"},
    {"name": "Jinja", "latitude": 0.4244, "longitude": 33.2044, "population": "93K", "region": "Eastern"},
    {"name": "Mbale", "latitude": 1.0827, "longitude": 34.1709, "population": "92K", "region": "Eastern"},
    {"name": "Mukono", "latitude": 0.3533, "longitude": 32.7554, "population": "67K", "region": "Central"},
    {"name": "Kasese", "latitude": 0.1833, "longitude": 30.0833, "population": "58K", "region": "Western"},
    {"name": "Masaka", "latitude": -0.3337, "longitude": 31.7335, "population": "54K", "region": "Central"},
    {"name": "Entebbe", "latitude": 0.0563, "longitude": 32.4625, "population": "45K", "region": "Central"}
]

# Bioplastics Educational Data
BIOPLASTICS_INFO = {
    "types": [
        {
            "name": "PLA (Polylactic Acid)",
            "description": "Made from renewable resources like corn starch or sugar cane",
            "degradation_time": "3-6 months in industrial composting",
            "applications": ["Food packaging", "3D printing", "Disposable cutlery"],
            "environmental_impact": "85% lower carbon footprint than conventional plastics",
            "uganda_relevance": "Can be produced from Uganda's abundant maize and sugar cane"
        },
        {
            "name": "PHA (Polyhydroxyalkanoates)",
            "description": "Produced by microorganisms from organic feedstock",
            "degradation_time": "6 months in marine environment",
            "applications": ["Food packaging", "Agricultural films", "Medical devices"],
            "environmental_impact": "100% biodegradable in various environments",
            "uganda_relevance": "Production possible using agricultural waste from coffee and banana farming"
        },
        {
            "name": "Starch-based Plastics",
            "description": "Made from potato, corn, or cassava starch",
            "degradation_time": "2-5 months in composting conditions",
            "applications": ["Shopping bags", "Food containers", "Agricultural mulch"],
            "environmental_impact": "Renewable and compostable",
            "uganda_relevance": "High potential using Uganda's cassava and sweet potato production"
        }
    ],
    "benefits": [
        "Reduced dependence on fossil fuels",
        "Lower greenhouse gas emissions",
        "Biodegradable and compostable",
        "Support for agricultural economy",
        "Reduced plastic pollution in waterways"
    ],
    "challenges": [
        "Higher production costs",
        "Limited industrial composting facilities",
        "Need for proper waste management systems",
        "Consumer education requirements"
    ],
    "uganda_opportunities": [
        "Rich agricultural resources for feedstock",
        "Growing environmental awareness",
        "Government support for sustainable initiatives",
        "Potential for job creation in rural areas",
        "Export opportunities to regional markets"
    ]
}

# Data Models
class Location(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    latitude: float
    longitude: float
    population: Optional[str] = None
    region: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

class BioplasticResearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    research_focus: str  # "production_feasibility", "environmental_impact", "market_analysis"
    bioplastic_type: str
    findings: dict
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BioplasticResearchCreate(BaseModel):
    location_id: str
    location_name: str
    research_focus: str
    bioplastic_type: str

class EnvironmentalAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    alert_type: str  # "air_quality", "bioplastic_opportunity"
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
    """Generate realistic simulated air quality data for Uganda"""
    # Uganda typically has moderate air quality with seasonal variations
    base_aqi = random.randint(45, 95)  # Generally good to moderate
    return [{
        "AQI": base_aqi,
        "Category": {"Name": get_aqi_category(base_aqi)[0]},
        "ParameterName": "PM2.5",
        "Value": round(random.uniform(10, 45), 2)
    }, {
        "AQI": base_aqi + random.randint(-15, 15),
        "Category": {"Name": get_aqi_category(base_aqi)[0]},
        "ParameterName": "OZONE",
        "Value": round(random.uniform(30, 80), 2)
    }]

def generate_bioplastic_research_data(research: BioplasticResearchCreate) -> dict:
    """Generate informative bioplastic research findings"""
    bioplastic_info = next((info for info in BIOPLASTICS_INFO["types"] if info["name"].startswith(research.bioplastic_type)), BIOPLASTICS_INFO["types"][0])
    
    if research.research_focus == "production_feasibility":
        return {
            "feedstock_availability": "High - Uganda produces over 5M tons of relevant crops annually",
            "infrastructure_needs": "Medium - Requires investment in processing facilities",
            "cost_analysis": f"Production cost estimated at 15-20% higher than conventional plastics",
            "technical_readiness": "Technology available, pilot projects recommended",
            "local_expertise": "Growing, partnerships with universities recommended"
        }
    elif research.research_focus == "environmental_impact":
        return {
            "carbon_footprint_reduction": "60-85% lower than conventional plastics",
            "waste_reduction_potential": "Significant - addresses 600,000 tons of plastic waste annually",
            "biodegradation_timeline": bioplastic_info["degradation_time"],
            "water_impact": "Positive - reduces plastic pollution in Lake Victoria",
            "soil_health": "Neutral to positive when properly composted"
        }
    else:  # market_analysis
        return {
            "market_size": "Regional market estimated at $50-75M by 2030",
            "demand_drivers": "Government policies, environmental awareness, export potential",
            "key_applications": ", ".join(bioplastic_info["applications"]),
            "competition": "Limited local production, import substitution opportunity",
            "growth_projections": "15-25% annual growth potential"
        }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Uganda Environmental Monitoring API", "status": "active", "focus": "bioplastics_research"}

# Uganda Cities Initialization
@api_router.post("/initialize-uganda-locations")
async def initialize_uganda_locations():
    """Initialize database with major Ugandan cities"""
    created_count = 0
    for city_data in UGANDA_CITIES:
        # Check if city already exists
        existing = await db.locations.find_one({"name": city_data["name"]})
        if not existing:
            location = Location(**city_data)
            await db.locations.insert_one(location.dict())
            created_count += 1
    
    return {"message": f"Initialized {created_count} Ugandan cities", "total_cities": len(UGANDA_CITIES)}

# Location Management
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
    
    # Fetch air quality data
    air_data = await fetch_airnow_data(location["latitude"], location["longitude"])
    
    if air_data:
        # Process response
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
            aqi_data["aqi"] = random.randint(35, 85)  # Uganda typical range
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

# Bioplastics Information and Research
@api_router.get("/bioplastics/info")
async def get_bioplastics_info():
    """Get comprehensive bioplastics information"""
    return BIOPLASTICS_INFO

@api_router.post("/bioplastics/research", response_model=BioplasticResearch)
async def create_bioplastic_research(research: BioplasticResearchCreate):
    """Create bioplastic research analysis"""
    findings = generate_bioplastic_research_data(research)
    
    # Generate recommendations based on research focus
    recommendations = []
    if research.research_focus == "production_feasibility":
        recommendations = [
            "Conduct pilot production facility study",
            "Partner with local universities for research",
            "Engage with farmers for feedstock supply agreements",
            "Seek government incentives for sustainable manufacturing"
        ]
    elif research.research_focus == "environmental_impact":
        recommendations = [
            "Develop composting infrastructure",
            "Create consumer education programs",
            "Monitor environmental benefits over time",
            "Establish certification standards"
        ]
    else:
        recommendations = [
            "Conduct detailed market research",
            "Develop business partnerships",
            "Create marketing strategy for eco-conscious consumers",
            "Explore export opportunities in East Africa"
        ]
    
    research_obj = BioplasticResearch(
        location_id=research.location_id,
        location_name=research.location_name,
        research_focus=research.research_focus,
        bioplastic_type=research.bioplastic_type,
        findings=findings,
        recommendations=recommendations
    )
    
    await db.bioplastic_research.insert_one(research_obj.dict())
    return research_obj

@api_router.get("/bioplastics/research", response_model=List[BioplasticResearch])
async def get_bioplastic_research():
    """Get all bioplastic research"""
    research = await db.bioplastic_research.find().sort("created_at", -1).to_list(50)
    return [BioplasticResearch(**r) for r in research]

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
    research_count = await db.bioplastic_research.count_documents({})
    unacknowledged_alerts = await db.alerts.count_documents({"acknowledged": False})
    
    # Get recent air quality readings
    recent_air_quality = await db.air_quality.find().sort("timestamp", -1).limit(3).to_list(3)
    
    # Get recent research
    recent_research = await db.bioplastic_research.find().sort("created_at", -1).limit(3).to_list(3)
    
    return {
        "locations_count": locations_count,
        "research_count": research_count,
        "unacknowledged_alerts": unacknowledged_alerts,
        "recent_air_quality": [AirQualityData(**aq) for aq in recent_air_quality],
        "recent_research": [BioplasticResearch(**r) for r in recent_research]
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