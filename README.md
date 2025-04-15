# Gemini API Integration Guide

This guide provides detailed steps for integrating with the Gemini API, including authentication, request formatting, response parsing, and error handling. It also provides Python code examples demonstrating common use cases, such as text generation, translation, and summarization.

## Authentication

To authenticate with the Gemini API, you need an API key. You can obtain an API key by signing up for a Google Cloud account and enabling the Gemini API.

Once you have an API key, you can include it in your requests as follows:

```python
import http.client
import json

# Replace with your actual API key
API_KEY = "YOUR_API_KEY"

conn = http.client.HTTPSConnection("generativelanguage.googleapis.com")

payload = json.dumps({
    "contents": [{ "parts": [{ "text": "Write a story about a magic backpack." }] }]
})

headers = {
    'Content-type': 'application/json'
}

conn.request("POST", f"/v1beta/models/gemini-1.0-pro:generateContent?key={API_KEY}", payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))
```

## Request Formatting

The Gemini API uses JSON for request formatting. The basic structure of a request is as follows:

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

For more complex requests, you can include multiple parts in the `contents` array. Each part can be either text or image data.

## Response Parsing

The Gemini API returns JSON responses. The basic structure of a response is as follows:

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Generated text here"
          }
        ]
      }
    }
  ],
  "usageMetadata": {
    "promptTokenCount": "...",
    "candidatesTokenCount": "...",
    "totalTokenCount": "..."
  }
}
```

You can access the generated text from the `candidates` array. The `usageMetadata` field provides information about token usage.

## Error Handling

The Gemini API returns error responses in JSON format. The basic structure of an error response is as follows:

```json
{
  "error": {
    "code": 400,
    "message": "Error message here",
    "status": "INVALID_ARGUMENT"
  }
}
```

You should check the `code` and `message` fields to determine the cause of the error.

## Code Examples

### Text Generation

```python
import http.client
import json

API_KEY = "YOUR_API_KEY"

def generate_text(prompt):
    conn = http.client.HTTPSConnection("generativelanguage.googleapis.com")
    payload = json.dumps({
        "contents": [{ "parts": [{ "text": prompt }] }]
    })
    headers = {
        'Content-type': 'application/json'
    }
    conn.request("POST", f"/v1beta/models/gemini-1.0-pro:generateContent?key={API_KEY}", payload, headers)
    res = conn.getresponse()
    data = res.read()
    return json.loads(data.decode("utf-8"))

# Example usage
prompt = "Write a short poem about the moon."
response = generate_text(prompt)
print(response)
```

### Translation

```python
import http.client
import json

API_KEY = "YOUR_API_KEY"

def translate_text(text, target_language):
    prompt = f"Translate the following text to {target_language}: {text}"
    conn = http.client.HTTPSConnection("generativelanguage.googleapis.com")
    payload = json.dumps({
        "contents": [{ "parts": [{ "text": prompt }] }]
    })
    headers = {
        'Content-type': 'application/json'
    }
    conn.request("POST", f"/v1beta/models/gemini-1.0-pro:generateContent?key={API_KEY}", payload, headers)
    res = conn.getresponse()
    data = res.read()
    return json.loads(data.decode("utf-8"))

# Example usage
text = "Hello, how are you?"
target_language = "French"
response = translate_text(text, target_language)
print(response)
```

### Summarization

```python
import http.client
import json

API_KEY = "YOUR_API_KEY"

def summarize_text(text):
    prompt = f"Summarize the following text: {text}"
    conn = http.client.HTTPSConnection("generativelanguage.googleapis.com")
    payload = json.dumps({
        "contents": [{ "parts": [{ "text": prompt }] }]
    })
    headers = {
        'Content-type': 'application/json'
    }
    conn.request("POST", f"/v1beta/models/gemini-1.0-pro:generateContent?key={API_KEY}", payload, headers)
    res = conn.getresponse()
    data = res.read()
    return json.loads(data.decode("utf-8"))

# Example usage
text = "The quick brown fox jumps over the lazy dog. This is a classic sentence used to demonstrate all letters of the alphabet."
response = summarize_text(text)
print(response)
```

## Version Compatibility

This guide is based on the `v1beta` version of the Gemini API. Ensure that your code is compatible with this version.

## Limitations

-   The Gemini API is a cloud-based service, so you need an internet connection to use it.
-   The Gemini API has usage limits. Please refer to the official documentation for more details.
-   Due to the limitations of the WebContainer environment, the code examples provided here cannot be executed directly. You will need a Python environment with internet access to run them.
