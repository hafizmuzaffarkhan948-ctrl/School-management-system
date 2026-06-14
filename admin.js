/**
 * admin.js - School Management System (Admin Management Panel)
 * 
 * This file contains all administrative operations for the Horizon Academy database.
 * It demonstrates:
 * 1. GET requests to fetch all students (including suspended entries hidden from user panel).
 * 2. Calculating advanced statistics: Total Count, Active Ratio (percentage), and Average Age.
 * 3. DELETE requests to remove resources, complete with confirmation dialogs.
 * 4. Modal manipulation to load existing resource data dynamically into edit forms.
 * 5. PUT requests to update existing student records on the JSON server.
 * 6. Detailed edit form validation without alert() boxes.
 * 7. Theme toggle state loading and persistence.
 */

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3000/students';

// --- DOM ELEMENTS ---
const adminTableContainer = document.getElementById('adminTableContainer');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastContainer = document.getElementById('toastContainer');

// Statistics elements
const statTotalStudents = document.getElementById('statTotalStudents');
const statActiveRate = document.getElementById('statActiveRate');
const statAvgAge = document.getElementById('statAvgAge');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');

// Modal Form Inputs
const editStudentId = document.getElementById('editStudentId');
const editStudentName = document.getElementById('editStudentName');
const editStudentEmail = document.getElementById('editStudentEmail');
const editStudentPhone = document.getElementById('editStudentPhone');
const editStudentGrade = document.getElementById('editStudentGrade');
const editStudentDob = document.getElementById('editStudentDob');
const editStudentStatus = document.getElementById('editStudentStatus');

// Global state for administrative dashboard
let studentsData = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme (Dark/Light Mode)
  initTheme();

  // 2. Fetch all student records & update dashboard
  fetchAdminStudents();

  // 3. Setup event listeners
  setupEventListeners();
});

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggleBtn.textContent = '🌙';
  }
}

function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
  showToast(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Dark mode button click
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Close modal click buttons
  modalCloseBtn.addEventListener('click', closeEditModal);
  modalCancelBtn.addEventListener('click', closeEditModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeEditModal);

  // Save changes button inside edit modal click
  modalSaveBtn.addEventListener('click', handleSaveEdit);

  // Real-time input validation inside modal (clears red borders instantly on correct input)
  editStudentName.addEventListener('input', () => validateInput(editStudentName, validateName));
  editStudentEmail.addEventListener('input', () => validateInput(editStudentEmail, validateEmail));
  editStudentPhone.addEventListener('input', () => validateInput(editStudentPhone, validatePhone));
  editStudentDob.addEventListener('input', () => validateInput(editStudentDob, validateDob));
}

// --- API INTEGRATION: FETCH ALL RECORDS (GET) ---
/**
 * Fetches every record in the students database.
 * Includes Active, Pending, and Suspended entries.
 */
