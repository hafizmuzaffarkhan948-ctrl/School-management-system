# 🎓 Horizon Academy — School Management System

### Web Technologies SP26 • Capstone Project

| Student Information | Details                 |
| ------------------- | ----------------------- |
| **Student Name**    | Hafiz Muhammad Muzaffar |
| **Roll Number**     | F24BDOCS1M01316         |

---

# 📖 Project Introduction

**Horizon Academy** is a fully responsive and modern **School Management System** developed using **Semantic HTML5**, **Pure CSS3**, and **Vanilla JavaScript (ES6+)**. The application communicates with a **JSON Server REST API** to provide persistent data storage and management.

The system consists of two dedicated interfaces:

### 👨‍🎓 Student Directory (User Panel — `index.html`)

A public-facing portal that allows visitors and student candidates to:

* Browse enrolled students
* Search and filter student records
* Submit admission applications dynamically

### 👨‍💼 Administrative Portal (Admin Panel — `admin.html`)

A management dashboard that enables administrators to:

* Monitor all student records
* View live enrollment statistics
* Update student information
* Remove student records securely

---

# 🛠 Technology Stack

### Frontend

* **HTML5**

  * Semantic Structure
  * `<nav>`
  * `<main>`
  * `<section>`
  * `<form>`
  * `<label>`

### Styling

* Pure **CSS3**
* Custom Property Variables
* Glassmorphism UI Components
* HSL-Based Color System
* Responsive Layout Design
* Smooth Animations & Transitions

### JavaScript

* Vanilla JavaScript (ES6+)
* Async/Await Syntax
* Fetch API
* Error Handling with Try/Catch

### Backend

* Local REST API powered by **json-server**
* Data persistence through `db.json`

### Bonus Feature

🌙 **Dark Mode Toggle**

* Available on both pages
* User preference stored via `localStorage`
* Automatically restored on page reload

---

# 🚀 Installation & Local Setup

Follow the steps below to run the project successfully.

---

## Step 1 — Install Node.js

Verify that Node.js is installed:

```bash
node -v
```

If the version number appears, Node.js is ready.

---

## Step 2 — Start JSON Server

Open a terminal inside the project folder:

```bash
npx json-server --watch db.json --port 3000
```

### Important

Keep this terminal running while using the application.

The API will become available at:

```text
http://localhost:3000/students
```

---

## Step 3 — Launch the Application

Open:

```text
index.html
```

using:

* Any modern browser
* VS Code Live Server Extension

Navigate to:

```text
admin.html
```

through the navigation menu.

---

# ✅ Feature Checklist

---

## 1️⃣ Student Directory (`index.html` + `app.js`)

### Dynamic Data Fetching [GET]

* Retrieves student records from JSON Server
* Generates student cards dynamically

### Smart Filtering

Filter students by:

* Grade (9–12)
* Status (Active / Pending)

### Admission Application Form [POST]

The form includes:

1. Full Name
2. Email Address
3. Phone Number
4. Target Grade
5. Date of Birth

---

### Validation Rules

#### Full Name

* Minimum 3 characters
* Letters and spaces only

#### Email

* Regex pattern validation

#### Phone Number

Format:

```text
03xx-xxxxxxx
```

#### Grade

* Must be selected

#### Date of Birth

Age must remain between:

```text
12–20 Years
```

---

### Inline Error Feedback

* Invalid fields receive red borders
* Error messages appear directly below inputs
* Submission blocked until all validations pass

---

### Automatic Re-rendering

* New admissions appear immediately
* No page refresh required

---

### Loading & Offline States

#### Loading

* Animated SVG spinner displayed

#### Error Handling

* Red alert panel shown when JSON Server is unavailable

---

### Theme Management

* Light Mode
* Dark Mode

Theme preference persists using:

```javascript
localStorage
```

---

## 2️⃣ Administrative Portal (`admin.html` + `admin.js`)

### Dedicated Admin Interface

Features:

* Purple/Violet administrative theme
* Separate navigation styling
* Clear Admin Portal labeling

---

### Full Database Visibility

Administrators can view:

* Active Students
* Pending Students
* Suspended Students

> Suspended students are hidden from the public Student Directory.

