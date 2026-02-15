import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
from sklearn.metrics import classification_report


from xgboost import XGBClassifier

def train_models():
    # Load Data
    df = pd.read_csv('patients_dataset.csv')
    
    # Feature Engineering
    # We need to handle Symptoms and Chronic_Conditions which are comma-separated strings
    # For simplicity in this hackathon context, we'll just use basic demographics and vitals
    # A more advanced version would use NLP or MultiLabelBinarizer for symptoms
    
    # Features
    X = df[['Age', 'Gender', 'BP_Systolic', 'BP_Diastolic', 'Heart_Rate', 'Temperature', 'O2_Saturation', 'Symptoms', 'Medical_Notes']]
    y_risk = df['Risk_Level']
    y_dept = df['Department']

    # Encode Targets
    le_risk = LabelEncoder()
    y_risk_encoded = le_risk.fit_transform(y_risk)
    
    le_dept = LabelEncoder()
    y_dept_encoded = le_dept.fit_transform(y_dept)

    # Split Data
    X_train, X_test, y_risk_encoded_train, y_risk_encoded_test, y_dept_encoded_train, y_dept_encoded_test = train_test_split(
        X, y_risk_encoded, y_dept_encoded, test_size=0.2, random_state=42, stratify=y_risk_encoded
    )
    
    from sklearn.preprocessing import StandardScaler

    # Preprocessing Pipeline
    numeric_features = ['Age', 'BP_Systolic', 'BP_Diastolic', 'Heart_Rate', 'Temperature', 'O2_Saturation']
    categorical_features = ['Gender']
    text_features = 'Symptoms'
    note_features = 'Medical_Notes'
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    text_transformer = CountVectorizer(stop_words='english', max_features=500, ngram_range=(1, 2))
    note_transformer = CountVectorizer(stop_words='english', max_features=1000, ngram_range=(1, 2)) # Increased features
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features),
            ('text', text_transformer, text_features),
            ('note', note_transformer, note_features)
        ])
    
    # Train Risk Model (XGBoost)
    risk_clf = Pipeline(steps=[('preprocessor', preprocessor),
                               ('classifier', XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=8, random_state=42, eval_metric='mlogloss'))])
    
    risk_clf.fit(X_train, y_risk_encoded_train)
    
    # Save LabelEncoder properly or just map back in main (For simplicity we return index, need mapping)
    # Actually, XGBoost returns class index. We need to save the LabelEncoder to map back.
    joblib.dump(le_risk, 'risk_le.joblib') 
    joblib.dump(risk_clf, 'risk_model.joblib')
    print("Risk Model (XGBoost) Trained and Saved.")
    
    # Evaluate Risk Model
    y_pred = risk_clf.predict(X_test)
    print("\nRisk Model Performance:")
    print(classification_report(y_risk_encoded_test, y_pred, target_names=le_risk.classes_))
    
    # Train Department Model (XGBoost)
    dept_clf = Pipeline(steps=[('preprocessor', preprocessor),
                               ('classifier', XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=8, random_state=42, eval_metric='mlogloss'))])
    
    dept_clf.fit(X_train, y_dept_encoded_train)
    
    joblib.dump(le_dept, 'dept_le.joblib')
    joblib.dump(dept_clf, 'dept_model.joblib')
    print("Department Model (XGBoost) Trained and Saved.")

    # Evaluate Dept Model
    y_dept_pred = dept_clf.predict(X_test)
    print("\nDepartment Model Performance:")
    print(classification_report(y_dept_encoded_test, y_dept_pred, target_names=le_dept.classes_))
    
    return risk_clf, dept_clf

def explain_prediction(features):
    # Simple rule-based explanation for the "Why"
    explanation = []
    
    # Check Vitals against thresholds
    if features['BP_Systolic'] > 140 or features['BP_Diastolic'] > 90:
        explanation.append("High Blood Pressure")
    if features['Heart_Rate'] > 100:
        explanation.append("Tachycardia (High HR)")
    if features['Heart_Rate'] < 60:
        explanation.append("Bradycardia (Low HR)")
    if features['Temperature'] > 38.0:
        explanation.append("Fever")
    if features['O2_Saturation'] < 95:
        explanation.append("Low Oxygen Saturation")
    if features['Age'] > 65:
        explanation.append("Advanced Age Risk Factor")
        
    if not explanation:
        explanation.append("Normal Vitals")
        
    return explanation[:3] # Return top 3 factors

if __name__ == "__main__":
    train_models()
