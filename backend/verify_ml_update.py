import requests
import json

url = "http://localhost:8000/predict"

payload = {
    "Age": 45,
    "Gender": "Male",
    "BP_Systolic": 140,
    "BP_Diastolic": 90,
    "Heart_Rate": 110,
    "Temperature": 38.5,
    "O2_Saturation": 95,
    "Symptoms": "Fever, Cough",
    "Medical_Notes": " Patient has high fever."
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        print("Prediction Success!")
        print(f"Risk: {data.get('Predicted_Risk')}")
        print(f"Comparison Stats: {json.dumps(data.get('comparison_stats'), indent=2)}")
        
        if "comparison_stats" in data and "Heart_Rate_Percentile" in data["comparison_stats"]:
            print("VERIFICATION PASSED: Comparison Stats Present.")
        else:
            print("VERIFICATION FAILED: Comparison Stats Missing.")
            
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Connection Error: {e}")
