# app.py - Flask Server powered by LangGraph
import os
import sys
from flask import Flask, request, jsonify, send_from_directory

# Load environment variables if python-dotenv is present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__, static_folder=".")

# Import LangGraph student bot
try:
    from graph import ask_student_bot, student_graph
    HAS_GRAPH = True
except Exception as e:
    HAS_GRAPH = False
    GRAPH_ERROR = str(e)


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "app": "UniBot AI (LangGraph Edition)",
        "langgraph_active": HAS_GRAPH
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()
    history = data.get("history", [])
    persona = data.get("persona", "balanced")
    client_api_key = data.get("apiKey", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message."}), 400

    # If client passed an API key from frontend settings, use it
    if client_api_key and not os.getenv("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = client_api_key

    if HAS_GRAPH:
        try:
            bot_reply = ask_student_bot(user_message, history=history, persona=persona)
            return jsonify({
                "reply": bot_reply,
                "engine": "LangGraph (StateGraph)"
            })
        except Exception as err:
            return jsonify({
                "reply": f"⚠️ LangGraph Execution Error: {str(err)}",
                "engine": "Error"
            }), 500
    else:
        # Fallback if dependencies not yet installed
        return jsonify({
            "reply": f"### 🎓 UniBot Notice\n\nLangGraph dependencies are installing or not yet loaded: `{GRAPH_ERROR}`.\nRun `pip install -r requirements.txt` to enable the full state graph!",
            "engine": "Notice"
        })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"\n=======================================================")
    print(f"🎓 UniBot (LangGraph Edition) is starting on port {port}")
    print(f"📡 Web URL: http://localhost:{port}")
    print(f"📦 Graph Status: {'Loaded and Ready' if HAS_GRAPH else 'Missing Dependencies'}")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=False)
