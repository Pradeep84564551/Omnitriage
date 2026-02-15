
import requests
import json
import sys

def test_ollama():
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "qwen3:1.7b",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": False,
        "think": False
    }
    
    print(f"Testing connection to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Ollama Response:")
            print(response.json()['message']['content'])
            return True
        else:
            print(f"Failed. Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("CONNECTION ERROR: Could not connect to localhost:11434.")
        print("Please ensure 'ollama serve' is running.")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    if test_ollama():
        sys.exit(0)
    else:
        sys.exit(1)