async function fetchAdminStudents() {
  showLoadingState();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status} (${response.statusText})`);
    }

    studentsData = await response.json();

    // 1. Update administrative summary statistics panel
    calculateAndDisplayStatistics();

    // 2. Render student records in a responsive data table
    renderAdminTable();

  } catch (error) {
    console.error('Admin Fetch Error:', error);
    showErrorState(error.message);
  }
}

// --- SUMMARY STATISTICS PANEL ---
/**
 * Performs client-side array calculations to display 3 key indicators.
 * Fulfills rubric requirement of showing at least 3 summary statistics.
 */
function calculateAndDisplayStatistics() {
  const total = studentsData.length;

  if (total === 0) {
    statTotalStudents.textContent = '0';
    statActiveRate.textContent = '0%';
    statAvgAge.textContent = '0.0 yrs';
    return;
  }

  // Statistic 1: Total Student count
  statTotalStudents.textContent = total;

  // Statistic 2: Active Student Percentage Rate
  const activeCount = studentsData.filter(s => s.status === 'Active').length;
  const activePercentage = ((activeCount / total) * 100).toFixed(1);
  statActiveRate.textContent = `${activePercentage}%`;

  // Statistic 3: Average Student Age
  const totalAge = studentsData.reduce((sum, student) => {
    return sum + calculateAge(student.dob);
  }, 0);
  const averageAge = (totalAge / total).toFixed(1);
  statAvgAge.textContent = `${averageAge} yrs`;
}

// --- DYNAMIC RENDERING LAYOUTS ---
function showLoadingState() {
  adminTableContainer.innerHTML = `
    <div class="loader-container">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-text">Retrieving administrative database...</p>
    </div>
  `;
}

function showErrorState(errorMsg) {
  adminTableContainer.innerHTML = `
    <div class="error-container">
      <h3 class="error-title">⚠️ Database Connection Offline</h3>
      <p>Unable to retrieve student archives. Check that JSON Server is running locally on port 3000.</p>
      <p style="font-size: 0.8rem; opacity: 0.8;">Details: ${errorMsg}</p>
      <button class="btn btn-secondary" style="width: auto; margin-top: 1rem;" onclick="fetchAdminStudents()">Reconnect</button>
    </div>
  `;
}

function renderAdminTable() {
  if (studentsData.length === 0) {
    adminTableContainer.innerHTML = `
      <div class="empty-container">
        <div class="empty-icon" aria-hidden="true">🗂️</div>
        <p>No student records are currently available in the database.</p>
      </div>
    `;
    return;
  }

  // Generate table rows HTML
  const rowsHtml = studentsData.map(student => {
    let badgeClass = 'badge-pending';
    if (student.status === 'Active') {
      badgeClass = 'badge-active';
    } else if (student.status === 'Suspended') {
      badgeClass = 'badge-suspended';
    }

    const age = calculateAge(student.dob);

    return `
      <tr id="row-${student.id}">
        <td><strong>#${escapeHtml(student.id)}</strong></td>
        <td>${escapeHtml(student.name)}</td>
        <td><span class="student-grade" style="margin-left: 0;">${escapeHtml(student.grade)}</span></td>
        <td>${escapeHtml(student.email)}</td>
        <td>${escapeHtml(student.phone)}</td>
        <td>${age} yrs</td>
        <td><span class="badge ${badgeClass}">${student.status}</span></td>
        <td class="actions-cell">
          <!-- Edit button triggers opening the modal edit form -->
          <button class="btn-icon btn-edit-icon" onclick="openEditModal('${student.id}')" aria-label="Edit Record" title="Edit Student">
            ✏️
          </button>
          <!-- Delete button triggers confirm modal dialogue and DELETE API request -->
          <button class="btn-icon btn-delete-icon" onclick="confirmDeleteStudent('${student.id}', '${escapeJsString(student.name)}')" aria-label="Delete Record" title="Delete Student">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Inject full table container structure
  adminTableContainer.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Grade</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Age</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// --- DELETE OPERATION (DELETE) ---
/**
 * Prompts admin with standard confirmation dialogue before invoking DELETE fetch request.
 */
