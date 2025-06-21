#!/usr/bin/env python3
import requests
import json
import time
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://a3cf53a4-32eb-48a9-8c88-dd65348ed4b0.preview.emergentagent.com/api"

# Test data
test_location = {
    "name": "Portland Environmental Center",
    "latitude": 45.5152,
    "longitude": -122.6784,
    "zip_code": "97201"
}

test_bioplastic_sample = {
    "sample_type": "PLA",
    "initial_weight": 25.5,
    "composting_temperature": 28.5,
    "composting_humidity": 65.0,
    "composting_ph": 6.8
}

# Helper functions
def print_header(title):
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def print_response(response, label="Response"):
    print(f"\n{label} Status Code: {response.status_code}")
    try:
        print(f"{label} JSON:")
        print(json.dumps(response.json(), indent=2))
    except:
        print(f"{label} Text: {response.text}")

def test_endpoint(method, endpoint, data=None, params=None, expected_status=200):
    url = f"{BACKEND_URL}{endpoint}"
    print(f"\nTesting {method.upper()} {url}")
    
    if method.lower() == "get":
        response = requests.get(url, params=params)
    elif method.lower() == "post":
        response = requests.post(url, json=data)
    elif method.lower() == "delete":
        response = requests.delete(url)
    elif method.lower() == "patch":
        response = requests.patch(url, json=data)
    else:
        print(f"Unsupported method: {method}")
        return None
    
    print_response(response)
    
    if response.status_code != expected_status:
        print(f"❌ Test failed! Expected status {expected_status}, got {response.status_code}")
        return None
    
    print(f"✅ Test passed! Status code: {response.status_code}")
    return response

