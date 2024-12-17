// Global state
let currentUser = null;

// Section Navigation
function showSection(sectionId) {
  document.querySelectorAll(".content section").forEach((section) => {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  if (sectionId === "blog") loadBlogPosts();
  if (sectionId === "admin" && currentUser?.role === "admin") loadAdminData();
  if (sectionId === "resources") initializeResourceSection();
}

// Register (Backend Integrated)
function register() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  fetch("https://backend-6dd0.onrender.com/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "User registered successfully!") {
        alert(data.message);
        showSection("login");
      } else {
        alert(data.message);
      }
    })
    .catch(() => alert("Network error. Please try again."));
}

// Login (Backend Integrated)
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  fetch("https://backend-6dd0.onrender.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Login successful!") {
        alert(data.message);
        currentUser = data.user;
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateAuthUI();
        showSection(currentUser.role === "admin" ? "admin" : "home");
      } else {
        alert(data.message);
      }
    })
    .catch(() => alert("Network error. Please try again."));
}

// Logout
function logout() {
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  updateAuthUI();
  showSection("home");
}

// Update Authentication UI
function updateAuthUI() {
  const authLinks = document.getElementById("authLinks");
  currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (currentUser) {
    authLinks.innerHTML = `
      <span style="color: white;">Welcome, ${currentUser.name}</span>
      ${
        currentUser.role === "admin"
          ? `<a href="#" onclick="showSection('admin')" class="auth-link">Admin Panel</a>`
          : ""
      }
      <a href="#" onclick="logout()" class="auth-link">Logout</a>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="#" onclick="showSection('login')" class="auth-link">Login</a>
      <a href="#" onclick="showSection('register')" class="auth-link">Register</a>
    `;
  }
}

// Blog Post Functions (Backend Placeholder)
function createBlogPost() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  if (!currentUser) {
    alert("Please login to create a post");
    showSection("login");
    return;
  }

  if (!title || !content) {
    alert("Please fill in all fields");
    return;
  }

  fetch("https://backend-6dd0.onrender.com/blog-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      author: currentUser.name,
      date: new Date().toLocaleDateString(),
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to create blog post");
      }
    })
    .then(() => {
      alert("Blog post created successfully!");
      loadBlogPosts();
    })
    .catch((error) => alert(error.message));
}

function loadBlogPosts() {
  fetch("https://backend-6dd0.onrender.com/blog-posts")
    .then((response) => response.json())
    .then((posts) => {
      const blogPostsContainer = document.getElementById("blogPosts");
      blogPostsContainer.innerHTML = posts
        .map(
          (post) => `
          <div class="blog-post">
            <h2>${post.title}</h2>
            <p><strong>${post.author}</strong> on ${post.date}</p>
            <p>${post.content}</p>
          </div>
        `
        )
        .join("");
    })
    .catch(() => alert("Failed to load blog posts. Please try again."));
}
// Admin Panel Functions
function loadAdminData() {
  if (!currentUser || currentUser.role !== "admin") return;
  loadUserList();
  loadAdminBlogList();
}

function loadUserList() {
  fetch("https://backend-6dd0.onrender.com/users")
    .then((response) => response.json())
    .then((users) => {
      const userList = document.getElementById("userList");
      userList.innerHTML = users
        .map(
          (user) => `
          <div class="list-item">
            <div>
              <div>${user.name} (${user.email})</div>
              <span class="user-role ${
                user.role === "admin" ? "admin-role" : ""
              }">${user.role || "user"}</span>
            </div>
            <div class="action-buttons">
              ${
                user.role !== "admin"
                  ? `<button onclick="deleteUser(${user.id})" class="delete-btn">Delete</button>`
                  : ""
              }
            </div>
          </div>
        `
        )
        .join("");
    })
    .catch(() => alert("Failed to load users. Please try again."));
}

function loadAdminBlogList() {
  fetch("https://backend-6dd0.onrender.com/blog-posts")
    .then((response) => response.json())
    .then((posts) => {
      const blogList = document.getElementById("adminBlogList");
      blogList.innerHTML = posts
        .map(
          (post) => `
          <div class="list-item">
            <div>
              <div>${post.title}</div>
              <small>By ${post.author} on ${post.date}</small>
            </div>
            <div class="action-buttons">
              <button onclick="deletePost(${post.id})" class="delete-btn">Delete</button>
            </div>
          </div>
        `
        )
        .join("");
    })
    .catch(() => alert("Failed to load blog posts. Please try again."));
}

// Contact Form
function submitForm() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (name && email && message) {
    alert("Thank you for your message. We will get back to you soon!");
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
  } else {
    alert("Please fill in all fields.");
  }
}
function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  fetch(`https://backend-6dd0.onrender.com/users/${userId}`, {
    method: "DELETE",
  })
    .then(() => loadUserList())
    .catch(() => alert("Failed to delete user. Please try again."));
}
function toggleUserRole(userId) {
  fetch(`https://backend-6dd0.onrender.com/users/${userId}/role`, {
    method: "PATCH",
  })
    .then(() => loadUserList())
    .catch(() => alert("Failed to update user role. Please try again."));
}
function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  fetch(`https://backend-6dd0.onrender.com/blog-posts/${postId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        alert("Post deleted successfully!");
        loadBlogPosts();
        if (currentUser?.role === "admin") loadAdminBlogList();
      } else {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to delete post");
        });
      }
    })
    .catch((error) => alert(error.message));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  updateAuthUI();
  showSection("home");
  initializeResourceSection();
});

// Resource Section Initialization
function initializeResourceSection() {
  document.querySelectorAll(".expand-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const resourceItem = this.closest(".resource-item");
      resourceItem.classList.toggle("expanded");
      this.textContent = resourceItem.classList.contains("expanded")
        ? "Show Less"
        : "Show More";
    });
  });
}
