# Incident Manager

## Project Overview

**Incident Manager** is a lightweight web‑based system for tracking and updating incidents. It consists of a small Flask backend that stores incidents **in‑memory** and a vanilla‑JavaScript frontend that lets users:
- Create new incidents (title, description, status).
- View a list of all incidents.
- Change the status of an incident (e.g., from `open` to `closed`).
- Refresh the list to see the latest data.

The backend exposes a simple REST API, while the frontend is a static HTML page (`frontend/index.html`) with accompanying CSS and JavaScript. No database is required – everything lives in the server process’s memory, which makes the project easy to spin up for demos, teaching, or rapid prototyping.

---

## Prerequisites

| Tool | Minimum Version | Why?
|------|----------------|------
| **Python** | 3.9 | Runs the Flask backend.
| **Node.js** *(optional)* | any | If you prefer to serve the static files with a Node server instead of opening the HTML file directly or using Flask’s static route.
| **Git** | any | To clone the repository.

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository‑url>
   cd <repo‑directory>
   ```

2. **Create and activate a Python virtual environment, then install dependencies**
   ```bash
   cd backend
   python -m venv venv               # create virtual env
   source venv/bin/activate           # on Windows: venv\Scripts\activate
   pip install -r requirements.txt   # install Flask & Flask‑CORS
   ```

3. **Run the backend**
   ```bash
   python app.py
   ```
   The server will start on `http://127.0.0.1:5000` (default Flask port) and expose the API endpoints.

4. **Open the frontend**
   - **Quick way**: Open `frontend/index.html` directly in a browser (the JavaScript talks to the Flask server at `http://localhost:5000`).
   - **Alternative**: Serve the static files via Flask (add a static route) or with any static‑file server (e.g., `npx serve frontend`).

You should now see the **Incident Manager** UI. Use the form to add incidents, the dropdown in each row to change status, and the **Refresh Incidents** button to reload the list.

---

## API Reference

All endpoints are relative to the base URL `http://localhost:5000` (adjust if you run the server on a different host/port).

### 1. Health‑check
- **Endpoint**: `GET /`
- **Purpose**: Simple sanity check that the service is up.
- **Response** (JSON, `200`)
  ```json
  { "status": "ok" }
  ```

### 2. Create Incident
- **Endpoint**: `POST /incidents`
- **Request Body** (JSON)
  ```json
  {
    "title": "Database outage",
    "description": "Customers cannot access their accounts.",
    "status": "open"   // optional, defaults to "open"
  }
  ```
- **Responses**
  - `201 Created` – Returns the created incident including its generated `id`.
    ```json
    {
      "id": 1,
      "title": "Database outage",
      "description": "Customers cannot access their accounts.",
      "status": "open"
    }
    ```
  - `400 Bad Request` – Missing required fields or invalid JSON.

### 3. List Incidents
- **Endpoint**: `GET /incidents`
- **Response** (`200`)
  ```json
  [
    {
      "id": 1,
      "title": "Database outage",
      "description": "Customers cannot access their accounts.",
      "status": "open"
    },
    {
      "id": 2,
      "title": "UI glitch",
      "description": "Buttons overlap on mobile.",
      "status": "closed"
    }
  ]
  ```

### 4. Update Incident Status
- **Endpoint**: `PUT /incidents/<incident_id>` (e.g., `PUT /incidents/1`)
- **Request Body** (JSON)
  ```json
  { "status": "closed" }
  ```
- **Responses**
  - `200 OK` – Returns the updated incident.
    ```json
    {
      "id": 1,
      "title": "Database outage",
      "description": "Customers cannot access their accounts.",
      "status": "closed"
    }
    ```
  - `400 Bad Request` – Missing `status` field.
  - `404 Not Found` – No incident with the supplied ID.

---

## Frontend Usage Guide

1. **Add a New Incident**
   - Fill in **Title** and **Description** in the form at the top of the page.
   - Click **Add Incident**.
   - The UI will automatically refresh the table to show the newly created incident.

2. **Change an Incident’s Status**
   - In the **Actions** column of the incident row, use the dropdown to select `Open` or `Closed`.
   - The change is sent to the backend via a `PUT` request; the table refreshes shortly after.

3. **Refresh the Incident List**
   - Click the **Refresh Incidents** button at any time to re‑fetch the current list from the server.
   - The button is useful if you suspect the UI got out of sync (e.g., after a server restart).

---

## Data Persistence

- The backend stores incidents **only in memory** (Python dictionary).
- **Important:** All data is lost when the Flask process stops or restarts. This design keeps the project simple and avoids external dependencies, but for production use you would replace the in‑memory store with a database (SQLite, PostgreSQL, etc.).

---

## Troubleshooting

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| `Connection refused` when the frontend tries to call the API | Backend not running or running on a different port | Start the backend (`python app.py`) and verify it prints `Running on http://127.0.0.1:5000/`. Adjust `API_BASE` in `frontend/script.js` if you changed the port.
| `404 Not Found` on `POST /incidents` | Sending request to the wrong URL (e.g., missing trailing slash) | Ensure the request URL is `http://localhost:5000/incidents` (no extra path segments).
| Form does not clear after adding an incident | JavaScript error before `fetchIncidents()` is called | Open the browser console (F12) and look for error messages. Common issues are CORS errors – make sure the backend has `flask_cors.CORS` enabled (it is by default).
| No incidents appear after refresh | Backend restarted and memory cleared | Remember that data is volatile. Re‑add incidents or switch to a persistent storage solution.
| CORS error in the console | Backend not allowing cross‑origin requests | The project already imports `flask_cors` and calls `CORS(app)`. If you edited `app.py`, ensure the import line remains.

If you encounter other issues, double‑check that you are using **Python 3.9+** and that all packages from `requirements.txt` are installed in the active virtual environment.

---

## License

This project is provided under the MIT License – feel free to use, modify, and distribute it.
