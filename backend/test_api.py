import requests
import json

try:
    response = requests.post('http://127.0.0.1:8000/predict', json={
        'Age': 45, 
        'Gender': 'Male', 
        'BP_Systolic': 160, 
        'BP_Diastolic': 90, 
        'Heart_Rate': 110, 
        'Temperature': 37.0, 
        'O2_Saturation': 92, 
        'Symptoms': 'Severe Chest Pain, Sweating'
    })
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        # Validation
        if data['Department'] == 'Cardiology' and data['Predicted_Risk'] == 'High':
            print("\nSUCCESS: Routed to Cardiology correctly.")
            if 'Dr. Heart' in data['Assigned_Doctor'] or 'Dr. Pulse' in data['Assigned_Doctor'] or 'Dr. Vein' in data['Assigned_Doctor']:
                 print(f"SUCCESS: Assigned to Specialist: {data['Assigned_Doctor']}")
            else:
                 print(f"WARNING: Assigned to Doctor: {data['Assigned_Doctor']} (Expected Cardio Specialist)")
        else:
            print(f"\nFAILURE: Helper Routes to {data['Department']} with Risk {data['Predicted_Risk']}")
            
    else:
        print(f"Error: {response.status_code} - {response.text}")

except Exception as e:
    print(f"Exception: {e}")