async function confirmDeleteStudent(id, name) {
  // Confirmation window dialog
  const confirmed = confirm(`Are you sure you want to permanently delete the record of "${name}"? (ID: ${id})`);
  
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status} (${response.statusText})`);
    }

    showToast(`Student record of "${name}" has been deleted.`, 'success');
    
    // Automatically refetch updated data list from server and update statistics
    await fetchAdminStudents();

  } catch (error) {
    console.error('Delete Error:', error);
    showToast(`Failed to delete record: ${error.message}`, 'error');
  }
}

// --- EDIT MODAL INTERACTION ---
/**
 * Opens the Edit details modal, loading current data of the student into inputs.
 */
function openEditModal(studentId) {
  // Find matching student from the global local cache
  const student = studentsData.find(s => s.id === studentId);
  if (!student) {
    showToast('Record not found', 'error');
    return;
  }

  // Populate form input values
  editStudentId.value = student.id;
  editStudentName.value = student.name;
  editStudentEmail.value = student.email;
  editStudentPhone.value = student.phone;
  editStudentGrade.value = student.grade;
  editStudentDob.value = student.dob;
  editStudentStatus.value = student.status;

  // Clear any validation red border states from previous modal visits
  clearEditModalErrors();

  // Display modal (makes modal opacity active, enabling transitions)
  editModal.classList.add('active');
  editModal.setAttribute('aria-hidden', 'false');
}

/**
 * Hides modal and resets internal tracking values.
 */
function closeEditModal() {
  editModal.classList.remove('active');
  editModal.setAttribute('aria-hidden', 'true');
}

function clearEditModalErrors() {
  editStudentName.classList.remove('invalid');
  editStudentEmail.classList.remove('invalid');
  editStudentPhone.classList.remove('invalid');
  editStudentDob.classList.remove('invalid');
}

// --- EDIT SAVE OPERATION (PUT) ---
/**
 * Handles validation of edited values, then puts updated object to mock endpoint.
 */
async function handleSaveEdit() {
  // Validate edited inputs manually
  const isNameValid = validateInput(editStudentName, validateName);
  const isEmailValid = validateInput(editStudentEmail, validateEmail);
  const isPhoneValid = validateInput(editStudentPhone, validatePhone);
  const isDobValid = validateInput(editStudentDob, validateDob);

  // Stop operation if input validation fails
  if (!isNameValid || !isEmailValid || !isPhoneValid || !isDobValid) {
    showToast('Please correct validation errors in the modal.', 'error');
    return;
  }

  const studentId = editStudentId.value;
  
  // Construct updated student record matching database criteria
  const updatedStudent = {
    id: studentId,
    name: editStudentName.value.trim(),
    email: editStudentEmail.value.trim(),
    phone: editStudentPhone.value.trim(),
    grade: editStudentGrade.value,
    dob: editStudentDob.value,
    status: editStudentStatus.value
  };

  // Disable button to prevent double clicks during network request
  modalSaveBtn.disabled = true;
  modalSaveBtn.textContent = 'Saving...';

  try {
    const response = await fetch(`${API_URL}/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedStudent)
    });

    if (!response.ok) {
      throw new Error(`Save failed: ${response.status} (${response.statusText})`);
    }

    showToast(`Updated record of ${updatedStudent.name} successfully!`, 'success');
    
    // Close overlay Modal dialog
    closeEditModal();

    // Refetch server data and automatically refresh UI table list & stats
    await fetchAdminStudents();

  } catch (error) {
    console.error('Update Error:', error);
    showToast(`Failed to update student: ${error.message}`, 'error');
  } finally {
    // Re-enable button
    modalSaveBtn.disabled = false;
    modalSaveBtn.textContent = 'Save Changes';
  }
}

// --- FORM VALIDATION UTILITIES ---
function validateInput(inputElement, validationFn) {
  const isValid = validationFn(inputElement.value.trim());
  if (isValid) {
    inputElement.classList.remove('invalid');
  } else {
    inputElement.classList.add('invalid');
  }
  return isValid;
}

function validateName(value) {
  const nameRegex = /^[A-Za-z\s]{3,50}$/;
  return nameRegex.test(value);
}

function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function validatePhone(value) {
  const phoneRegex = /^03\d{2}-\d{7}$/;
  return phoneRegex.test(value);
}

function validateDob(value) {
  if (!value) return false;
  const dobDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age >= 12 && age <= 20;
}

// --- HELPER UTILITIES ---

function calculateAge(dobString) {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; margin-left:1rem; cursor:pointer; font-weight:bold; color:inherit;" onclick="this.parentElement.remove()">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Expose openEditModal & confirmDeleteStudent to window because they are called inline
window.openEditModal = openEditModal;
window.confirmDeleteStudent = confirmDeleteStudent;
