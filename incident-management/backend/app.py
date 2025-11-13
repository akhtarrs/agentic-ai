from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

app = Flask(__name__)
CORS(app)

# In‑memory storage for incidents
incidents = {}
next_id = 1
# Lock to make ID generation thread‑safe
_id_lock = threading.Lock()

def generate_id():
    """Return a unique integer ID and increment the global counter.
    The operation is protected by a lock to be safe in multi‑threaded
    environments (e.g., when Flask runs with multiple workers).
    """
    global next_id
    with _id_lock:
        current = next_id
        next_id += 1
    return current

@app.route('/', methods=['GET'])
def health_check():
    """Simple health‑check endpoint used by the frontend or monitoring tools."""
    return jsonify({"status": "ok"})

@app.route('/incidents', methods=['POST'])
def create_incident():
    """Create a new incident.
    Expected JSON payload::
        {
            "title": "...",
            "description": "...",
            "status": "open"   # optional, defaults to "open"
        }
    Returns the created incident with a 201 status code.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    title = data.get('title')
    description = data.get('description')
    if title is None or description is None:
        return jsonify({"error": "'title' and 'description' are required fields"}), 400

    status = data.get('status', 'open')
    incident_id = generate_id()
    incident = {
        "id": incident_id,
        "title": title,
        "description": description,
        "status": status
    }
    incidents[incident_id] = incident
    return jsonify(incident), 201

@app.route('/incidents/<int:incident_id>', methods=['PUT'])
def update_incident_status(incident_id):
    """Update only the status of an existing incident.
    Expected JSON payload::
        {"status": "closed"}
    """
    if incident_id not in incidents:
        return jsonify({"error": "Incident not found"}), 404

    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "'status' field is required"}), 400

    incidents[incident_id]['status'] = data['status']
    return jsonify(incidents[incident_id])

@app.route('/incidents', methods=['GET'])
def list_incidents():
    """Return a list of all stored incidents."""
    return jsonify(list(incidents.values()))

if __name__ == '__main__':
    # Running in debug mode makes development easier; remove for production.
    app.run(debug=True)
