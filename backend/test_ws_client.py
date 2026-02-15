import asyncio
import websockets
import json
import time

async def test():
    uri = "ws://localhost:8000/ws/vitals"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            # Listen for 3 messages
            for i in range(3):
                msg = await websocket.recv()
                data = json.loads(msg)
                print(f"\n--- Message {i+1} ---")
                print(f"Patient Count: {len(data)}")
                if data:
                    print(f"Sample Patient Vitals (ID: {data[0]['Patient_ID']}):")
                    print(f"  HR: {data[0]['Heart_Rate']}")
                    print(f"  Temp: {data[0]['Temperature']}")
                    print(f"  Risk: {data[0].get('Risk_Level')}")
                    print(f"  Explanation: {data[0].get('explanation')}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    # Install websockets if not present
    # pip install websockets
    asyncio.run(test())
