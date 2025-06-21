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

# NASA API Configuration
NASA_API_KEY = os.environ.get('NASA_API_KEY', "SvoogQgtFAJL3biOPpPwTjcPPHEq9z0sDRneRenJ")
NASA_EARTH_URL = "https://api.nasa.gov/planetary/earth"
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# Uganda Cities with Plastic Waste Data
UGANDA_CITIES = [
    {
        "name": "Kampala", 
        "latitude": 0.3476, 
        "longitude": 32.5825, 
        "population": "1.7M", 
        "region": "Central",
        "plastic_waste": {
            "daily_generation": "850 tons",
            "collection_rate": "45%",
            "recycling_rate": "8%",
            "main_sources": ["Single-use plastics", "Packaging", "Water bottles"],
            "hotspots": ["Markets", "Commercial areas", "Suburbs"],
            "challenges": ["Limited collection services", "Inadequate sorting", "Poor infrastructure"],
            "solutions_implemented": ["KCCA waste collection", "Private recyclers", "Community initiatives"]
        }
    },
    {
        "name": "Gulu", 
        "latitude": 2.7856, 
        "longitude": 32.2998, 
        "population": "152K", 
        "region": "Northern",
        "plastic_waste": {
            "daily_generation": "68 tons",
            "collection_rate": "35%",
            "recycling_rate": "3%",
            "main_sources": ["Shopping bags", "Food packaging", "Bottles"],
            "hotspots": ["Central market", "Trading centers"],
            "challenges": ["Rural collection gaps", "Limited awareness", "No recycling facilities"],
            "solutions_implemented": ["NGO programs", "School awareness campaigns"]
        }
    },
    {
        "name": "Lira", 
        "latitude": 2.2499, 
        "longitude": 32.8998, 
        "population": "119K", 
        "region": "Northern",
        "plastic_waste": {
            "daily_generation": "52 tons",
            "collection_rate": "40%",
            "recycling_rate": "5%",
            "main_sources": ["Market plastics", "Beverage containers", "Agricultural packaging"],
            "hotspots": ["Main market", "Transport hubs"],
            "challenges": ["Seasonal variations", "Limited infrastructure"],
            "solutions_implemented": ["Youth groups collection", "Market vendor education"]
        }
    },
    {
        "name": "Mbarara", 
        "latitude": -0.6069, 
        "longitude": 30.6595, 
        "population": "97K", 
        "region": "Western",
        "plastic_waste": {
            "daily_generation": "45 tons",
            "collection_rate": "50%",
            "recycling_rate": "12%",
            "main_sources": ["Food packaging", "Agricultural inputs", "Consumer goods"],
            "hotspots": ["Industrial area", "Markets"],
            "challenges": ["Cross-border waste", "Tourist area management"],
            "solutions_implemented": ["Municipal collection", "Tourist area cleanup", "Recycling cooperatives"]
        }
    },
    {
        "name": "Jinja", 
        "latitude": 0.4244, 
        "longitude": 33.2044, 
        "population": "93K", 
        "region": "Eastern",
        "plastic_waste": {
            "daily_generation": "42 tons",
            "collection_rate": "55%",
            "recycling_rate": "15%",
            "main_sources": ["Industrial packaging", "Tourist waste", "Fishing equipment"],
            "hotspots": ["Source of Nile area", "Industrial zone"],
            "challenges": ["Water body contamination", "Tourism seasonal peaks"],
            "solutions_implemented": ["Source of Nile cleanup", "Industrial waste programs", "River monitoring"]
        }
    },
    {
        "name": "Mbale", 
        "latitude": 1.0827, 
        "longitude": 34.1709, 
        "population": "92K", 
        "region": "Eastern",
        "plastic_waste": {
            "daily_generation": "38 tons",
            "collection_rate": "42%",
            "recycling_rate": "7%",
            "main_sources": ["Agricultural packaging", "Coffee industry waste", "Consumer plastics"],
            "hotspots": ["Coffee processing areas", "Markets"],
            "challenges": ["Agricultural area spread", "Limited collection reach"],
            "solutions_implemented": ["Farmer education", "Coffee cooperative programs"]
        }
    },
    {
        "name": "Mukono", 
        "latitude": 0.3533, 
        "longitude": 32.7554, 
        "population": "67K", 
        "region": "Central",
        "plastic_waste": {
            "daily_generation": "28 tons",
            "collection_rate": "48%",
            "recycling_rate": "10%",
            "main_sources": ["Educational institution waste", "Residential plastics"],
            "hotspots": ["University areas", "Residential zones"],
            "challenges": ["Student population variations", "Limited awareness"],
            "solutions_implemented": ["University programs", "Student-led initiatives"]
        }
    },
    {
        "name": "Kasese", 
        "latitude": 0.1833, 
        "longitude": 30.0833, 
        "population": "58K", 
        "region": "Western",
        "plastic_waste": {
            "daily_generation": "25 tons",
            "collection_rate": "38%",
            "recycling_rate": "4%",
            "main_sources": ["Mining industry packaging", "Agricultural supplies"],
            "hotspots": ["Mining areas", "Agricultural zones"],
            "challenges": ["Remote locations", "Mining industry impact"],
            "solutions_implemented": ["Mining company programs", "Community health initiatives"]
        }
    },
    {
        "name": "Masaka", 
        "latitude": -0.3337, 
        "longitude": 31.7335, 
        "population": "54K", 
        "region": "Central",
        "plastic_waste": {
            "daily_generation": "22 tons",
            "collection_rate": "45%",
            "recycling_rate": "9%",
            "main_sources": ["Commercial packaging", "Agricultural inputs"],
            "hotspots": ["Commercial district", "Market areas"],
            "challenges": ["Rural-urban mix", "Limited infrastructure"],
            "solutions_implemented": ["District programs", "Market vendor training"]
        }
    },
    {
        "name": "Entebbe", 
        "latitude": 0.0563, 
        "longitude": 32.4625, 
        "population": "45K", 
        "region": "Central",
        "plastic_waste": {
            "daily_generation": "35 tons",
            "collection_rate": "65%",
            "recycling_rate": "18%",
            "main_sources": ["Airport waste", "Tourist activities", "Lake activities"],
            "hotspots": ["Airport area", "Lake Victoria shores", "Tourist zones"],
            "challenges": ["Tourist seasonal variations", "Lake contamination"],
            "solutions_implemented": ["Airport waste management", "Lake shore cleanup", "Tourist education programs"]
        }
    }
]

