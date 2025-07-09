import google.generativeai as genai
import os
import google.api_core.exceptions # Import the specific exceptions module

# Configure your API key
# Ensure your GEMINI_API_KEY environment variable is set
# For example: export GEMINI_API_KEY="YOUR_API_KEY"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    text_to_embed = "This is a test sentence for the embedding model to process."
    embedding = genai.embed_content(
        model="models/embedding-001",
        content=text_to_embed,
        task_type="retrieval_query" # Required parameter
    )
    print("Embedding successful!")
    # print(f"Embedding: {embedding['embedding']}") # Uncomment to see the full embedding vector
except google.api_core.exceptions.DeadlineExceeded as e:
    print(f"Error: Request timed out (DeadlineExceeded). This often indicates a network issue or the API taking too long to respond.")
    print(f"Details: {e}")
except google.api_core.exceptions.ResourceExhausted as e:
    # This is often the actual rate limit error (HTTP 429)
    print(f"Error: Rate limit exceeded (ResourceExhausted). Please slow down your requests.")
    print(f"Details: {e}")
except Exception as e:
    # Catch any other unexpected errors
    print(f"An unexpected error occurred: {e}")
    # You can inspect the type of 'e' to understand other possible errors
    # print(f"Error Type: {type(e)}")