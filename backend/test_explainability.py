from explainability import ExplainabilityEngine

def test_explainability():
    engine = ExplainabilityEngine()
    
    print("Testing Thresholds...")
    # Test High HR
    anomalies = engine.detect_anomalies({'Heart_Rate': 130}, [])
    assert "CRITICAL: Extreme Tachycardia (130 bpm)" in anomalies
    print("- High HR Detected: OK")

    # Test High Fever
    anomalies = engine.detect_anomalies({'Temperature': 40.0}, [])
    assert "High Fever (40.0°C)" in anomalies
    print("- High Fever Detected: OK")

    print("\nTesting Trends...")
    # Test Sudden Spike
    history = [{'Heart_Rate': 80}]
    current = {'Heart_Rate': 110} # +30 jump
    anomalies = engine.detect_anomalies(current, history)
    
    found_spike = False
    for a in anomalies:
        if "Sudden HR Spike" in a:
            found_spike = True
            break
    
    if found_spike:
        print("- Sudden HR Spike Detected: OK")
    else:
        print(f"- Sudden HR Spike FAILED. Anomalies: {anomalies}")

    print("\nAll Tests Passed!")

if __name__ == "__main__":
    test_explainability()