---

### Live Statistics Dashboard

Displays:

### Total Admissions

Total student records currently enrolled.

### Active Ratio

Percentage of students with:

```text
Status = Active
```

### Average Age

Calculated dynamically using each student's:

```text
dob
```

---

### Edit Student Records [PUT]

* Opens floating modal window
* Fields pre-populated automatically
* Validation performed before submission
* Sends PUT request to server

---

### Delete Student Records [DELETE]

* Browser confirmation dialog shown
* Record removed only after confirmation
* UI updates instantly

---

# 🎤 Viva Preparation Guide

---

## Q1. What does `e.preventDefault()` do?

### Answer

Normally, submitting a form causes the browser to refresh the page.

`e.preventDefault()` stops that default behavior and allows JavaScript to:

* Validate inputs
* Send API requests
* Update the UI dynamically

without reloading the page.

---

## Q2. Why doesn't `setTimeout(cb, 0)` execute immediately?

### Answer

JavaScript is single-threaded.

Execution Flow:

1. Call Stack executes synchronous code.
2. `setTimeout()` sends callback to Web APIs.
3. Callback enters Callback Queue.
4. Event Loop waits until the Call Stack is empty.
5. Callback is finally executed.

Therefore, it never runs truly "immediately."

---

## Q3. Difference Between PUT and PATCH?

### PUT

Replaces the entire resource.

Example:

```javascript
PUT /students/1
```

All fields must be sent.

---

### PATCH

Updates only selected fields.

Example:

```javascript
PATCH /students/1
```

Unspecified fields remain unchanged.

---

## Q4. Why use `JSON.stringify()` before POST requests?

### Answer

HTTP requests transmit strings or byte streams.

`JSON.stringify()` converts a JavaScript object into a JSON string that can be sent in the request body.

Example:

```javascript
body: JSON.stringify(student)
```

---

## Q5. Does `fetch()` throw an error on 404?

### Answer

No.

`fetch()` only rejects when a network error occurs.

For errors such as:

* 404
* 500

the promise still resolves.

Therefore, we manually check:

```javascript
if (!response.ok)
```

and throw a custom error.

---

## Q6. Why not use built-in browser validation?

### Answer

Native validation:

* Looks different across browsers
* Is difficult to style
* Shows temporary popup messages

Custom validation provides:

* Consistent UI
* Better styling
* Persistent feedback
* Improved user experience

---

## Q7. Why is `response.json()` called with parentheses?

### Answer

Because it is a method.

Example:

```javascript
await response.json()
```

It returns a Promise that resolves to the parsed JavaScript object obtained from the response body.

---

# 💻 Important Code Walkthroughs

---

## Fetching Student Data [GET]

```javascript
async function fetchStudents() {
  showLoadingState();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    studentsData = await response.json();
    filterAndRenderStudents();

  } catch (error) {
    showErrorState(error.message);
  }
}
```

---

## Creating a Student Record [POST]

```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newStudent)
});
```

---

## Updating a Student Record [PUT]

```javascript
const response = await fetch(`${API_URL}/${studentId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedStudent)
});
```

---

## Removing a Student Record [DELETE]

```javascript
const response = await fetch(`${API_URL}/${id}`, {
  method: 'DELETE'
});
```

---

## Dashboard Statistics Calculations

```javascript
const total = studentsData.length;

const activeCount =
  studentsData.filter(
    s => s.status === 'Active'
  ).length;

const activePercentage =
  ((activeCount / total) * 100).toFixed(1);

const totalAge =
  studentsData.reduce(
    (sum, s) =>
      sum + calculateAge(s.dob),
    0
  );

const averageAge =
  (totalAge / total).toFixed(1);
```

---

# 🎯 Conclusion

The **Horizon Academy School Management System** demonstrates practical implementation of:

* CRUD Operations (GET, POST, PUT, DELETE)
* REST API Integration
* Form Validation
* Async JavaScript
* Dynamic DOM Manipulation
* Local Storage
* Responsive Design
* Error Handling
* Modern UI/UX Principles

while adhering strictly to the project requirement of using **HTML5, CSS3, Vanilla JavaScript, and JSON Server** without any external frontend frameworks.
