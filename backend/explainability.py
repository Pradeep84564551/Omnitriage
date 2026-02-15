class ExplainabilityEngine:
    def __init__(self):
        self.thresholds = {
            'Heart_Rate': {'high': 120, 'low': 50},
            'Temperature': {'high': 39.0, 'low': 35.0},
            'O2_Saturation': {'low': 92},
            'BP_Systolic': {'high': 160, 'low': 90},
            'BP_Diastolic': {'high': 100, 'low': 60}
        }

    def detect_anomalies(self, current_data: dict, history: list) -> list:
        """
        Analyzes current vitals against thresholds and historical trends.
        Returns a list of explanation strings.
        """
        explanations = []

        # 1. Threshold Checks
        hr = current_data.get('Heart_Rate')
        if hr:
            if hr > self.thresholds['Heart_Rate']['high']:
                explanations.append(f"CRITICAL: Extreme Tachycardia ({hr} bpm)")
            elif hr < self.thresholds['Heart_Rate']['low']:
                 explanations.append(f"CRITICAL: Bradycardia ({hr} bpm)")

        temp = current_data.get('Temperature')
        if temp:
            if temp > self.thresholds['Temperature']['high']:
                explanations.append(f"High Fever ({temp}°C)")
            elif temp < self.thresholds['Temperature']['low']:
                 explanations.append(f"Hypothermia Risk ({temp}°C)")

        o2 = current_data.get('O2_Saturation')
        if o2 and o2 < self.thresholds['O2_Saturation']['low']:
             explanations.append(f"Hypoxia Alert (O2 {o2}%)")
        
        bp_sys = current_data.get('BP_Systolic')
        if bp_sys:
            if bp_sys > self.thresholds['BP_Systolic']['high']:
                explanations.append(f"Hypertensive Crisis (Sys {bp_sys})")
            elif bp_sys < self.thresholds['BP_Systolic']['low']:
                explanations.append(f"Hypotension (Sys {bp_sys})")

        # 2. Trend Analysis (if history exists)
        if len(history) >= 2:
            prev_data = history[-1] # Last recorded state
            
            # Rapid Heart Rate Spike (> 20 bpm increase)
            if hr and prev_data.get('Heart_Rate'):
                diff = hr - prev_data['Heart_Rate']
                if diff > 20:
                     explanations.append(f"Sudden HR Spike (+{diff} bpm)")
            
            # Rapid O2 Drop (> 5% drop)
            if o2 and prev_data.get('O2_Saturation'):
                diff = prev_data['O2_Saturation'] - o2
                if diff > 5:
                     explanations.append(f"Rapid O2 Desaturation (-{diff}%)")

        return explanations
