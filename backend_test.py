#!/usr/bin/env python3
import requests
import json
import time
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://a3cf53a4-32eb-48a9-8c88-dd65348ed4b0.preview.emergentagent.com/api"

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
    uganda_location_ids = []
    
    try:
        print_header("NASA API INTEGRATION TESTS")
        print(f"Testing against: {BACKEND_URL}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. Test API health check
        print_header("1. API Health Check")
        health_response = test_endpoint("get", "/")
        if not health_response:
            print("❌ API health check failed. Aborting tests.")
            return False
        
        # 2. Get locations for testing NASA endpoints
        print_header("2. Get Uganda Locations")
        locations_response = test_endpoint("get", "/locations")
        if not locations_response:
            print("❌ Getting locations failed. Aborting tests.")
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
        
        # 3. Test NASA API Integration
        print_header("3. NASA API Integration")
        
        # 3.1 Test NASA Overview endpoint
        print("\n3.1 Testing NASA Overview endpoint")
        nasa_overview_response = test_endpoint("get", "/nasa/overview")
        if not nasa_overview_response:
            print("❌ NASA Overview endpoint test failed.")
            return False
        
        # Verify the response structure
        overview_data = nasa_overview_response.json()
        if not isinstance(overview_data.get("locations"), list):
            print("❌ NASA Overview endpoint returned invalid data structure.")
            return False
        
        print("NASA Overview endpoint returned valid data structure with location information and NASA climate data.")
        
        # 3.2 Test NASA Climate Data endpoint for each Uganda location
        print("\n3.2 Testing NASA Climate Data endpoint")
        climate_success = 0
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
            else:
                print(f"NASA Climate Data endpoint successfully returned climate data for {location['name']}.")
                climate_success += 1
        
        # 3.3 Test NASA Imagery endpoint for each Uganda location
        print("\n3.3 Testing NASA Imagery endpoint")
        imagery_success = 0
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
            else:
                print(f"NASA Imagery endpoint successfully returned satellite imagery URL for {location['name']}.")
                imagery_success += 1
        
        # 3.4 Test Enhanced Location endpoint for each Uganda location
        print("\n3.4 Testing Enhanced Location endpoint")
        enhanced_success = 0
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
            else:
                print(f"Enhanced Location endpoint successfully returned combined location and NASA data for {location['name']}.")
                enhanced_success += 1
        
        print_header("TEST SUMMARY")
        print(f"NASA Overview endpoint: {'✅ Passed' if nasa_overview_response else '❌ Failed'}")
        print(f"NASA Climate Data endpoint: {climate_success}/{len(uganda_location_ids)} locations passed")
        print(f"NASA Imagery endpoint: {imagery_success}/{len(uganda_location_ids)} locations passed")
        print(f"Enhanced Location endpoint: {enhanced_success}/{len(uganda_location_ids)} locations passed")
        
        if (nasa_overview_response and 
            climate_success > 0 and 
            imagery_success > 0 and 
            enhanced_success > 0):
            print("\n✅ NASA API Integration tests passed successfully!")
            return True
        else:
            print("\n❌ Some NASA API Integration tests failed.")
            return False
        
    except Exception as e:
        print(f"\n❌ An error occurred during testing: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)