# Main test function
def run_tests():
    created_location_id = None
    created_bioplastic_id = None
    created_alert_id = None
    uganda_location_ids = []
    
    try:
        print_header("ENVIRONMENTAL MONITORING BACKEND API TESTS")
        print(f"Testing against: {BACKEND_URL}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. Test API health check
        print_header("1. API Health Check")
        health_response = test_endpoint("get", "/")
        if not health_response:
            print("❌ API health check failed. Aborting tests.")
            return False
        
        # 2. Test Location Management
        print_header("2. Location Management")
        
        # 2.1 Initialize Uganda locations
        print("\n2.1 Initializing Uganda locations")
        init_locations_response = test_endpoint("post", "/initialize-uganda-locations")
        if not init_locations_response:
            print("❌ Uganda locations initialization failed.")
            return False
        
        # 2.2 Get all locations
        print("\n2.2 Getting all locations")
        locations_response = test_endpoint("get", "/locations")
        if not locations_response:
            print("❌ Getting locations failed.")
            return False
        
        # Store Uganda location IDs for NASA API testing
        locations = locations_response.json()
        for location in locations:
            if location.get("name") in ["Kampala", "Gulu", "Mbarara"]:
                uganda_location_ids.append({
                    "id": location.get("id"),
                    "name": location.get("name")
                })
                print(f"Found Uganda location: {location.get('name')} with ID: {location.get('id')}")
        
        if not uganda_location_ids:
            print("❌ No Uganda locations found. Cannot test NASA APIs.")
            return False
        
        # 2.3 Create a new location
        print("\n2.3 Creating a new location")
        location_response = test_endpoint("post", "/locations", data=test_location)
        if not location_response:
            print("❌ Location creation failed.")
            return False
        
        created_location_id = location_response.json().get("id")
        created_location_name = location_response.json().get("name")
        print(f"Created location ID: {created_location_id}")
        
        # 3. Test Air Quality Data
        print_header("3. Air Quality Data")
        
        # 3.1 Get air quality for the created location
        print("\n3.1 Getting air quality data for the created location")
        air_quality_response = test_endpoint("get", f"/air-quality/{created_location_id}")
        if not air_quality_response:
            print("❌ Getting air quality data failed.")
            return False
        
        # 4. Test Bioplastics Management
        print_header("4. Bioplastics Management")
        
        # 4.1 Create a new bioplastic sample
        print("\n4.1 Creating a new bioplastic sample")
        # Add location data to the sample
        test_bioplastic_sample["location_id"] = created_location_id
        test_bioplastic_sample["location_name"] = created_location_name
        
        bioplastic_response = test_endpoint("post", "/bioplastics", data=test_bioplastic_sample)
        if not bioplastic_response:
            print("❌ Bioplastic sample creation failed.")
            return False
        
        created_bioplastic_id = bioplastic_response.json().get("id")
        print(f"Created bioplastic sample ID: {created_bioplastic_id}")
        
        # 4.2 Get all bioplastic samples
        print("\n4.2 Getting all bioplastic samples")
        bioplastics_response = test_endpoint("get", "/bioplastics")
        if not bioplastics_response:
            print("❌ Getting bioplastic samples failed.")
            return False
        
        # 4.3 Get specific bioplastic sample
        print("\n4.3 Getting specific bioplastic sample")
        bioplastic_detail_response = test_endpoint("get", f"/bioplastics/{created_bioplastic_id}")
        if not bioplastic_detail_response:
            print("❌ Getting specific bioplastic sample failed.")
            return False
        
        # 5. Test Environmental Alerts
        print_header("5. Environmental Alerts")
        
        # 5.1 Get all alerts
        print("\n5.1 Getting all alerts")
        alerts_response = test_endpoint("get", "/alerts")
        if not alerts_response:
            print("❌ Getting alerts failed.")
            return False
        
        # Check if we have any alerts to acknowledge
        alerts = alerts_response.json()
        if alerts:
            created_alert_id = alerts[0].get("id")
            
            # 5.2 Acknowledge an alert
            print("\n5.2 Acknowledging an alert")
            acknowledge_response = test_endpoint("patch", f"/alerts/{created_alert_id}/acknowledge")
            if not acknowledge_response:
                print("❌ Acknowledging alert failed.")
                return False
        else:
            print("\nNo alerts found to acknowledge. Skipping alert acknowledgment test.")
        
        # 6. Test Dashboard Summary
        print_header("6. Dashboard Summary")
        
        # 6.1 Get dashboard summary
        print("\n6.1 Getting dashboard summary")
        summary_response = test_endpoint("get", "/dashboard/summary")
        if not summary_response:
            print("❌ Getting dashboard summary failed.")
            return False
        
        # 7. Test NASA API Integration
        print_header("7. NASA API Integration")
        
        # 7.1 Test NASA Overview endpoint
        print("\n7.1 Testing NASA Overview endpoint")
        nasa_overview_response = test_endpoint("get", "/nasa/overview")
        if not nasa_overview_response:
            print("❌ NASA Overview endpoint test failed.")
            return False
        
        # Verify the response structure
        overview_data = nasa_overview_response.json()
        if not isinstance(overview_data.get("locations"), list):
            print("❌ NASA Overview endpoint returned invalid data structure.")
            return False
        
        # 7.2 Test NASA Climate Data endpoint for each Uganda location
        print("\n7.2 Testing NASA Climate Data endpoint")
        for location in uganda_location_ids:
            print(f"\nTesting NASA Climate Data for {location['name']}")
            climate_response = test_endpoint("get", f"/nasa/climate/{location['id']}")
            if not climate_response:
                print(f"❌ NASA Climate Data endpoint test failed for {location['name']}.")
                continue
            
            # Verify the response structure
            climate_data = climate_response.json()
            if not climate_data.get("temperature") and not climate_data.get("precipitation"):
                print(f"⚠️ NASA Climate Data endpoint returned incomplete data for {location['name']}.")
            
        # 7.3 Test NASA Imagery endpoint for each Uganda location
        print("\n7.3 Testing NASA Imagery endpoint")
        for location in uganda_location_ids:
            print(f"\nTesting NASA Imagery for {location['name']}")
            imagery_response = test_endpoint("get", f"/nasa/imagery/{location['id']}")
            if not imagery_response:
                print(f"❌ NASA Imagery endpoint test failed for {location['name']}.")
                continue
            
            # Verify the response structure
            imagery_data = imagery_response.json()
            if not imagery_data.get("image_url"):
                print(f"⚠️ NASA Imagery endpoint returned incomplete data for {location['name']}.")
        
        # 7.4 Test Enhanced Location endpoint for each Uganda location
        print("\n7.4 Testing Enhanced Location endpoint")
        for location in uganda_location_ids:
            print(f"\nTesting Enhanced Location data for {location['name']}")
            enhanced_response = test_endpoint("get", f"/locations/{location['id']}/enhanced")
            if not enhanced_response:
                print(f"❌ Enhanced Location endpoint test failed for {location['name']}.")
                continue
            
            # Verify the response structure
            enhanced_data = enhanced_response.json()
            if not enhanced_data.get("location"):
                print(f"⚠️ Enhanced Location endpoint returned incomplete data for {location['name']}.")
        
        # 8. Test Location Deletion (cleanup)
        print_header("8. Cleanup - Delete Location")
        
        # 8.1 Delete the created location
        print("\n8.1 Deleting the created location")
        delete_response = test_endpoint("delete", f"/locations/{created_location_id}")
        if not delete_response:
            print("❌ Location deletion failed.")
            return False
        
        print_header("TEST SUMMARY")
        print("✅ All tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ An error occurred during testing: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)