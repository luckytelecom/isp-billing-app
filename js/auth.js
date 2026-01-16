// Authentication functions

// Check if user is logged in
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log("User is logged in:", user.email);
            
            // Update UI with user info
            const userNameElements = document.querySelectorAll('#user-name, .user-name');
            if (userNameElements.length > 0) {
                userNameElements.forEach(element => {
                    element.textContent = user.displayName || user.email.split('@')[0];
                });
            }
            
            // Show user email in dashboard if element exists
            const userEmailElement = document.getElementById('user-email');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
        } else {
            // User is not signed in
            console.log("User is not logged in");
            
            // Redirect to login page if not already there
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('index.html')) {
                window.location.href = 'login.html';
            }
        }
    });
}

// Login user
function loginUser(email, password, rememberMe) {
    // Show loading state
    const loginBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User logged in:", user.email);
            
            // Set persistence if remember me is checked
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            auth.setPersistence(persistence)
                .then(() => {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    console.error("Error setting persistence:", error);
                    window.location.href = 'dashboard.html';
                });
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Login error:", errorCode, errorMessage);
            
            // Show error message
            let message = "Login failed. Please check your credentials.";
            if (errorCode === 'auth/invalid-email') {
                message = "Invalid email address.";
            } else if (errorCode === 'auth/user-disabled') {
                message = "This account has been disabled.";
            } else if (errorCode === 'auth/user-not-found') {
                message = "No account found with this email.";
            } else if (errorCode === 'auth/wrong-password') {
                message = "Incorrect password.";
            }
            
            alert(message);
            
            // Reset button
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        });
}

// Logout user
function logoutUser() {
    if (confirm("Are you sure you want to log out?")) {
        auth.signOut()
            .then(() => {
                // Sign-out successful
                console.log("User logged out");
                window.location.href = 'index.html';
            })
            .catch((error) => {
                // An error happened
                console.error("Logout error:", error);
                alert("Error logging out. Please try again.");
            });
    }
}

// Initialize auth check when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check auth on all pages except index.html
    if (!window.location.pathname.includes('index.html')) {
        checkAuth();
    }
});