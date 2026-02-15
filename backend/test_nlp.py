import requests
import json

def test_prediction(symptoms, notes="", vitals_override=None):
    url = "http://localhost:8000/predict"
    
    # Baseline normal vitals
    data = {
        "Age": 45,
        "Gender": "Male",
        "BP_Systolic": 120,
        "BP_Diastolic": 80,
        "Heart_Rate": 72,
        "Temperature": 37.0,
        "O2_Saturation": 98,
        "Symptoms": symptoms,
        "Medical_Notes": notes
    }
    
    if vitals_override:
        data.update(vitals_override)
        
    try:
        response = requests.post(url, json=data)
        result = response.json()
        print(f"Symptoms: '{symptoms}' | Notes: '{notes}' -> Risk: {result['Risk_Level']} | Dept: {result['Department']}")
    except Exception as e:
        print(f"Error: {e}")

print("Testing Model Logic with EHR Notes...")
test_prediction("None", notes="Critical condition. Stat ECG shows abnormalities.") # Should be High Risk due to Notes
test_prediction("None", notes="Routine checkup. Vitals stable.") # Should be Low Risk