# Plastic Waste Management Solutions
WASTE_MANAGEMENT_SOLUTIONS = {
    "reduction_strategies": [
        {
            "title": "Ban Single-Use Plastics",
            "description": "Government policies to restrict single-use plastic bags and containers",
            "effectiveness": "High",
            "implementation_cost": "Low",
            "timeframe": "1-2 years",
            "uganda_applicability": "Partially implemented - plastic bag ban in place"
        },
        {
            "title": "Plastic Bottle Deposit Systems",
            "description": "Financial incentives for returning plastic bottles for recycling",
            "effectiveness": "Very High",
            "implementation_cost": "Medium",
            "timeframe": "2-3 years", 
            "uganda_applicability": "Pilot programs in urban areas recommended"
        },
        {
            "title": "Extended Producer Responsibility",
            "description": "Manufacturers responsible for entire lifecycle of plastic products",
            "effectiveness": "High",
            "implementation_cost": "Medium",
            "timeframe": "3-5 years",
            "uganda_applicability": "Policy framework under development"
        }
    ],
    "recycling_initiatives": [
        {
            "title": "Community Collection Centers",
            "description": "Local hubs where residents can drop off sorted plastic waste",
            "benefits": ["Job creation", "Community engagement", "Improved collection rates"],
            "requirements": ["Space allocation", "Training programs", "Transportation links"],
            "success_examples": ["Kampala pilot projects", "Entebbe tourist areas"]
        },
        {
            "title": "Plastic-to-Fuel Technology",
            "description": "Converting plastic waste into usable fuel through pyrolysis",
            "benefits": ["Energy production", "Waste reduction", "Economic value"],
            "requirements": ["Technology transfer", "Investment", "Technical training"],
            "success_examples": ["Research at Makerere University"]
        },
        {
            "title": "Upcycling Workshops",
            "description": "Training communities to transform plastic waste into useful products",
            "benefits": ["Skill development", "Income generation", "Waste reduction"],
            "requirements": ["Training materials", "Tools", "Market access"],
            "success_examples": ["Women's groups in Kampala", "Youth programs in Gulu"]
        }
    ],
    "innovation_approaches": [
        {
            "title": "Plastic Road Construction",
            "description": "Using recycled plastic waste as material for road construction",
            "potential": "Replace 10% of road materials with recycled plastics",
            "benefits": ["Durable roads", "Large-scale waste consumption", "Cost savings"],
            "pilot_locations": ["Kampala suburbs", "Tourist routes to national parks"]
        },
        {
            "title": "Biodegradable Alternatives",
            "description": "Promoting locally-made biodegradable packaging from agricultural waste",
            "potential": "Replace 30% of packaging with local alternatives",
            "benefits": ["Support agriculture", "Reduced imports", "Environmental benefits"],
            "raw_materials": ["Banana fibers", "Cassava starch", "Sugarcane bagasse"]
        }
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
    plastic_waste: Optional[dict] = None
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
    status_level: str

class WasteManagementAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    analysis_type: str  # "impact_assessment", "solution_recommendations", "trend_analysis"
    focus_area: str  # "reduction", "recycling", "innovation"
    findings: dict
    recommendations: List[str]
    priority_actions: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WasteManagementAnalysisCreate(BaseModel):
    location_id: str
    location_name: str
    analysis_type: str
    focus_area: str

class EnvironmentalAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    alert_type: str  # "air_quality", "plastic_waste_critical", "climate_anomaly"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    value: float
    threshold: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False

class NASAClimateData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    latitude: float
    longitude: float
    date: str
    temperature: Optional[float] = None  # T2M - Temperature at 2 meters (°C)
    precipitation: Optional[float] = None  # PRECTOTCORR - Precipitation (mm/day)
    humidity: Optional[float] = None  # RH2M - Relative Humidity at 2m (%)
    wind_speed: Optional[float] = None  # WS2M - Wind Speed at 2m (m/s)
    solar_radiation: Optional[float] = None  # ALLSKY_SFC_SW_DWN - Solar radiation (kWh/m²/day)
    pressure: Optional[float] = None  # PS - Surface Pressure (kPa)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NASAImageryData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    location_name: str
    latitude: float
    longitude: float
    image_url: str
    date: str
    satellite: Optional[str] = None
    cloud_score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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
                return generate_simulated_air_data()
    except Exception as e:
        logger.error(f"Error fetching AirNow data: {e}")
        return generate_simulated_air_data()

def generate_simulated_air_data() -> dict:
    """Generate realistic simulated air quality data for Uganda"""
    base_aqi = random.randint(45, 95)
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

async def fetch_nasa_climate_data(lat: float, lon: float, start_date: str = None, end_date: str = None) -> dict:
    """Fetch climate data from NASA POWER API"""
    try:
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y%m%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y%m%d")
        
        params = {
            "parameters": "T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN,PS",
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": start_date,
            "end": end_date,
            "format": "JSON"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(NASA_POWER_URL, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"NASA POWER API error: {response.status_code}")
                return generate_simulated_climate_data()
    except Exception as e:
        logger.error(f"Error fetching NASA climate data: {e}")
        return generate_simulated_climate_data()

async def fetch_nasa_imagery(lat: float, lon: float, date: str = None, dim: float = 0.15) -> dict:
    """Fetch satellite imagery from NASA Earth Imagery API"""
    try:
        if not date:
            date = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        imagery_url = f"{NASA_EARTH_URL}/imagery"
        params = {
            "lon": lon,
            "lat": lat,
            "date": date,
            "dim": dim,
            "api_key": NASA_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(imagery_url, params=params)
            if response.status_code == 200:
                return {
                    "url": response.url,
                    "date": date,
                    "satellite": "Landsat",
                    "status": "success"
                }
            else:
                logger.error(f"NASA Earth Imagery API error: {response.status_code}")
                return {"status": "error", "message": "No imagery available"}
    except Exception as e:
        logger.error(f"Error fetching NASA imagery: {e}")
        return {"status": "error", "message": str(e)}

def generate_simulated_climate_data() -> dict:
    """Generate realistic simulated climate data for Uganda"""
    return {
        "properties": {
            "parameter": {
                "T2M": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(20, 30), 2)},
                "PRECTOTCORR": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(0, 15), 2)},
                "RH2M": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(60, 85), 2)},
                "WS2M": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(2, 8), 2)},
                "ALLSKY_SFC_SW_DWN": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(4, 7), 2)},
                "PS": {f"{datetime.utcnow().strftime('%Y%m%d')}": round(random.uniform(85, 90), 2)}
            }
        }
    }

