const fileTableBody = document.querySelector('#fileTable tbody');
const fileUpload = document.getElementById('fileUpload');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const uploadBtn = document.getElementById('uploadBtn');

// In-memory file metadata
let filesData = [];

// ✅ Trigger hidden file input on button click
uploadBtn.addEventListener('click', () => {
  fileUpload.click();
});

// Handle file upload and store metadata only
fileUpload.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const metadata = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type || 'Unknown',
      date: new Date().toLocaleString(),
      description: ''
    };
    filesData.push(metadata);
  });
  renderTable();
  fileUpload.value = ''; // reset input
});

// Render the file table dynamically
function renderTable() {
  fileTableBody.innerHTML = '';
  filesData.forEach(file => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="selectItem" data-id="${file.id}" /></td>
      <td>${file.name}</td>
      <td>${file.date}</td>
      <td>${file.type}</td>
      <td><input class="desc-input" type="text" placeholder="Add description..." value="${file.description}" data-id="${file.id}" /></td>
    `;
    fileTableBody.appendChild(row);
  });

  // Add listeners for description updates
  document.querySelectorAll('.desc-input').forEach(input => {
    input.addEventListener('input', e => {
      const id = e.target.dataset.id;
      const file = filesData.find(f => f.id === id);
      if (file) file.description = e.target.value;
    });
  });
}

// Simulate download of selected files
downloadBtn.addEventListener('click', () => {
  const selected = getSelectedFiles();
  if (selected.length === 0) {
    alert('No files selected!');
    return;
  }
  alert(`Simulated download of ${selected.length} file(s):\n` + selected.map(f => f.name).join(', '));
});

// Delete selected files
deleteBtn.addEventListener('click', () => {
  const selectedIds = getSelectedFiles().map(f => f.id);
  if (selectedIds.length === 0) {
    alert('No files selected!');
    return;
  }
  if (confirm('Are you sure you want to delete the selected file(s)?')) {
    filesData = filesData.filter(f => !selectedIds.includes(f.id));
    renderTable();
  }
});

// Utility to get selected files
function getSelectedFiles() {
  const checkboxes = document.querySelectorAll('.selectItem:checked');
  const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
  return filesData.filter(f => ids.includes(f.id));
}

// Select or deselect all
selectAll.addEventListener('change', () => {
  const checkboxes = document.querySelectorAll('.selectItem');
  checkboxes.forEach(cb => cb.checked = selectAll.checked);
});
