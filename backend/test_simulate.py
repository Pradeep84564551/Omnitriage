import requests
import json
import random

url = 'http://localhost:8000/predict'

payload = {
    "Age": 45,
    "Gender": "Male",
    "BP_Systolic": 140,
    "BP_Diastolic": 90,
    "Heart_Rate": 110,
    "Temperature": 39.8,
    "O2_Saturation": 96,
    "Symptoms": "High Fever, Chills",
    "Medical_Notes": "Simulated patient entry."
}

try:
    print(f"Sending POST request to {url}...")
    print(json.dumps(payload, indent=2))
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        print("\nSuccess! Response:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\nFailed with status code: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"\nError: {e}")
