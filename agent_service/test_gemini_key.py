"""
Run this from inside agent_service/ with your venv active:
    python test_gemini_key.py

It isolates two things:
  1. Is Settings() actually loading GEMINI_API_KEY from .env?
  2. Does that key actually work against the Gemini API?
"""

import sys

from config import get_settings

settings = get_settings()

print("=" * 60)
print("STEP 1 — Config check")
print("=" * 60)
key = settings.gemini_api_key
if not key:
    print("❌ settings.gemini_api_key is None/empty.")
    print("   -> .env is not being found, or the process was")
    print("      never restarted after you added the key.")
    sys.exit(1)
else:
    print(f"✅ Key loaded. Length={len(key)}  Prefix={key[:6]}...")

print()
print("=" * 60)
print("STEP 2 — Live call to Gemini")
print("=" * 60)

try:
    import google.generativeai as genai
except ImportError:
    print("❌ google-generativeai not installed. Run:")
    print("   pip install google-generativeai")
    sys.exit(1)

genai.configure(api_key=key)

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Say 'hello' in one word.")
    print("✅ SUCCESS. Gemini responded:")
    print(response.text)
except Exception as e:
    print("❌ FAILED calling Gemini API.")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error: {e}")
    print()
    print("If this is a 403 / PERMISSION_DENIED / API_KEY_INVALID error,")
    print("the key format/source is the problem, not your config loading.")
    print("Get a fresh key from https://aistudio.google.com/apikey")
    print("(it should start with 'AIzaSy...').")