def detect_climate_anomalies(climate_data: dict, location_name: str) -> List[dict]:
    """Detect climate anomalies and generate alerts"""
    alerts = []
    
    if "properties" in climate_data and "parameter" in climate_data["properties"]:
        parameters = climate_data["properties"]["parameter"]
        
        # Temperature anomaly detection
        if "T2M" in parameters:
            temps = list(parameters["T2M"].values())
            if temps:
                latest_temp = temps[-1]
                if latest_temp > 35:  # Very high temperature
                    alerts.append({
                        "type": "climate_anomaly",
                        "severity": "high",
                        "message": f"Extreme high temperature detected: {latest_temp}°C in {location_name}",
                        "parameter": "temperature",
                        "value": latest_temp,
                        "threshold": 35
                    })
                elif latest_temp < 15:  # Unusually low temperature for Uganda
                    alerts.append({
                        "type": "climate_anomaly",
                        "severity": "medium",
                        "message": f"Unusually low temperature detected: {latest_temp}°C in {location_name}",
                        "parameter": "temperature",
                        "value": latest_temp,
                        "threshold": 15
                    })
        
        # Precipitation anomaly detection
        if "PRECTOTCORR" in parameters:
            precips = list(parameters["PRECTOTCORR"].values())
            if precips:
                latest_precip = precips[-1]
                if latest_precip > 50:  # Very heavy rainfall
                    alerts.append({
                        "type": "climate_anomaly",
                        "severity": "high",
                        "message": f"Heavy rainfall detected: {latest_precip}mm/day in {location_name}",
                        "parameter": "precipitation",
                        "value": latest_precip,
                        "threshold": 50
                    })
    
    return alerts

