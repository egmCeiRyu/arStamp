// ------------------------------------------------------------------
// 1. FIREBASE CONFIGURATION (Compatible with v8/Compat SDK)
// ------------------------------------------------------------------
const firebaseConfig = {
    // Keep your existing configuration
    apiKey: "AIzaSyAM88d_Qu-_FFDf-NF7Ckk0eYYYKAZA3pU",
    authDomain: "stamp-edfc5.firebaseapp.com",
    projectId: "stamp-edfc5",
    storageBucket: "stamp-edfc5.firebasestorage.app",
    messagingSenderId: "522739532414",
    appId: "1:522739532414:web:047e4168251b5542ce8e2f",
    measurementId: "G-2EVLH3GZNS"
};

// Initialize Firebase (Compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const statusDisplay = document.getElementById('auth-status');

// Use local persistence for remembering users
const persistence = firebase.auth.Auth.Persistence.LOCAL;
auth.setPersistence(persistence);


// ------------------------------------------------------------------
// 2. MAIN AUTH FUNCTION: LOGIN ONLY (No Automatic Signup)
// ------------------------------------------------------------------
function loginOrSignup() { // Function name remains the same for HTML compatibility
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        if (statusDisplay) {
            statusDisplay.textContent = "Please enter both email and password.";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }

    if (statusDisplay) {
        statusDisplay.textContent = "Attempting to log in...";
        statusDisplay.style.backgroundColor = '#fff3cd';
    }

    // 🔑 ACTION: Only attempt to sign in. 
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            console.log("Login successful:", userCredential.user.email);
            // Redirection handled by onAuthStateChanged listener (Section 4)
        })
        .catch((error) => {
            // 🔑 IMPORTANT: Handles all errors (incorrect password, user not found, invalid credential)
            // No attempt to create a new user is made.
            let errorMessage = "Login failed. Please check your email and password.";
            
            // Provide more specific feedback for common errors if needed:
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Login failed. This email address is not registered.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Login failed. The password you entered is incorrect.";
            }

            if (statusDisplay) {
                statusDisplay.textContent = errorMessage;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
            console.error("Login Error:", error);
        });
}

window.loginOrSignup = loginOrSignup;

// ------------------------------------------------------------------
// 3. PASSWORD RESET FUNCTION
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    event.preventDefault(); // Stop the link from navigating

    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("Please enter your email address to reset the password.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            if (statusDisplay) {
                statusDisplay.textContent = `Password reset email sent to ${email}. Check your inbox.`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
        })
        .catch((error) => {
            if (statusDisplay) {
                statusDisplay.textContent = `Error sending reset email: ${error.message}`;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
        });
}

window.handlePasswordReset = handlePasswordReset;


// ------------------------------------------------------------------
// 4. AUTHENTICATION LISTENER (REDIRECTION)
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    // Existing redirection logic remains the same
    if (statusDisplay) {
        if (user) {
            statusDisplay.textContent = `Current User: ${user.email} (UID: ${user.uid})`;

            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            const currentPage = window.location.pathname.split('/').pop();

            // 1️⃣ Redirect to a saved URL if one exists
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
                console.log(`Redirecting to saved URL: ${redirectUrl}`);

            // 2️⃣ If on the login page, redirect to the menu
            } else if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'newMenu.html';
                console.log("Redirecting to main menu...");
            }

        } else {
            // User is logged out
            statusDisplay.textContent = "Current User: None (Please sign in)";

            // If on the menu page without login, redirect back to login
            if (window.location.pathname.endsWith('newMenu.html')) {
                window.location.href = 'index.html';
            }
        }
    } else {
        console.log(user ? `User logged in: ${user.uid}` : "User logged out");
    }
});


// ------------------------------------------------------------------
// 5. LOGOUT (for newMenu.html/other pages)
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("Logout successful");
        if (window.location.pathname.endsWith('newMenu.html')) {
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error("Error during sign out:", error);
    });
}
window.signOutUser = signOutUser;