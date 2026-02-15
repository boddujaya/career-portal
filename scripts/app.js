const STORAGE_KEY = "northbridge.jobs";
const USERS_KEY = "northbridge.users";
const CURRENT_USER_KEY = "northbridge.currentUser";

const seedJobs = [
  {
    id: "job-1001",
    title: "Associate Consultant",
    department: "Strategy",
    location: "Chicago, IL",
    type: "Full-time",
    summary: "Support client engagements with market analysis, stakeholder interviews, and structured recommendations.",
    applyUrl: "https://example.com/apply/associate-consultant",
    postedAt: "2026-02-10"
  },
  {
    id: "job-1002",
    title: "Senior Business Analyst",
    department: "Operations",
    location: "New York, NY",
    type: "Full-time",
    summary: "Lead data-driven process improvement projects and build executive-ready insights.",
    applyUrl: "https://example.com/apply/senior-business-analyst",
    postedAt: "2026-02-12"
  },
  {
    id: "job-1003",
    title: "Digital Transformation Intern",
    department: "Technology Consulting",
    location: "Remote - US",
    type: "Internship",
    summary: "Contribute to digital roadmaps, product evaluations, and PMO support for enterprise clients.",
    applyUrl: "https://example.com/apply/digital-intern",
    postedAt: "2026-02-08"
  }
];

function initializeStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedJobs));
  }
}

