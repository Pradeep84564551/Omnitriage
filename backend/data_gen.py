import pandas as pd
import numpy as np
from faker import Faker
import random

fake = Faker()
Faker.seed(42)
np.random.seed(42)

# Doctor Data
DOCTORS = {
    'Cardiology': ['Dr. Heart (Cardiologist)', 'Dr. Pulse (Cardiologist)', 'Dr. Vein (Cardiologist)'],
    'Neurology': ['Dr. Brain (Neurologist)', 'Dr. Nerve (Neurologist)', 'Dr. Mind (Neurologist)'],
    'Pulmonology': ['Dr. Lung (Pulmonologist)', 'Dr. Breath (Pulmonologist)'],
    'General Medicine': ['Dr. Care (Internist)', 'Dr. Heal (Internist)', 'Dr. Helper (Internist)', 'Dr. General (GP)', 'Dr. Smith (GP)'],
    'Orthopedics': ['Dr. Bone (Orthopedist)', 'Dr. Joint (Orthopedist)'],
    'Gastroenterology': ['Dr. Stomach (Gastroenterologist)', 'Dr. Gut (Gastroenterologist)'],
    'Dermatology': ['Dr. Skin (Dermatologist)'],
}

DEPARTMENTS = ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Emergency']

def generate_patient_data(num_patients=2000):
    data = []
    
    for _ in range(num_patients):
        # Basic Demographics
        patient_id = fake.uuid4()
        name = fake.name()
        age = np.random.randint(1, 91)
        gender = np.random.choice(['Male', 'Female'])
        
        # Base Vitals (Normal Range)
        bps = np.random.randint(90, 140)  # Systolic
        bpd = np.random.randint(60, 90)   # Diastolic
        hr = np.random.randint(60, 100)
        temp = round(np.random.uniform(36.1, 37.5), 1)
        o2 = np.random.randint(95, 100)
        
        # Medical Logic & Correlations
        symptoms = []
        chronic = []
        
        # Risk factors
        is_smoker = np.random.choice([True, False], p=[0.2, 0.8])
        has_hypertension = np.random.choice([True, False], p=[0.3, 0.7]) if age > 40 else False
        has_diabetes = np.random.choice([True, False], p=[0.15, 0.85]) if age > 50 else False
        
        if has_hypertension:
            chronic.append('Hypertension')
            bps += np.random.randint(10, 30)
            bpd += np.random.randint(5, 15)
            
        if has_diabetes:
            chronic.append('Diabetes')
            
        # Simulating Conditions for Triage
        # Balanced probabilities for better variety (approx 33% each)
        condition_type = np.random.choice(['Critical', 'Urgent', 'Normal'], p=[0.34, 0.33, 0.33])
        
        risk_level = 'Low'
        department = 'General'
        
        if condition_type == 'Critical':
            # Cardiac, Stroke, Severe Trauma (High Risk - Red)
            scenario = np.random.choice(['Cardiac', 'Stroke', 'Respiratory'])
            if scenario == 'Cardiac':
                symptoms = ['Chest Pain', 'Shortness of Breath', 'Sweating']
                bps = np.random.randint(150, 200)
                hr = np.random.randint(110, 150)
                o2 = np.random.randint(85, 94)
                department = 'Cardiology'
            elif scenario == 'Stroke':
                symptoms = ['Slurred Speech', 'Facial Droop', 'Arm Weakness']
                bps = np.random.randint(160, 220)
                department = 'Neurology'
            elif scenario == 'Respiratory':
                symptoms = ['Severe Difficulty Breathing', 'Cyanosis']
                o2 = np.random.randint(70, 88)
                department = 'Pulmonology'
            
            risk_level = 'High'
            
        elif condition_type == 'Urgent':
            # Infection, Trauma, Gastro (Medium Risk - Yellow)
            scenario = np.random.choice(['Infection', 'Trauma', 'Gastro'])
            if scenario == 'Infection':
                symptoms = ['High Fever', 'Chills', 'Cough']
                temp = round(np.random.uniform(38.5, 40.5), 1)
                hr = np.random.randint(90, 120)
                department = 'General Medicine'
            elif scenario == 'Trauma':
                symptoms = ['Deep Cut', 'Bleeding', 'Pain']
                department = 'Orthopedics'
            elif scenario == 'Gastro':
                symptoms = ['Severe Abdominal Pain', 'Vomiting']
                department = 'Gastroenterology'
                
            risk_level = 'Medium'
            
        else:
            # Normal/Low Risk (Green)
            scenario = np.random.choice(['Minor', 'Flu', 'Checkup'])
            if scenario == 'Minor':
                symptoms = ['Mild Pain', 'Rash', 'Itchiness']
                department = 'Dermatology'
            elif scenario == 'Flu':
                symptoms = ['Runny Nose', 'Sore Throat', 'Mild Fever']
                temp = round(np.random.uniform(37.0, 38.0), 1)
                department = 'General Medicine'
            else:
                symptoms = ['None', 'Routine Checkup']
                department = 'General Medicine'
            
            risk_level = 'Low'
            
        # Add random chronic conditions for realism
        if not chronic and age > 60 and np.random.random() > 0.7:
             chronic.append('Arthritis')
        
        # Simulating EHR/Medical Notes
        notes_templates = {
            'High': [
                "Patient presents with acute distress. Reports severe {symptoms}. Stat ECG shows abnormalities.",
                "Emergency admission. History of {chronic}. Vitals unstable. Complains of {symptoms}.",
                "Critical condition. {symptoms} observed. Immediate intervention required."
            ],
            'Medium': [
                "Patient reports {symptoms} for past 2 days. History of {chronic}. Vitals elevated.",
                "Urgent care visit. {symptoms}. Moderate distress. Monitoring required.",
                "Complains of {symptoms}. Fever spiked to {temp}. ruling out sepsis."
            ],
            'Low': [
                "Routine checkup. Client reports {symptoms}. Vitals stable.",
                "Follow-up visit for {chronic}. No acute complaints. {symptoms} mentioned.",
                "Walk-in patient. {symptoms} mild. Discharged with prescription."
            ]
        }
        
        note_template = np.random.choice(notes_templates[risk_level])
        medical_notes = note_template.format(
            symptoms=', '.join(symptoms),
            chronic=', '.join(chronic) if chronic else "no significant history",
            temp=temp
        )

        data.append({
            'Patient_ID': patient_id,
            'Name': name,
            'Age': age,
            'Gender': gender,
            'Symptoms': ', '.join(symptoms),
            'BP_Systolic': bps,
            'BP_Diastolic': bpd,
            'Heart_Rate': hr,
            'Temperature': temp,
            'O2_Saturation': o2,
            'Chronic_Conditions': ', '.join(chronic) if chronic else 'None',
            'Medical_Notes': medical_notes, # New EHR Field
            'Risk_Level': risk_level,
            'Department': department,
            'Assigned_Doctor': np.random.choice(DOCTORS.get(department, DOCTORS['General Medicine']))
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = generate_patient_data(5000)
    output_path = 'patients_dataset.csv'
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} patient records saved to {output_path}")
    print(df['Risk_Level'].value_counts())
