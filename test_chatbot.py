import requests
import json

url = "http://localhost:8000/api/edu/chat"
payload = {
    "question": "What is a glioma? Explain briefly."
}

print("Testing Gemini chatbot...")
print(f"Sending request to: {url}")
print(f"Question: {payload['question']}\n")

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ SUCCESS! Chatbot Response:")
        print(f"{result['answer']}")
    else:
        print(f"\n❌ ERROR Response:")
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"\n❌ Error: {e}")