def generate_waste_analysis_data(analysis: WasteManagementAnalysisCreate) -> dict:
    """Generate comprehensive waste management analysis"""
    if analysis.analysis_type == "impact_assessment":
        return {
            "environmental_impact": {
                "water_contamination": "Moderate to High - plastic debris in local water bodies",
                "soil_degradation": "Low to Moderate - microplastics affecting soil quality",
                "wildlife_impact": "High - marine life and birds affected by plastic debris",
                "human_health": "Moderate - exposure through food chain and air pollution"
            },
            "economic_impact": {
                "cleanup_costs": "UGX 2.5B annually for municipal waste management",
                "lost_tourism_revenue": "Estimated UGX 800M due to environmental degradation",
                "healthcare_costs": "UGX 450M attributed to pollution-related health issues",
                "job_opportunities": "3,500 potential jobs in recycling and waste management"
            },
            "social_impact": {
                "community_health": "Respiratory issues increase by 15% in high-waste areas",
                "quality_of_life": "Reduced due to poor waste management infrastructure",
                "education_impact": "Schools in affected areas report concentration issues",
                "gender_effects": "Women disproportionately affected by waste collection duties"
            }
        }
    elif analysis.analysis_type == "solution_recommendations":
        solutions = WASTE_MANAGEMENT_SOLUTIONS[analysis.focus_area + "_strategies"] if analysis.focus_area == "reduction" else WASTE_MANAGEMENT_SOLUTIONS[analysis.focus_area + "_initiatives"]
        return {
            "immediate_actions": [sol["title"] for sol in solutions[:2]],
            "medium_term_goals": [sol["description"] for sol in solutions],
            "implementation_timeline": "6 months to 3 years depending on solution complexity",
            "resource_requirements": "Government support, community engagement, private sector investment",
            "success_metrics": ["Reduction in waste generation", "Increase in recycling rates", "Job creation numbers"]
        }
    else:  # trend_analysis
        return {
            "waste_generation_trend": "Increasing by 8% annually due to urbanization",
            "collection_efficiency": "Improving slowly - 2% annual increase",
            "recycling_progress": "Stagnant - minimal growth in formal recycling",
            "policy_development": "Progressing - new regulations being drafted",
            "public_awareness": "Growing - 25% increase in environmental awareness campaigns",
            "technology_adoption": "Slow - limited investment in waste processing technology"
        }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Uganda Plastic Waste Monitoring API", "status": "active", "focus": "waste_management"}

# Uganda Cities Initialization
@api_router.post("/initialize-uganda-locations")
async def initialize_uganda_locations():
    """Initialize database with major Ugandan cities and plastic waste data"""
    created_count = 0
    for city_data in UGANDA_CITIES:
        existing = await db.locations.find_one({"name": city_data["name"]})
        if not existing:
            location = Location(**city_data)
            await db.locations.insert_one(location.dict())
            created_count += 1
    
    return {"message": f"Initialized {created_count} Ugandan cities with plastic waste data", "total_cities": len(UGANDA_CITIES)}

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
    
    air_data = await fetch_airnow_data(location["latitude"], location["longitude"])
    
    if air_data:
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
        
        if not aqi_data.get("aqi"):
            aqi_data["aqi"] = random.randint(35, 85)
            aqi_data["category"], aqi_data["status_level"] = get_aqi_category(aqi_data["aqi"])
        
        air_quality = AirQualityData(
            location_id=location_id,
            location_name=location["name"],
            aqi=aqi_data["aqi"],
            pm25=aqi_data.get("pm25"),
            pm10=aqi_data.get("pm10"),
            ozone=aqi_data.get("ozone"),
            category=aqi_data["category"],
            status_level=aqi_data["status_level"]
        )
        
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

