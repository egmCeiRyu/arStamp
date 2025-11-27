// app.js

// ------------------------------------------------------------------
// ⚠️ 1. YOUR FIREBASE CONFIGURATION (REQUIRED)
// YOU MUST REPLACE ALL "YOUR_..." PLACEHOLDERS WITH YOUR PROJECT'S CONFIGURATION!
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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

// Get UI elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const statusDisplay = document.getElementById('auth-status');

// ------------------------------------------------------------------
// 2. AUTHENTICATION FUNCTIONS
// ------------------------------------------------------------------

// Sign Up Function (Called by the 'Sign Up' button)
function signUp() {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert('Sign Up Successful! You are now logged in.');
        })
        .catch((error) => {
            // Display error message (e.g., 'auth/weak-password', 'auth/email-already-in-use')
            alert(`Sign Up Failed: ${error.message}`);
        });
}

// Sign In Function (Called by the 'Sign In' button)
function signIn() {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // SUCCESS: Redirect the user!
            window.location.href = 'newMenu.html'; 
        })
        .catch((error) => {
            // Handle Errors
            alert(`Sign In Failed: ${error.message}`);
        });
}

// Sign Out Function (Called by the 'Sign Out' button)
function signOutUser() {
    auth.signOut().then(() => {
        alert('Signed Out Successfully!');
    }).catch((error) => {
        console.error('Sign Out Error:', error);
        alert('Sign Out Failed.');
    });
}

// ------------------------------------------------------------------
// 3. AUTH STATE LISTENER
// This runs whenever the user's logged-in status changes (on page load, sign-in, sign-out)
// ------------------------------------------------------------------
// app.js

// AUTH STATE LISTENER
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        statusDisplay.textContent = `Current User: ${user.email} (UID: ${user.uid})`;

        // IMPORTANT: Check if the user is on the login page (index.html) before redirecting
        // This prevents an infinite loop if this code is also on newMenu.html
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            window.location.href = 'newMenu.html'; 
        }

    } else {
        // User is signed out
        statusDisplay.textContent = 'Current User: None (Please Sign In)';
        // Optional: If they are on newMenu.html and sign out, redirect them back to index.html
        // if (window.location.pathname.endsWith('newMenu.html')) {
        //     window.location.href = 'index.html'; 
        // }
    }
});