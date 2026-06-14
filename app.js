/**
 * app.js - School Management System (Student Portal)
 * 
 * This file contains all the client-side JavaScript logic for the user-facing directory.
 * It demonstrates:
 * 1. Fetching data from a mock REST API using async/await with robust error handling.
 * 2. Event handling for dynamic list filtering.
 * 3. Detailed form inline validation without browser alert boxes.
 * 4. Sending new data to the server using POST.
 * 5. Dynamic DOM manipulation for list rendering, loading states, and error displays.
 * 6. Theme toggle (Light/Dark mode) persisted in localStorage.
 */

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3000/students';

// --- DOM ELEMENTS ---
const studentListContainer = document.getElementById('studentListContainer');
const admissionForm = document.getElementById('admissionForm');
const gradeFilter = document.getElementById('gradeFilter');
const statusFilter = document.getElementById('statusFilter');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastContainer = document.getElementById('toastContainer');

// Form inputs
const studentNameInput = document.getElementById('studentName');
const studentEmailInput = document.getElementById('studentEmail');
const studentPhoneInput = document.getElementById('studentPhone');
const studentGradeSelect = document.getElementById('studentGrade');
const studentDobInput = document.getElementById('studentDob');

// Global state for students data (fetched from JSON Server)
let studentsData = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme (Dark/Light Mode)
  initTheme();

  // 2. Fetch and render the students list
  fetchStudents();

  // 3. Setup event listeners
  setupEventListeners();
});

// --- THEME MANAGEMENT (Bonus Feature) ---
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
  // Dark mode toggle click
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Filters change triggers rendering
  gradeFilter.addEventListener('change', filterAndRenderStudents);
  statusFilter.addEventListener('change', filterAndRenderStudents);

  // Form submit event
  admissionForm.addEventListener('submit', handleFormSubmit);

  // Real-time input validation (clears error when user types valid data)
  studentNameInput.addEventListener('input', () => validateInput(studentNameInput, validateName));
  studentEmailInput.addEventListener('input', () => validateInput(studentEmailInput, validateEmail));
  studentPhoneInput.addEventListener('input', () => validateInput(studentPhoneInput, validatePhone));
  studentGradeSelect.addEventListener('change', () => validateInput(studentGradeSelect, validateGrade));
  studentDobInput.addEventListener('input', () => validateInput(studentDobInput, validateDob));
}

// --- API INTEGRATION: FETCH (GET) ---
/**
 * Fetches all student records from the JSON Server.
 * Demonstrates: async/await, try/catch, response.ok check, loading/error states.
 */