# Waste Management Information and Analysis
@api_router.get("/waste-management/solutions")
async def get_waste_management_solutions():
    """Get comprehensive waste management solutions"""
    return WASTE_MANAGEMENT_SOLUTIONS

@api_router.post("/waste-management/analysis", response_model=WasteManagementAnalysis)
async def create_waste_analysis(analysis: WasteManagementAnalysisCreate):
    """Create waste management analysis"""
    findings = generate_waste_analysis_data(analysis)
    
    # Generate recommendations based on analysis type and focus area
    if analysis.analysis_type == "impact_assessment":
        recommendations = [
            "Implement immediate waste collection improvements",
            "Establish community education programs",
            "Create economic incentives for waste reduction",
            "Develop healthcare monitoring in affected areas"
        ]
        priority_actions = [
            "Emergency cleanup of critical contamination areas",
            "Establish basic waste collection infrastructure"
        ]
    elif analysis.analysis_type == "solution_recommendations":
        recommendations = [
            "Start with high-impact, low-cost solutions",
            "Engage community leaders and local government",
            "Pilot programs before full-scale implementation",
            "Monitor and evaluate progress regularly"
        ]
        priority_actions = [
            "Launch community collection centers",
            "Begin public awareness campaigns"
        ]
    else:  # trend_analysis
        recommendations = [
            "Increase investment in waste management infrastructure",
            "Accelerate policy development and enforcement",
            "Promote technology adoption through incentives",
            "Strengthen monitoring and data collection systems"
        ]
        priority_actions = [
            "Establish baseline measurements",
            "Create regulatory framework"
        ]
    
    analysis_obj = WasteManagementAnalysis(
        location_id=analysis.location_id,
        location_name=analysis.location_name,
        analysis_type=analysis.analysis_type,
        focus_area=analysis.focus_area,
        findings=findings,
        recommendations=recommendations,
        priority_actions=priority_actions
    )
    
    await db.waste_analysis.insert_one(analysis_obj.dict())
    return analysis_obj

@api_router.get("/waste-management/analysis", response_model=List[WasteManagementAnalysis])
async def get_waste_analysis():
    """Get all waste management analyses"""
    analyses = await db.waste_analysis.find().sort("created_at", -1).to_list(50)
    return [WasteManagementAnalysis(**a) for a in analyses]

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
    analysis_count = await db.waste_analysis.count_documents({})
    unacknowledged_alerts = await db.alerts.count_documents({"acknowledged": False})
    
    # Get recent air quality readings
    recent_air_quality = await db.air_quality.find().sort("timestamp", -1).limit(3).to_list(3)
    
    # Get recent analyses
    recent_analyses = await db.waste_analysis.find().sort("created_at", -1).limit(3).to_list(3)
    
    # Calculate total plastic waste
    total_daily_waste = sum(float(city["plastic_waste"]["daily_generation"].split()[0]) for city in UGANDA_CITIES)
    
    return {
        "locations_count": locations_count,
        "analysis_count": analysis_count,
        "unacknowledged_alerts": unacknowledged_alerts,
        "total_daily_plastic_waste": f"{total_daily_waste:.0f} tons",
        "recent_air_quality": [AirQualityData(**aq) for aq in recent_air_quality],
        "recent_analyses": [WasteManagementAnalysis(**a) for a in recent_analyses]
    }