function getJobs() {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderPublicJobs() {
  const jobList = document.getElementById("jobList");
  if (!jobList) return;

  const searchInput = document.getElementById("searchInput");
  const locationFilter = document.getElementById("locationFilter");
  const typeFilter = document.getElementById("typeFilter");

  function refresh() {
    const search = searchInput.value.toLowerCase().trim();
    const location = locationFilter.value;
    const type = typeFilter.value;

    const jobs = getJobs().filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search) ||
        job.department.toLowerCase().includes(search) ||
        job.summary.toLowerCase().includes(search);
      const matchLocation = location ? job.location === location : true;
      const matchType = type ? job.type === type : true;
      return matchSearch && matchLocation && matchType;
    });

    if (!jobs.length) {
      jobList.innerHTML = '<p class="empty">No jobs match your filters.</p>';
      return;
    }

    jobList.innerHTML = jobs
      .map(
        (job) => `
          <article class="job-card">
            <div class="job-meta">${job.department} | ${job.location} | ${job.type}</div>
            <h3>${job.title}</h3>
            <p>${job.summary}</p>
            <div class="item-row">
              <span class="job-meta">Posted ${formatDate(job.postedAt)}</span>
              <a class="btn btn-primary" href="${job.applyUrl}" target="_blank" rel="noopener noreferrer">Apply</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  const locations = [...new Set(getJobs().map((job) => job.location))];
  locations.forEach((loc) => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    locationFilter.appendChild(option);
  });

  [searchInput, locationFilter, typeFilter].forEach((el) => {
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  });

  refresh();
}

function renderAdminJobs() {
  const form = document.getElementById("jobForm");
  const container = document.getElementById("adminJobList");
  if (!form || !container) return;
  if (!getCurrentUser()) {
    window.location.href = "login.html?next=admin.html";
    return;
  }

  const fields = {
    id: document.getElementById("jobId"),
    title: document.getElementById("title"),
    department: document.getElementById("department"),
    location: document.getElementById("location"),
    type: document.getElementById("type"),
    summary: document.getElementById("summary"),
    applyUrl: document.getElementById("applyUrl")
  };
  const cancelEdit = document.getElementById("cancelEdit");
  const status = document.getElementById("formStatus");

  function resetForm() {
    form.reset();
    fields.id.value = "";
    cancelEdit.classList.add("hidden");
  }

  function refresh() {
    const jobs = getJobs().sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    if (!jobs.length) {
      container.innerHTML = '<p class="empty">No jobs posted yet.</p>';
      return;
    }

    container.innerHTML = jobs
      .map(
        (job) => `
        <article class="admin-item" data-id="${job.id}">
          <h3>${job.title}</h3>
          <p class="job-meta">${job.department} | ${job.location} | ${job.type}</p>
          <p>${job.summary}</p>
          <div class="item-row">
            <button class="btn btn-light" data-action="edit" data-id="${job.id}" type="button">Edit</button>
            <button class="btn btn-light warn" data-action="delete" data-id="${job.id}" type="button">Delete</button>
            <a class="btn btn-primary" href="${job.applyUrl}" target="_blank" rel="noopener noreferrer">Apply URL</a>
          </div>
        </article>
      `
      )
      .join("");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const jobs = getJobs();
    const payload = {
      id: fields.id.value || `job-${Date.now()}`,
      title: fields.title.value.trim(),
      department: fields.department.value.trim(),
      location: fields.location.value.trim(),
      type: fields.type.value,
      summary: fields.summary.value.trim(),
      applyUrl: fields.applyUrl.value.trim(),
      postedAt: new Date().toISOString().split("T")[0]
    };

    const existingIndex = jobs.findIndex((job) => job.id === payload.id);
    if (existingIndex >= 0) {
      payload.postedAt = jobs[existingIndex].postedAt;
      jobs[existingIndex] = payload;
      status.textContent = "Job updated successfully.";
    } else {
      jobs.push(payload);
      status.textContent = "Job posted successfully.";
    }
    setJobs(jobs);
    resetForm();
    refresh();
  });

  cancelEdit.addEventListener("click", () => {
    resetForm();
    status.textContent = "Edit canceled.";
  });

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    const jobs = getJobs();
    const job = jobs.find((item) => item.id === id);
    if (!job) return;

    if (action === "edit") {
      fields.id.value = job.id;
      fields.title.value = job.title;
      fields.department.value = job.department;
      fields.location.value = job.location;
      fields.type.value = job.type;
      fields.summary.value = job.summary;
      fields.applyUrl.value = job.applyUrl;
      cancelEdit.classList.remove("hidden");
      status.textContent = "Editing selected job.";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "delete") {
      const filtered = jobs.filter((item) => item.id !== id);
      setJobs(filtered);
      status.textContent = "Job deleted successfully.";
      if (fields.id.value === id) {
        resetForm();
      }
      refresh();
    }
  });

  refresh();
}

function setYear() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }
}

function parseNextUrl(defaultUrl) {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || defaultUrl;
}

function renderRegister() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  const status = document.getElementById("registerStatus");
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("error");

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
      status.textContent = "Passwords do not match.";
      status.classList.add("error");
      return;
    }

    const users = getUsers();
    const exists = users.some((user) => user.email === email);
    if (exists) {
      status.textContent = "Email is already registered. Please login.";
      status.classList.add("error");
      return;
    }

    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      password
    };
    users.push(user);
    setUsers(users);
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    status.textContent = "Registration successful. Redirecting...";
    window.setTimeout(() => {
      window.location.href = parseNextUrl("admin.html");
    }, 600);
  });
}

function renderLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const status = document.getElementById("loginStatus");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("error");

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const users = getUsers();
    const matched = users.find((user) => user.email === email && user.password === password);

    if (!matched) {
      status.textContent = "Invalid email or password.";
      status.classList.add("error");
      return;
    }

    setCurrentUser({ id: matched.id, name: matched.name, email: matched.email });
    status.textContent = "Login successful. Redirecting...";
    window.setTimeout(() => {
      window.location.href = parseNextUrl("admin.html");
    }, 500);
  });
}

function renderAuthNav() {
  const loginNav = document.getElementById("loginNav");
  const registerNav = document.getElementById("registerNav");
  const logoutBtn = document.getElementById("logoutBtn");
  const authStatus = document.getElementById("authStatus");
  if (!logoutBtn) return;

  const user = getCurrentUser();
  if (user) {
    if (loginNav) loginNav.classList.add("hidden");
    if (registerNav) registerNav.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    if (authStatus) {
      authStatus.textContent = `Signed in: ${user.name}`;
      authStatus.classList.remove("hidden");
    }
  } else {
    if (loginNav) loginNav.classList.remove("hidden");
    if (registerNav) registerNav.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    if (authStatus) authStatus.classList.add("hidden");
  }

  logoutBtn.addEventListener("click", () => {
    clearCurrentUser();
    window.location.href = "index.html";
  });
}

setYear();
renderAuthNav();
renderPublicJobs();
renderAdminJobs();
renderRegister();
renderLogin();
