// ------------------------------------------------------------------
// 1. Firebase Configuration
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

// Persistência local
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ------------------------------------------------------------------
// 2. LOGIN
// ------------------------------------------------------------------
function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusDisplay.textContent = "メールアドレスとパスワードを入力してください。";
        statusDisplay.style.backgroundColor = '#ffcdd2';
        return;
    }

    statusDisplay.textContent = "ログイン中...";
    statusDisplay.style.backgroundColor = '#fff3cd';

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("ログイン成功:", userCredential.user.email);
        })
        .catch(error => {
            console.error(error);
            statusDisplay.textContent = error.message;
            statusDisplay.style.backgroundColor = '#ffcdd2';
        });
}

// ------------------------------------------------------------------
// 3. SIGNUP
// ------------------------------------------------------------------
function handleSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusDisplay.textContent = "登録するメールアドレスとパスワードを入力してください。";
        statusDisplay.style.backgroundColor = '#ffcdd2';
        return;
    }

    if (password.length < 6) {
        statusDisplay.textContent = "パスワードは6文字以上必要です。";
        statusDisplay.style.backgroundColor = '#ffcdd2';
        return;
    }

    statusDisplay.textContent = "登録中...";
    statusDisplay.style.backgroundColor = '#fff3cd';

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("登録成功:", userCredential.user.email);
            statusDisplay.textContent = `登録成功！ ${userCredential.user.email}としてログイン中...`;
            statusDisplay.style.backgroundColor = '#c8e6c9';
        })
        .catch(error => {
            console.error(error);
            statusDisplay.textContent = error.message;
            statusDisplay.style.backgroundColor = '#ffcdd2';
        });
}

// ------------------------------------------------------------------
// 4. PASSWORD RESET
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) return alert("メールアドレスを入力してください。");

    auth.sendPasswordResetEmail(email)
        .then(() => {
            statusDisplay.textContent = `${email}に再設定メールを送信しました。`;
            statusDisplay.style.backgroundColor = '#c8e6c9';
        })
        .catch(error => {
            statusDisplay.textContent = error.message;
            statusDisplay.style.backgroundColor = '#ffcdd2';
        });
}

// ------------------------------------------------------------------
// 5. AUTH STATE LISTENER
// ------------------------------------------------------------------
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("ログイン中ユーザー:", user.email);
        // Redireciona sempre que usuário está logado
        window.location.href = "newMenu.html";
    } else {
        console.log("ユーザー未ログイン");
    }
});

// ------------------------------------------------------------------
// 6. LOGOUT
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("ログアウト成功");
    }).catch(error => console.error(error));
}
