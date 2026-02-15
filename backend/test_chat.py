import requests
import json

url = "http://localhost:8000/chat"
payload = {
    "message": "Hello, are you a triage bot?",
    "history": []
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", response.json())
    else:
        print("Error:", response.text)
except requests.exceptions.ConnectionError:
    print("Failed to connect. Is the server running?")
except Exception as e:
    print(f"An error occurred: {e}")
