// admin-login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(".login-form");
    const emailInput = document.getElementById("lg-email");
    const passwordInput = document.getElementById("lg-password");
    const loginButton = document.getElementById("login-button");
    const loginButtonText = loginButton.querySelector('span');
    const loginButtonSpinner = loginButton.querySelector('.spinner-border');
    const errorMessage = document.getElementById("error-message");

    // CHECK: If user is ALREADY logged in, redirect to dashboard
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    // Handle login form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous errors
        errorMessage.classList.add('d-none');
        
        // Get credentials
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Basic validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Show loading state
        loginButton.disabled = true;
        loginButtonText.textContent = 'Signing in...';
        loginButtonSpinner.classList.remove('d-none');
        
        try {
            // Attempt to sign in
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login successful:', userCredential.user.email);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Show user-friendly error message
            let message = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later.';
            }
            
            showError(message);
        } finally {
            // Reset button state
            loginButton.disabled = false;
            loginButtonText.textContent = ' Sign In';
            loginButtonSpinner.classList.add('d-none');
            // form.reset(); // Clear the form fields
        }
    });
    
    // Helper function to show errors
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }
});