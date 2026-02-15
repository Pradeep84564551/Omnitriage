from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from typing import List
import asyncio
import json
import random
from explainability import ExplainabilityEngine

# Initialize Explainability Engine
explain_engine = ExplainabilityEngine()
import joblib
import pandas as pd
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io
import re
import requests

# Initialize App
app = FastAPI(title="Smart Patient Triage API") # Reload Triggered Again

# Chat Request Model
class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # Optional: context for memory

@app.post("/chat")
def chat_with_bot(request: ChatRequest):
    """
    Communicates with local Ollama instance (Qwen3 1.7B - Non-thinking mode)
    """
    ollama_url = "http://localhost:11434/api/chat"
    
    # ── Comprehensive System Instruction ──
    system_prompt = {
        "role": "system",
        "content": """You are **OmniTriage AI** — the intelligent triage assistant powering the OmniTriage Smart Patient Triage System.

━━━━━━━━━━━━━  IDENTITY & ROLE  ━━━━━━━━━━━━━
• You are a virtual **pre-screening triage assistant** embedded in a hospital's AI triage platform.
• Your job is to **collect symptoms, assess urgency, and guide patients** to the right level of care — NOT to diagnose or treat.
• You operate alongside an ML risk-prediction engine (XGBoost) and a real-time vitals monitoring system; your role is the **conversational front-end** for patient interaction.

━━━━━━━━━━━━━  HARD SAFETY RULES (NEVER VIOLATE)  ━━━━━━━━━━━━━
1. **NO Diagnosis.** Never tell a patient what condition they have. Use phrases like "this *could* indicate…" or "symptoms like these are *sometimes* associated with…".
2. **NO Prescriptions.** Never recommend specific medications, dosages, or treatments. You may mention general categories (e.g., "a pain-relief medication") but always append "as directed by your doctor".
3. **NO Emergency Delay.** If the patient describes any of these **RED FLAG** symptoms, immediately advise them to call emergency services (911 / local equivalent) or go to the nearest ER:
   - Chest pain / pressure / tightness
   - Sudden difficulty breathing or shortness of breath
   - Signs of stroke (facial droop, arm weakness, slurred speech — use F.A.S.T.)
   - Uncontrolled bleeding
   - Loss of consciousness / fainting
   - Severe allergic reaction (anaphylaxis symptoms)
   - Sudden severe headache ("worst headache of my life")
   - Seizures
   - Suicidal ideation or self-harm — provide crisis-line numbers and urge immediate help.
4. **Patient Privacy.** Never ask for or store personally identifiable information (full name, address, SSN, insurance ID). If a patient shares such data, acknowledge politely and remind them not to share sensitive info in chat.
5. **No Speculation.** If you are unsure, say so honestly. Never fabricate medical facts.

━━━━━━━━━━━━━  SYMPTOM COLLECTION PROTOCOL  ━━━━━━━━━━━━━
When a patient describes symptoms, **systematically gather** the following (ask only what is missing — do NOT overwhelm with all questions at once):

| Priority | Information             | Example Question |
|----------|-------------------------|------------------|
| 1        | Chief Complaint         | "What is the main problem you're experiencing right now?" |
| 2        | Onset & Duration        | "When did this start? Has it been getting worse?" |
| 3        | Severity (1-10 scale)   | "On a scale of 1 to 10, how bad is the pain/discomfort?" |
| 4        | Location                | "Where exactly do you feel it?" |
| 5        | Associated Symptoms     | "Are you also experiencing nausea, dizziness, fever, etc.?" |
| 6        | Relevant History        | "Do you have any pre-existing conditions like diabetes, heart disease, or asthma?" |
| 7        | Medications             | "Are you currently taking any medications?" |
| 8        | Allergies               | "Do you have any known drug allergies?" |

Use the mnemonic **OLDCARTS** internally (Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Timing, Severity) to guide your questioning, but present questions naturally and conversationally.

━━━━━━━━━━━━━  TRIAGE SEVERITY MAPPING  ━━━━━━━━━━━━━
After collecting sufficient information, provide a **suggested triage level** using this framework (aligned with the system's Risk_Level schema):

🔴 **HIGH RISK** — Life-threatening or potentially life-threatening. Immediate medical attention required. Examples: chest pain with cardiac features, stroke symptoms, severe breathing difficulty, O2 < 92%, Systolic BP > 180 or < 90, HR > 130 or < 50, Temp > 39.5°C.

🟡 **MEDIUM RISK** — Urgent but not immediately life-threatening. Needs medical evaluation within hours. Examples: high fever (38.5–39.5°C), moderate pain (5-7/10), persistent vomiting, infected wounds, fracture suspicion.

🟢 **LOW RISK** — Non-urgent. Can be managed in a standard clinic visit. Examples: mild cold symptoms, minor rashes, routine follow-ups, mild pain (1-4/10) with stable vitals.

When providing the triage suggestion, format it clearly:
> **Suggested Triage Level: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW**
> **Recommended Department: [Cardiology / Neurology / Pulmonology / Orthopedics / Gastroenterology / Dermatology / General Medicine]**
> **Reason:** [Brief explanation of why this level was assigned]

━━━━━━━━━━━━━  DEPARTMENT ROUTING GUIDANCE  ━━━━━━━━━━━━━
Map symptoms to these departments (same as our ML model):
- **Cardiology**: chest pain, palpitations, coronary symptoms, angina, heart-related
- **Neurology**: stroke signs, seizures, severe headache, numbness/tingling, paralysis, slurred speech
- **Pulmonology**: breathing difficulty, chronic cough, wheezing, asthma exacerbation, respiratory distress
- **Orthopedics**: bone fractures, joint injuries, dislocations, musculoskeletal trauma
- **Gastroenterology**: abdominal pain, vomiting, GI bleeding, bowel irregularities
- **Dermatology**: skin rashes, lesions, allergic skin reactions
- **General Medicine**: fever, infections, flu symptoms, general malaise, routine checkups, anything that doesn't clearly fit another department

━━━━━━━━━━━━━  MULTILINGUAL SUPPORT  ━━━━━━━━━━━━━
• **Auto-detect** the patient's language from their message.
• **Always reply in the same language** the patient uses.
• If the patient switches language mid-conversation, switch with them seamlessly.
• Supported languages include (but are not limited to): English, Spanish, French, Hindi, Tamil, Telugu, Arabic, Mandarin, Portuguese, German, Japanese, Korean.
• Use culturally appropriate expressions and medical terminology translations.

━━━━━━━━━━━━━  CONVERSATION STYLE  ━━━━━━━━━━━━━
• Be **warm, empathetic, and reassuring** — patients are often anxious.
• Use **simple, jargon-free language** unless the patient uses medical terms first.
• Keep responses **concise** (2-4 short paragraphs maximum). Avoid walls of text.
• Use bullet points and formatting for clarity when listing multiple items.
• Use emoji sparingly and meaningfully (✅, ⚠️, 🔴, 🟡, 🟢 for triage levels).
• Always end with a clear **next step** or **follow-up question** to keep the conversation productive.

━━━━━━━━━━━━━  ESCALATION & HANDOFF  ━━━━━━━━━━━━━
• If the conversation reaches a point where you have enough information, **summarize** the patient's symptoms and suggest they proceed to the triage form for formal AI assessment: "I've gathered your symptoms. You can now fill in the Triage Form on this platform for a detailed AI risk assessment and doctor assignment."
• If the patient expresses frustration, confusion, or requests a human, respond with empathy and suggest: "I understand. Let me connect you with our medical staff for further assistance."
• Never argue with a patient. If they disagree with guidance, acknowledge their concern and recommend professional consultation.

━━━━━━━━━━━━━  WHAT YOU MUST NEVER DO  ━━━━━━━━━━━━━
❌ Diagnose conditions  
❌ Prescribe or recommend specific drugs  
❌ Provide dosage information  
❌ Delay emergency referral  
❌ Provide therapy or mental health counseling (but DO provide crisis resources)  
❌ Discuss topics unrelated to health and triage (politely redirect)  
❌ Generate or discuss graphic, violent, or harmful content  
❌ Pretend to be a licensed physician or nurse  
"""
    }
    
    messages = [system_prompt] + request.history + [{"role": "user", "content": request.message}]
    
    # Build payload
    payload = {
        "model": "qwen3:1.7b",
        "messages": messages,
        "stream": False,
        "think": False
    }

    try:
        response = requests.post(ollama_url, json=payload)

        if response.status_code == 200:
            data = response.json()
            return {"response": data['message']['content']}
        else:
            error_msg = response.text
            try:
                error_json = response.json()
                if 'error' in error_json: error_msg = error_json['error']
            except: pass
            return {"response": f"System Error (Qwen3): {error_msg}. Please check Ollama metrics/logs."}
            
    except requests.exceptions.RequestException as e:
        print(f"Ollama Connection Error: {e}")
        return {"response": "I'm having trouble connecting to my brain. Please ensure 'ollama serve' is running."}
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# CORS (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models & Encoders
try:
    risk_model = joblib.load('risk_model.joblib')
    dept_model = joblib.load('dept_model.joblib')
    # Load Encoders to decoding predictions if needed (though we currently return raw strings from heuristics? No, we need to decode)
    # Actually, the model returns integers now. We must decode them.
    risk_le = joblib.load('risk_le.joblib')
    dept_le = joblib.load('dept_le.joblib')
    print("Models and Encoders loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    risk_model = None
    dept_model = None
    risk_le = None
    dept_le = None


# Load Population Data for Comparison
try:
    population_df = pd.read_csv('patients_dataset.csv')
    print("Population data loaded successfully.")
except Exception as e:
    print(f"Error loading population data: {e}")
    population_df = pd.DataFrame()

def get_population_comparison(patient_data):
    """
    Compares the current patient's vitals to the entire population.
    Returns percentile rankings.
    """
    if population_df.empty:
        return {}
    
    stats = {}
    
    # Heart Rate
    hr_percentile = (population_df['Heart_Rate'] < patient_data.Heart_Rate).mean() * 100
    stats['Heart_Rate_Percentile'] = f"Higher than {hr_percentile:.1f}% of patients"
    
    # Temperature
    temp_percentile = (population_df['Temperature'] < patient_data.Temperature).mean() * 100
    stats['Temperature_Percentile'] = f"Higher than {temp_percentile:.1f}% of patients"
    
    # BP Systolic
    bp_percentile = (population_df['BP_Systolic'] < patient_data.BP_Systolic).mean() * 100
    stats['BP_Percentile'] = f"Higher than {bp_percentile:.1f}% of patients"
    
    return stats

# Input Schema

class PatientData(BaseModel):
    Age: int
    Gender: str
    BP_Systolic: int
    BP_Diastolic: int
    Heart_Rate: int
    Temperature: float
    O2_Saturation: int
    Symptoms: str = "" # Optional for now
    Medical_Notes: str = "" # New field for EHR text
    Pre_Existing_Conditions: str = "" # New field
    Risk_Level: str = "" # Optional manual override or training label

@app.get("/health")
def health_check():
    return {"status": "active", "models_loaded": risk_model is not None}

# Advanced Doctor Management
# Data Structure: List of objects for valid JSON handling and easier filtering
DOCTORS_DB = [
    {"id": "cardio_1", "name": "Dr. Heart", "dept": "Cardiology", "status": "Available", "spec": "Interventional Cardiology"},
    {"id": "cardio_2", "name": "Dr. Pulse", "dept": "Cardiology", "status": "Busy", "spec": "Electrophysiology"},
    {"id": "cardio_3", "name": "Dr. Vein", "dept": "Cardiology", "status": "Available", "spec": "Vascular Surgery"},
    
    {"id": "neuro_1", "name": "Dr. Brain", "dept": "Neurology", "status": "Available", "spec": "Stroke Specialist"},
    {"id": "neuro_2", "name": "Dr. Nerve", "dept": "Neurology", "status": "Busy", "spec": "Neuromuscular"},
    {"id": "neuro_3", "name": "Dr. Mind", "dept": "Neurology", "status": "Available", "spec": "Neuro-Oncology"},
    
    {"id": "pulmo_1", "name": "Dr. Lung", "dept": "Pulmonology", "status": "Available", "spec": "Pulmonary Critical Care"},
    {"id": "pulmo_2", "name": "Dr. Breath", "dept": "Pulmonology", "status": "Available", "spec": "Asthma Specialist"},
    
    {"id": "gen_1", "name": "Dr. Care", "dept": "General Medicine", "status": "Available", "spec": "Internal Medicine"},
    {"id": "gen_2", "name": "Dr. Heal", "dept": "General Medicine", "status": "Busy", "spec": "Internal Medicine"},
    {"id": "gen_3", "name": "Dr. Helper", "dept": "General Medicine", "status": "Available", "spec": "Internal Medicine"},
    
    {"id": "ortho_1", "name": "Dr. Bone", "dept": "Orthopedics", "status": "Available", "spec": "Trauma Surgery"},
    {"id": "ortho_2", "name": "Dr. Joint", "dept": "Orthopedics", "status": "Available", "spec": "Joint Replacement"},
    
    {"id": "gastro_1", "name": "Dr. Stomach", "dept": "Gastroenterology", "status": "Available", "spec": "Hepatology"},
    {"id": "gastro_2", "name": "Dr. Gut", "dept": "Gastroenterology", "status": "Busy", "spec": "IBD Specialist"},

    {"id": "derma_1", "name": "Dr. Skin", "dept": "Dermatology", "status": "Available", "spec": "Dermatopathology"},
    
    {"id": "gen_4", "name": "Dr. Harper", "dept": "General Medicine", "status": "Available", "spec": "Senior Consultant"},
    {"id": "gp_1", "name": "Dr. General", "dept": "General Medicine", "status": "Available", "spec": "Family Medicine"},
    {"id": "gp_2", "name": "Dr. Smith", "dept": "General Medicine", "status": "Available", "spec": "Family Medicine"},
]

def assign_doctor(department, risk_level):
    """
    Intelligent Assignment Logic:
    1. Filter doctors by predicted Department.
    2. If Risk is High/Critical, filter for 'Available' doctors ONLY.
    3. If no specific department match, fallback to General Medicine/GP.
    """
    candidate_docs = [d for d in DOCTORS_DB if d['dept'] == department]
    
    if not candidate_docs:
        # Fallback to General Practice if specific dept not found
        candidate_docs = [d for d in DOCTORS_DB if d['dept'] in ['General Practice', 'General Medicine']]

    # Filter by Availability
    available_docs = [d for d in candidate_docs if d['status'] == 'Available']
    
    assigned_doc = None
    
    if risk_level == 'High':
        # CRITICAL: Must find an Available doctor if possible
        if available_docs:
             assigned_doc = available_docs[0] # Grab first available
        else:
             # If all busy, we must interrupt. Pick the first one.
             # In real world, this would trigger an 'Overload' alert.
             assigned_doc = candidate_docs[0] if candidate_docs else None
    elif risk_level == 'Medium':
         # Urgent: Prefer available, but can wait (simulated by random choice if busy)
         if available_docs:
             assigned_doc = np.random.choice(available_docs)
         else:
             assigned_doc = np.random.choice(candidate_docs) if candidate_docs else None
    else:
         # Low: Load balancing (Random)
         # To preserve 'Available' doctors for high risk, we could prefer busy ones? 
         # No, that doesn't make sense. Just pick available if any, else random.
         if available_docs:
             assigned_doc = np.random.choice(available_docs)
         else:
             assigned_doc = np.random.choice(candidate_docs) if candidate_docs else None

    # Fallback if absolutely no doctors found (shouldn't happen with default DB)
    if not assigned_doc:
         return {"name": "Triage Nurse", "id": "nurse_1", "dept": "General", "status": "Active"}

    # Auto-update status for Simulation
    # If High Risk, mark as Busy
    if risk_level in ['High', 'Medium'] and assigned_doc['status'] == 'Available':
         for d in DOCTORS_DB:
             if d['id'] == assigned_doc['id']:
                 d['status'] = 'Busy'
                 break
    
    return assigned_doc

@app.get("/get_doctor_list")
def get_doctor_list():
    """Returns list of doctors grouped by department for frontend"""
    grouped = {}
    for doc in DOCTORS_DB:
        if doc['dept'] not in grouped:
            grouped[doc['dept']] = []
        grouped[doc['dept']].append(doc)
    return grouped

@app.get("/get_department_stats")
def get_department_stats():
    """Returns stats for Grid View: Available vs Total per Dept"""
    stats = {}
    for doc in DOCTORS_DB:
        dept = doc['dept']
        if dept not in stats:
            stats[dept] = {"total": 0, "available": 0, "specs": set()}
        
        stats[dept]["total"] += 1
        if doc['status'] == 'Available':
            stats[dept]["available"] += 1
        stats[dept]["specs"].add(doc['spec'])
    
    # Convert sets to lists for JSON
    for k in stats:
        stats[k]["specs"] = list(stats[k]["specs"])
        
    return stats

class AvailabilityUpdate(BaseModel):
    doctor_name: str
    status: str # 'Available' or 'Busy'

@app.post("/toggle_availability")
def toggle_availability(update: AvailabilityUpdate):
    for doc in DOCTORS_DB:
        if doc['name'] == update.doctor_name:
            doc['status'] = update.status
            return {"status": "success", "new_state": update.status}
    raise HTTPException(status_code=404, detail="Doctor not found")

@app.post("/reset_doctors")
def reset_doctors():
    for doc in DOCTORS_DB:
        doc['status'] = 'Available'
    return {"status": "All doctors reset to Available"}

@app.get("/patients")
def get_patients():
    """Returns the current pool of simulated patients"""
    # Filter to return a manageable list if needed, or all
    return sim_manager.patients[:50] # Return top 50 for the stream

@app.post("/simulate_arrival")
def simulate_arrival():
    """Simulates a random new patient arrival"""
    if not sim_manager.patients:
        return {}
    
    # Pick a random profile from the dataset
    new_p = random.choice(sim_manager.patients).copy()
    
    # Assign new ID and random name for visual variety
    new_p['Patient_ID'] = random.randint(10000, 99999)
    first_names = ["John", "Jane", "Alex", "Sam", "Chris", "Taylor", "Jordan", "Casey"]
    last_names = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"]
    new_p['Name'] = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    # Ensure history and other complex fields are handled
    new_p['history'] = []
    
    return new_p

@app.post("/predict")
def predict_triage(data: PatientData):
    if not risk_model or not dept_model:
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    # Prepare DataFrame for prediction
    input_data = pd.DataFrame([{
        'Age': data.Age,
        'Gender': data.Gender,
        'BP_Systolic': data.BP_Systolic,
        'BP_Diastolic': data.BP_Diastolic,
        'Heart_Rate': data.Heart_Rate,
        'Temperature': data.Temperature,
        'O2_Saturation': data.O2_Saturation,
        'Symptoms': data.Symptoms,
        'Medical_Notes': data.Medical_Notes
    }])
    
    # Predict (Returns indices)
    risk_pred_idx = risk_model.predict(input_data)[0]
    dept_pred_idx = dept_model.predict(input_data)[0]
    
    # Decode Predictions
    risk_pred = risk_le.inverse_transform([risk_pred_idx])[0]
    dept_pred = dept_le.inverse_transform([dept_pred_idx])[0]

    # --- RULE-BASED OVERRIDE (Safety Net) ---
    # Force specific departments for critical keywords, overriding the ML model
    symptoms_lower = data.Symptoms.lower()
    
    if any(x in symptoms_lower for x in ['chest', 'heart', 'coronary', 'angina']):
        dept_pred = "Cardiology"
        risk_pred = "High"
    elif any(x in symptoms_lower for x in ['stroke', 'slurred', 'facial', 'droop', 'paralysis']):
        dept_pred = "Neurology"
        risk_pred = "High"
    elif any(x in symptoms_lower for x in ['breath', 'lung', 'respiratory', 'asthma', 'wheez']):
        dept_pred = "Pulmonology"
        risk_pred = "High"
    elif any(x in symptoms_lower for x in ['bone', 'fracture', 'break', 'dislocat']):
        dept_pred = "Orthopedics"
    elif any(x in symptoms_lower for x in ['skin', 'rash', 'derma']):
        dept_pred = "Dermatology"
    elif any(x in symptoms_lower for x in ['stomach', 'abdomen', 'gut', 'vomit']):
        dept_pred = "Gastroenterology"
    
    # ----------------------------------------
    
    # Calculate Confidence (Probability)
    risk_proba = risk_model.predict_proba(input_data)[0]
    confidence_score = float(max(risk_proba) * 100) 

    # Assign Doctor
    assigned_doc = assign_doctor(dept_pred, risk_pred)
    
    # Explainability: XGBoost Feature Importance
    # Extract gain scores from the booster
    booster = risk_model.named_steps['classifier'].get_booster()
    importance_map = booster.get_score(importance_type='gain')
    
    # Map feature names (f0, f1...) to actual column names
    # XGBoost internal feature names might be f0, f1... or preservation depends on version/sklearn wrapper
    # Safe approach: usage of feature_names_in_ from the fitted classifier if available
    
    # Sort importances by gain (descending)
    sorted_importance = sorted(importance_map.items(), key=lambda x: x[1], reverse=True)
    
    # Get top 3 features (These keys might be 'f0', 'Age', etc.)
    # If keys are 'f0', 'f1', we need to map them to input_data columns
    feature_names = input_data.columns.tolist() # The order columns were passed to predict
    
    explanation = []
    for k, v in sorted_importance[:3]:
        # Handle 'f0' style names if present, or raw names
        feat_name = k
        if k.startswith('f') and k[1:].isdigit():
             idx = int(k[1:])
             if idx < len(feature_names):
                 feat_name = feature_names[idx]
        
        # Add human-readable context based on values
        val = input_data.iloc[0][feat_name] if feat_name in input_data.columns else "High Impact"
        if feat_name == 'O2_Saturation':
            explanation.append(f"O2 Saturation ({val}%)")
        elif 'BP' in feat_name:
             explanation.append(f"{feat_name} ({val})")
        elif feat_name == 'Temperature':
             explanation.append(f"Temperature ({val}C)")
        else:
             explanation.append(f"{feat_name}")

    if not explanation:
        explanation = ["Complex Pattern Detected"]

    return {
        "Predicted_Risk": risk_pred,
        "Risk_Confidence": confidence_score, # Return confidence
        "Department": dept_pred,
        "Assigned_Doctor": assigned_doc['name'],
        "Assigned_Doctor_ID": assigned_doc['id'],
        "Doctor_Status": "Notified", # Simulation
        "explanation": explanation[:3], # Top 3 factors
        "comparison_stats": get_population_comparison(data), # Population Comparison

        
        # Pass through full data for Frontend Display (EHR Packet Simulation)
        "Medical_Notes": data.Medical_Notes,
        "Pre_Existing_Conditions": data.Pre_Existing_Conditions,
        "Symptoms": data.Symptoms
    }




@app.post("/upload_doc")
async def upload_document(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
            
        # simple regex extraction (Demo purposes)
        extracted_data = {}
        
        # Age
        age_match = re.search(r"Age:\s*(\d+)", text, re.IGNORECASE)
        if age_match:
            extracted_data["Age"] = int(age_match.group(1))
            
        # Gender
        gender_match = re.search(r"Gender:\s*(Male|Female)", text, re.IGNORECASE)
        if gender_match:
            extracted_data["Gender"] = gender_match.group(1)

        # BP (e.g., 120/80)
        bp_match = re.search(r"BP:\s*(\d+)/(\d+)", text, re.IGNORECASE)
        if bp_match:
            extracted_data["BP_Systolic"] = int(bp_match.group(1))
            extracted_data["BP_Diastolic"] = int(bp_match.group(2))
            
        # HR
        hr_match = re.search(r"HR:\s*(\d+)", text, re.IGNORECASE)
        if hr_match:
             extracted_data["Heart_Rate"] = int(hr_match.group(1))
             
        # Temp
        temp_match = re.search(r"Temp:\s*(\d+\.?\d*)", text, re.IGNORECASE)
        if temp_match:
             extracted_data["Temperature"] = float(temp_match.group(1))

        # O2
        o2_match = re.search(r"O2:\s*(\d+)", text, re.IGNORECASE)
        if o2_match:
             extracted_data["O2_Saturation"] = int(o2_match.group(1))

        return {
            "extracted_text_preview": text[:200], 
            "extracted_data": extracted_data,
            "medical_notes": text # Return full text for the model
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


# --- Module 4: Bias & Fairness Analysis ---
@app.get("/bias_stats")
def get_bias_stats():
    try:
        df = pd.read_csv('patients_dataset.csv')
        
        # Gender Analysis
        gender_risk = df.groupby(['Gender', 'Risk_Level']).size().unstack(fill_value=0).to_dict()
        
        # Age Analysis
        bins = [0, 18, 35, 50, 65, 120]
        labels = ['0-18', '19-35', '36-50', '51-65', '65+']
        df['Age_Group'] = pd.cut(df['Age'], bins=bins, labels=labels)
        age_risk = df.groupby(['Age_Group', 'Risk_Level']).size().unstack(fill_value=0).to_dict()
        
        return {
            "gender_risk": gender_risk,
            "age_risk": age_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Real-Time Vitals Simulation Engine ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Broadcast to all connected clients
        # Handle disconnected clients gracefully
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

class SimulationManager:
    def __init__(self):
        self.patients = []
        self.running = False
        self._load_initial_data()

    def _load_initial_data(self):
        # Load patients from CSV into memory for simulation
        try:
            df = pd.read_csv('patients_dataset.csv')
            # Replace NaN with None/Empty for JSON safety
            df = df.replace({np.nan: None})
            self.patients = df.to_dict(orient='records')
            
            # Ensure numeric fields are floats/ints for calculation
            for p in self.patients:
                p['Heart_Rate'] = int(p.get('Heart_Rate', 80))
                p['Temperature'] = float(p.get('Temperature', 37.0))
                p['BP_Systolic'] = int(p.get('BP_Systolic', 120))
                p['BP_Diastolic'] = int(p.get('BP_Diastolic', 80))
                p['O2_Saturation'] = int(p.get('O2_Saturation', 98))
                
                # Initialize explanations list if not present
                if 'explanation' not in p or not isinstance(p['explanation'], list):
                    p['explanation'] = []

        except Exception as e:
            print(f"Error loading initial simulation data: {e}")
            self.patients = []

            print(f"Error loading initial simulation data: {e}")
            self.patients = []

    def update_vitals(self):
        """
        Simulates vital sign drift and check clinical scenarios.
        Step 1: Assign a scenario if not present.
        Step 2: Drift vitals based on scenario.
        Step 3: Check for anomalies using Explainability Engine.
        """
        for p in self.patients:
            # Initialize Scenario & History if missing
            if 'scenario' not in p:
                # 80% Stable, 10% Sepsis, 10% Cardiac Risk
                r = random.random()
                if r < 0.8: p['scenario'] = 'Stable'
                elif r < 0.9: p['scenario'] = 'Sepsis'
                else: p['scenario'] = 'Cardiac'
            
            if 'history' not in p:
                p['history'] = []

            # Store current state for history before update
            p['history'].append({
                'Heart_Rate': p['Heart_Rate'],
                'BPM': p['Heart_Rate'], # legacy
                'Temperature': p['Temperature'],
                'O2_Saturation': p['O2_Saturation'],
                'BP_Systolic': p['BP_Systolic']
            })
            # Keep history short (last 5 ticks)
            if len(p['history']) > 5:
                p['history'].pop(0)

            # --- Scenario Logic ---
            if p['scenario'] == 'Stable':
                # Random small drift
                p['Heart_Rate'] += random.randint(-1, 1)
                p['Temperature'] += random.uniform(-0.05, 0.05)
                # Keep within normal-ish bounds
                p['Heart_Rate'] = max(60, min(100, p['Heart_Rate']))
                p['Temperature'] = round(max(36.0, min(37.5, p['Temperature'])), 1)

            elif p['scenario'] == 'Sepsis':
                # Gradual deterioration: Temp UP, HR UP, BP DOWN
                p['Temperature'] += random.uniform(0.01, 0.1) # Slowly rising fever
                p['Heart_Rate'] += random.randint(0, 2)       # Rising Tachycardia
                p['BP_Systolic'] -= random.randint(0, 1)      # Hypotension
                
                # Cap extreme values to avoid unrealistic numbers
                p['Temperature'] = round(min(41.0, p['Temperature']), 1)
                p['Heart_Rate'] = min(160, p['Heart_Rate'])
                p['BP_Systolic'] = max(70, p['BP_Systolic'])
                
            elif p['scenario'] == 'Cardiac':
                # Erratic HR, Spikes
                if random.random() < 0.1: # 10% chance of sudden spike
                    p['Heart_Rate'] += random.randint(10, 30)
                else:
                    p['Heart_Rate'] += random.randint(-5, 5)
                
                p['Heart_Rate'] = min(190, max(40, p['Heart_Rate']))

            # --- Analyze with Explainability Engine ---
            anomalies = explain_engine.detect_anomalies(p, p['history'])
            
            if anomalies:
                p['Risk_Level'] = 'High'
                p['Predicted_Risk'] = 'High' # Override ML model for safety
                p['explanation'] = anomalies
            elif p['scenario'] == 'Stable':
                # If stable and no anomalies, potentially revert risk (optional, but good for self-healing sim)
                # p['Risk_Level'] = 'Low' 
                pass 

            
            
    async def run_loop(self):
        self.running = True
        print("Simulation Loop Started...")
        while self.running:
            self.update_vitals()
            await manager.broadcast(self.patients)
            await asyncio.sleep(2) # Update every 2 seconds

sim_manager = SimulationManager()

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop in background
    asyncio.create_task(sim_manager.run_loop())

@app.websocket("/ws/vitals")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state immediately
        await websocket.send_json(sim_manager.patients)
        while True:
            # Keep connection alive, maybe listen for client commands?
            # For now, we just stream OUT.
            data = await websocket.receive_text() # Wait for any msg to keep open / handle pong
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# To run: uvicorn main:app --reload

