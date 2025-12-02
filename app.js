// ------------------------------------------------------------------
// 1. FIREBASE CONFIGURATION (Compatible with v8/Compat SDK)
// ------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAM88d_Qu-_FFDf-NF7Ckk0eYYYKAZA3pU",
    authDomain: "stamp-edfc5.firebaseapp.com",
    projectId: "stamp-edfc5",
    storageBucket: "stamp-edfc5.firebasestorage.app",
    messagingSenderId: "522739532414",
    appId: "1:522739532414:web:047e4168251b5542ce8e2f",
    measurementId: "G-2EVLH3GZNS"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const statusDisplay = document.getElementById('auth-status');

// Local persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ------------------------------------------------------------------
// LOGIN OR SIGNUP
// ------------------------------------------------------------------
function loginOrSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusDisplay.textContent = "Please enter both email and password.";
        statusDisplay.style.backgroundColor = '#ffcdd2';
        return;
    }

    statusDisplay.textContent = "Attempting to log in...";
    statusDisplay.style.backgroundColor = '#fff3cd';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Login successful:", userCredential.user.email);
        })
        .catch((loginError) => {
            if (loginError.code === 'auth/user-not-found') {
                console.log("User not found. Creating account...");
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log("Sign up successful:", userCredential.user.email);
                    })
                    .catch((signupError) => {
                        statusDisplay.textContent = `Sign Up Error: ${signupError.message}`;
                        statusDisplay.style.backgroundColor = '#ffcdd2';
                    });
            } else {
                statusDisplay.textContent = `Login Error: ${loginError.message}`;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
        });
}

window.loginOrSignup = loginOrSignup;

// ------------------------------------------------------------------
// RESET PASSWORD
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("Please enter your email address to reset the password.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            statusDisplay.textContent = `Password reset email sent to ${email}.`;
            statusDisplay.style.backgroundColor = '#c8e6c9';
        })
        .catch((error) => {
            statusDisplay.textContent = `Error sending reset email: ${error.message}`;
            statusDisplay.style.backgroundColor = '#ffcdd2';
        });
}

window.handlePasswordReset = handlePasswordReset;

// ------------------------------------------------------------------
// AUTH LISTENER
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    if (user) {
        statusDisplay.textContent = `Current User: ${user.email}`;
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'newMenu.html';
        }

    } else {
        statusDisplay.textContent = "Current User: None (Please sign in)";
        if (window.location.pathname.endsWith('newMenu.html')) {
            window.location.href = 'index.html';
        }
    }
});

// ------------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("Logout successful");
        window.location.href = 'index.html';
    });
}

window.signOutUser = signOutUser;