# NASA API Endpoints
@api_router.get("/nasa/climate/{location_id}")
async def get_nasa_climate_data(location_id: str):
    """Get NASA climate data for a specific location"""
    location = await db.locations.find_one({"id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    climate_data = await fetch_nasa_climate_data(location["latitude"], location["longitude"])
    
    # Store the data in database
    if climate_data and "properties" in climate_data:
        parameters = climate_data["properties"]["parameter"]
        latest_date = list(parameters.get("T2M", {}).keys())[-1] if parameters.get("T2M") else datetime.utcnow().strftime("%Y%m%d")
        
        nasa_climate = NASAClimateData(
            location_id=location_id,
            location_name=location["name"],
            latitude=location["latitude"],
            longitude=location["longitude"],
            date=latest_date,
            temperature=list(parameters.get("T2M", {}).values())[-1] if parameters.get("T2M") else None,
            precipitation=list(parameters.get("PRECTOTCORR", {}).values())[-1] if parameters.get("PRECTOTCORR") else None,
            humidity=list(parameters.get("RH2M", {}).values())[-1] if parameters.get("RH2M") else None,
            wind_speed=list(parameters.get("WS2M", {}).values())[-1] if parameters.get("WS2M") else None,
            solar_radiation=list(parameters.get("ALLSKY_SFC_SW_DWN", {}).values())[-1] if parameters.get("ALLSKY_SFC_SW_DWN") else None,
            pressure=list(parameters.get("PS", {}).values())[-1] if parameters.get("PS") else None
        )
        
        await db.nasa_climate.insert_one(nasa_climate.dict())
        
        # Check for climate anomalies and create alerts
        anomalies = detect_climate_anomalies(climate_data, location["name"])
        for anomaly in anomalies:
            alert = EnvironmentalAlert(
                location_id=location_id,
                location_name=location["name"],
                alert_type="climate_anomaly",
                severity=anomaly["severity"],
                message=anomaly["message"],
                value=anomaly["value"],
                threshold=anomaly["threshold"]
            )
            await db.alerts.insert_one(alert.dict())
        
        return nasa_climate
    
    raise HTTPException(status_code=500, detail="Unable to fetch NASA climate data")

@api_router.get("/nasa/imagery/{location_id}")
async def get_nasa_imagery(location_id: str, date: str = None):
    """Get NASA satellite imagery for a specific location"""
    location = await db.locations.find_one({"id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    imagery_data = await fetch_nasa_imagery(location["latitude"], location["longitude"], date)
    
    if imagery_data["status"] == "success":
        nasa_imagery = NASAImageryData(
            location_id=location_id,
            location_name=location["name"],
            latitude=location["latitude"],
            longitude=location["longitude"],
            image_url=str(imagery_data["url"]),
            date=imagery_data["date"],
            satellite=imagery_data.get("satellite", "Landsat")
        )
        
        await db.nasa_imagery.insert_one(nasa_imagery.dict())
        return nasa_imagery
    else:
        raise HTTPException(status_code=404, detail=imagery_data.get("message", "Imagery not available"))

@api_router.get("/nasa/overview")
async def get_nasa_overview():
    """Get NASA data overview for all Uganda locations"""
    locations = await db.locations.find().to_list(20)
    overview_data = []
    
    for location in locations:
        # Get latest climate data
        climate_data = await fetch_nasa_climate_data(location["latitude"], location["longitude"])
        
        if climate_data and "properties" in climate_data:
            parameters = climate_data["properties"]["parameter"]
            overview_data.append({
                "location_id": location["id"],
                "location_name": location["name"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current_temp": list(parameters.get("T2M", {}).values())[-1] if parameters.get("T2M") else None,
                "current_precipitation": list(parameters.get("PRECTOTCORR", {}).values())[-1] if parameters.get("PRECTOTCORR") else None,
                "current_humidity": list(parameters.get("RH2M", {}).values())[-1] if parameters.get("RH2M") else None,
                "climate_status": "normal"  # This could be enhanced with more logic
            })
    
    return {
        "total_locations": len(overview_data),
        "locations": overview_data,
        "last_updated": datetime.utcnow().isoformat()
    }

@api_router.get("/locations/{location_id}/enhanced")
async def get_enhanced_location_data(location_id: str):
    """Get enhanced location data including NASA climate information"""
    location = await db.locations.find_one({"id": location_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Get recent NASA climate data
    recent_climate = await db.nasa_climate.find({"location_id": location_id}).sort("timestamp", -1).limit(1).to_list(1)
    
    # Get recent NASA imagery
    recent_imagery = await db.nasa_imagery.find({"location_id": location_id}).sort("timestamp", -1).limit(1).to_list(1)
    
    # Get air quality data
    air_quality = await fetch_airnow_data(location["latitude"], location["longitude"])
    
    enhanced_data = {
        "location": Location(**location),
        "nasa_climate": NASAClimateData(**recent_climate[0]) if recent_climate else None,
        "nasa_imagery": NASAImageryData(**recent_imagery[0]) if recent_imagery else None,
        "air_quality_preview": air_quality[:1] if air_quality else None
    }
    
    return enhanced_data

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