async function fetchStudents() {
  showLoadingState();
  
  try {
    const response = await fetch(API_URL);
    
    // Check if HTTP response status is successful (status in range 200-299)
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status} (${response.statusText})`);
    }
    
    // Parse the JSON body
    studentsData = await response.json();
    
    // Filter and render data onto the page
    filterAndRenderStudents();
  } catch (error) {
    console.error('Fetch Error:', error);
    showErrorState(error.message);
  }
}

// --- DYNAMIC RENDERING ---
/**
 * Renders the spinner loader layout inside the student directory.
 */
function showLoadingState() {
  studentListContainer.innerHTML = `
    <div class="loader-container">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-text">Loading student records, please wait...</p>
    </div>
  `;
}

/**
 * Renders a stylized error banner if the server is unreachable or offline.
 */
function showErrorState(errorMsg) {
  studentListContainer.innerHTML = `
    <div class="error-container">
      <h3 class="error-title">⚠️ Connection Error</h3>
      <p>Unable to connect to the database server. Make sure JSON Server is running locally on port 3000.</p>
      <p style="font-size: 0.8rem; opacity: 0.8;">Details: ${errorMsg}</p>
      <button class="btn btn-secondary" style="width: auto; margin-top: 1rem;" onclick="fetchStudents()">Try Again</button>
    </div>
  `;
}

/**
 * Filter data based on dropdown values and display them.
 * Note: User Directory hides "Suspended" students by default to simulate hidden administrative resources.
 */
function filterAndRenderStudents() {
  const selectedGrade = gradeFilter.value;
  const selectedStatus = statusFilter.value;

  // Filter logic
  const filtered = studentsData.filter(student => {
    // 1. Hide "Suspended" students from the user panel
    if (student.status === 'Suspended') {
      return false;
    }

    // 2. Filter by Grade if a specific grade is chosen
    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;

    // 3. Filter by Status if a specific status is chosen
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesGrade && matchesStatus;
  });

  renderStudents(filtered);
}

/**
 * Generates and injects HTML student cards into the page.
 */
function renderStudents(students) {
  if (students.length === 0) {
    studentListContainer.innerHTML = `
      <div class="empty-container">
        <div class="empty-icon" aria-hidden="true">📭</div>
        <p>No student records found matching the active filters.</p>
      </div>
    `;
    return;
  }

  // Map student objects to HTML elements
  const cardsHtml = students.map(student => {
    // Determine the status badge class
    let badgeClass = 'badge-pending';
    if (student.status === 'Active') {
      badgeClass = 'badge-active';
    }

    // Calculate Age for UI display from Date of Birth
    const age = calculateAge(student.dob);

    return `
      <div class="card student-card">
        <h3 class="student-name">${escapeHtml(student.name)}</h3>
        <span class="student-grade">${escapeHtml(student.grade)}</span>
        
        <div class="student-detail">
          <strong>Email:</strong> ${escapeHtml(student.email)}
        </div>
        <div class="student-detail">
          <strong>Phone:</strong> ${escapeHtml(student.phone)}
        </div>
        <div class="student-detail">
          <strong>Age:</strong> ${age} years (${escapeHtml(student.dob)})
        </div>
        
        <div style="margin-top: 0.5rem;">
          <span class="badge ${badgeClass}">${student.status}</span>
        </div>
      </div>
    `;
  }).join('');

  studentListContainer.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;
}

// --- FORM VALIDATION UTILITIES ---
/**
 * Helper to validate a specific input element instantly and toggle error visibility classes.
 */
function validateInput(inputElement, validationFn) {
  const isValid = validationFn(inputElement.value.trim());
  if (isValid) {
    inputElement.classList.remove('invalid');
  } else {
    inputElement.classList.add('invalid');
  }
  return isValid;
}

// Regex matching name (only alphabetic letters, spaces, minimum 3 letters)
function validateName(value) {
  const nameRegex = /^[A-Za-z\s]{3,50}$/;
  return nameRegex.test(value);
}

// Regex matching standard email address structure
function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Regex matching Pakistan Mobile phone number format e.g. 0300-1234567
function validatePhone(value) {
  const phoneRegex = /^03\d{2}-\d{7}$/;
  return phoneRegex.test(value);
}

// Ensure a grade selection is selected from dropdown
function validateGrade(value) {
  return value !== '';
}

// Validates student age limits (must be between 12 and 20 years old)
function validateDob(value) {
  if (!value) return false;
  
  const dobDate = new Date(value);
  const today = new Date();
  
  // Calculate raw age
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  
  // Adjust age if birthday hasn't happened yet this year
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  return age >= 12 && age <= 20;
}

// --- FORM SUBMISSION & API INTEGRATION (POST) ---
/**
 * Handle form submission.
 * Validates inputs, blocks submission if invalid, then performs a POST fetch request.
 */
async function handleFormSubmit(e) {
  // Prevent browser default refresh behavior
  e.preventDefault();

  // Validate all fields manually
  const isNameValid = validateInput(studentNameInput, validateName);
  const isEmailValid = validateInput(studentEmailInput, validateEmail);
  const isPhoneValid = validateInput(studentPhoneInput, validatePhone);
  const isGradeValid = validateInput(studentGradeSelect, validateGrade);
  const isDobValid = validateInput(studentDobInput, validateDob);

  // If any input validation fails, block form submission
  if (!isNameValid || !isEmailValid || !isPhoneValid || !isGradeValid || !isDobValid) {
    showToast('Please correct the validation errors in the form.', 'error');
    return;
  }

  // Create submission student object
  const newStudent = {
    name: studentNameInput.value.trim(),
    email: studentEmailInput.value.trim(),
    phone: studentPhoneInput.value.trim(),
    grade: studentGradeSelect.value,
    dob: studentDobInput.value,
    status: 'Pending' // Set new submissions to Pending by default
  };

  // Disable submit button during fetch call to prevent double clicks
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newStudent)
    });

    if (!response.ok) {
      throw new Error(`Failed to save record: ${response.status} (${response.statusText})`);
    }

    const savedRecord = await response.json();
    showToast(`Application for ${savedRecord.name} submitted successfully!`, 'success');

    // Reset admission form fields
    admissionForm.reset();
    
    // Clear validation borders
    clearFormValidationClasses();

    // Fetch updated data list from server and re-render list automatically
    await fetchStudents();

  } catch (error) {
    console.error('Submission Error:', error);
    showToast(`Submission failed: ${error.message}`, 'error');
  } finally {
    // Re-enable submission button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
  }
}

/**
 * Removes all invalid classes from input elements
 */
function clearFormValidationClasses() {
  studentNameInput.classList.remove('invalid');
  studentEmailInput.classList.remove('invalid');
  studentPhoneInput.classList.remove('invalid');
  studentGradeSelect.classList.remove('invalid');
  studentDobInput.classList.remove('invalid');
}

// --- GENERAL HELPER UTILITIES ---

/**
 * Safely escape HTML characters to prevent XSS vulnerability attacks in dynamic strings.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper to compute age from Date string.
 */
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

/**
 * Displays a non-blocking floating notification toast inside the viewport.
 * Avoids browser alert() popups.
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; margin-left:1rem; cursor:pointer; font-weight:bold; color:inherit;" onclick="this.parentElement.remove()">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
