// ------------------------------------------------------------------
// 1. FIREBASE CONFIGURATION
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

// Persistence setting is maintained, although less critical for passwordless flow
const persistence = firebase.auth.Auth.Persistence.LOCAL;


// ------------------------------------------------------------------
// 2. PASSWORDLESS SIGN-IN LINK SETTINGS
// ------------------------------------------------------------------
const actionCodeSettings = {
    // 💡 IMPORTANT: Replace this with the full URL of the page 
    // where the sign-in link is handled (e.g., your login page: index.html).
    // Ensure this URL is also whitelisted in your Firebase Console -> Authentication -> Settings -> Authorized domains.
    url: window.location.href.split('?')[0], 
    
    // Must be true to handle the sign-in in the app/browser
    handleCodeInApp: true, 
};


// ------------------------------------------------------------------
// 3. NEW AUTH FLOW: SEND SIGN-IN LINK
// ------------------------------------------------------------------
function sendSignInLink() {
    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => {
            // Save the email locally to complete the sign-in when the link is clicked
            localStorage.setItem('emailForSignIn', email);
            if (statusDisplay) {
                statusDisplay.textContent = `A confirmation link has been sent to your email (${email}). Please check your inbox.`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
            console.log("Sign-in link sent successfully.");
        })
        .catch((error) => {
            if (statusDisplay) {
                statusDisplay.textContent = `Error sending link: ${error.message}`;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
            console.error("Sign-in link error:", error);
        });
}

window.sendSignInLink = sendSignInLink;


// ------------------------------------------------------------------
// 4. HANDLE SIGN-IN LINK REDIRECT (Complete Sign-in)
// ------------------------------------------------------------------
function handleSignInLink() {
    // Check if the current URL contains the sign-in link parameters
    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = localStorage.getItem('emailForSignIn');
        
        // If the email is not in storage, prompt the user to re-enter it for security
        if (!email) {
            email = window.prompt('Please re-enter your email to complete the sign-in process.'); 
        }

        if (email) {
            if (statusDisplay) {
                statusDisplay.textContent = "Completing authentication...";
                statusDisplay.style.backgroundColor = '#fff3cd';
            }

            // Complete the sign-in process
            auth.signInWithEmailLink(email, window.location.href)
                .then((result) => {
                    // Cleanup local storage and URL
                    localStorage.removeItem('emailForSignIn');
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // The onAuthStateChanged listener (Section 5) handles the final redirection
                    console.log(`Login successful: ${result.user.email}`);
                })
                .catch((error) => {
                    // Handle sign-in errors (e.g., expired link, invalid link)
                    if (statusDisplay) {
                        statusDisplay.textContent = `Login Error: ${error.message}`;
                        statusDisplay.style.backgroundColor = '#ffcdd2';
                    }
                    console.error("Login Error:", error);
                });
        }
    }
}
// Run this function immediately on page load
handleSignInLink();


// ------------------------------------------------------------------
// 5. AUTHENTICATION LISTENER (REDIRECTION)
// ------------------------------------------------------------------
// This listener remains the same and handles redirection after successful login/logout
auth.onAuthStateChanged((user) => {
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
// 6. LOGOUT 
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

// NOTE: The original handlePasswordReset function has been removed as it is not applicable 
// to a pure passwordless authentication flow.