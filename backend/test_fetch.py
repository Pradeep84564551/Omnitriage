import requests
import json

try:
    response = requests.get('http://localhost:8000/get_patients')
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Fetched {len(data)} records.")
        if len(data) > 0:
            print("First record sample:")
            print(json.dumps(data[0], indent=2))
    else:
        print(f"Failed with status code: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
