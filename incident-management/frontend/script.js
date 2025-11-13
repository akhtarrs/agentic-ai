// Frontend client‑side logic for Incident Manager
// ---------------------------------------------------
// This script interacts with the Flask backend defined in backend/app.py.
// It populates the incident table, handles adding new incidents, and
// allows updating an incident's status.

// Base URL of the API – adjust if the backend runs on a different host/port.
const API_BASE = 'http://localhost:5000';

/**
 * Fetches the list of incidents from the backend and renders them into the table.
 */
function fetchIncidents() {
    fetch(`${API_BASE}/incidents`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.querySelector('#incident-table tbody');
            // Clear any existing rows
            tbody.innerHTML = '';
            data.forEach(incident => {
                const tr = document.createElement('tr');

                // ID cell
                const idTd = document.createElement('td');
                idTd.textContent = incident.id;
                tr.appendChild(idTd);

                // Title cell
                const titleTd = document.createElement('td');
                titleTd.textContent = incident.title;
                tr.appendChild(titleTd);

                // Description cell
                const descTd = document.createElement('td');
                descTd.textContent = incident.description;
                tr.appendChild(descTd);

                // Status cell
                const statusTd = document.createElement('td');
                statusTd.textContent = incident.status.charAt(0).toUpperCase() + incident.status.slice(1);
                tr.appendChild(statusTd);

                // Actions cell – a simple status selector
                const actionsTd = document.createElement('td');
                const select = document.createElement('select');
                const statuses = ['open', 'inprogress', 'closed'];
                statuses.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s;
                    option.textContent = s.charAt(0).toUpperCase() + s.slice(1);
                    if (s === incident.status) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                // When the user picks a different status, update the backend.
                select.addEventListener('change', function () {
                    const newStatus = this.value;
                    // Optimistically update UI – the fetchIncidents call will refresh the table.
                    updateStatus(incident.id, newStatus);
                });
                actionsTd.appendChild(select);
                tr.appendChild(actionsTd);

                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching incidents:', error);
        });
}

/**
 * Handles the submission of the "Add Incident" form.
 * @param {Event} event - The submit event.
 */
function handleAddIncident(event) {
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const statusInput = document.getElementById('status'); // hidden field, default "open"

    const payload = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusInput.value
    };

    fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create incident');
            }
            return response.json();
        })
        .then(() => {
            // Refresh the list and reset the form
            fetchIncidents();
            document.getElementById('incident-form').reset();
        })
        .catch(error => {
            console.error('Error adding incident:', error);
        });
}

/**
 * Sends a request to update the status of a specific incident.
 * @param {number} id - Incident identifier.
 * @param {string} newStatus - The new status value (e.g., "open" or "closed").
 */
function updateStatus(id, newStatus) {
    fetch(`${API_BASE}/incidents/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            return response.json();
        })
        .then(() => {
            // Refresh the incident list to reflect the change.
            fetchIncidents();
        })
        .catch(error => {
            console.error(`Error updating status for incident ${id}:`, error);
        });
}

// ---------------------------------------------------------------------
// Event wiring – executed once the DOM is fully loaded.
// ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchIncidents);
    }
    // Initial load of incidents
    fetchIncidents();
});
