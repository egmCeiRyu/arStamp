// このファイルには、Firebase Authのロジックが、互換性SDK（簡易版）と、ログインおよび新規登録の2つの分離された機能で含まれています。

// ------------------------------------------------------------------
// 1. Firebaseの設定と初期化
// ------------------------------------------------------------------
const firebaseConfig = {
    // Utilize suas credenciais existentes
    apiKey: "AIzaSyAM88d_Qu-_FFDf-NF7Ckk0eYYYKAZA3pU",
    authDomain: "stamp-edfc5.firebaseapp.com",
    projectId: "stamp-edfc5",
    storageBucket: "stamp-edfc5.firebasestorage.app",
    messagingSenderId: "522739532414",
    appId: "1:522739532414:web:047e4168251b5542ce8e2f",
    measurementId: "G-2EVLH3GZNS"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const statusDisplay = document.getElementById('auth-status');

// Define a persistência da autenticação para LOCAL (mantém o usuário logado)
const persistence = firebase.auth.Auth.Persistence.LOCAL;
auth.setPersistence(persistence);


// ------------------------------------------------------------------
// 2. 機能1：ログインのみ (handleLogin)
// 既にアカウントを持っているユーザー向け。
// ------------------------------------------------------------------
function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        if (statusDisplay) {
            statusDisplay.textContent = "メールアドレスとパスワードを入力してください。";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }

    if (statusDisplay) {
        statusDisplay.textContent = "ログインを試行中...";
        statusDisplay.style.backgroundColor = '#fff3cd';
    }

    // Tenta fazer login
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login bem-sucedido. Redireção tratada pelo onAuthStateChanged.
            console.log("ログインに成功しました:", userCredential.user.email);
        })
        .catch((error) => {
            // Trata erros de login
            let errorMessage = "ログインエラーです。メールアドレスとパスワードを確認してください。";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "このメールアドレスは登録されていません。「新規登録」ボタンを使用してください。";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "パスワードが正しくありません。";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "無効なメールアドレスです。";
            } else if (error.code === 'auth/invalid-credential') {
                 // Este é o erro geral quando algo está errado (malformado, expirado, etc.)
                errorMessage = "認証情報が無効または不正です。メールアドレスの形式とパスワードを確認してください。";
            }


            if (statusDisplay) {
                statusDisplay.textContent = errorMessage;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
            console.error("Erro no Login:", error);
        });
}
window.handleLogin = handleLogin;


// ------------------------------------------------------------------
// 3. 機能2：新規登録のみ (handleSignup)
// まだ登録していないユーザー向け。
// ------------------------------------------------------------------
function handleSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        if (statusDisplay) {
            statusDisplay.textContent = "登録のためにメールアドレスとパスワードを入力してください。";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }
    
    // Alerta de senha fraca ANTES de enviar ao Firebase
    if (password.length < 6) {
        if (statusDisplay) {
            statusDisplay.textContent = "登録エラー: パスワードは最低6文字必要です。";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }

    if (statusDisplay) {
        statusDisplay.textContent = "新規ユーザーの登録を試行中...";
        statusDisplay.style.backgroundColor = '#fff3cd';
    }

    // Tenta criar um novo usuário
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registro e login bem-sucedidos. Redireção será feita pelo onAuthStateChanged.
            console.log("新規登録に成功しました:", userCredential.user.email);
            if (statusDisplay) {
                statusDisplay.textContent = `登録成功！ ${userCredential.user.email}としてログイン中...`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
        })
        .catch((error) => {
            // Trata erros de registro
            let errorMessage = "登録エラーです。もう一度お試しください。";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "このメールアドレスは既に使用されています。「ログイン」ボタンを使用してください。";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "不正な形式または無効なメールアドレスです。";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "パスワードが弱すぎます。最低6文字使用してください。";
            }
            
            if (statusDisplay) {
                statusDisplay.textContent = errorMessage;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
            console.error("Erro no Registro:", error);
        });
}
window.handleSignup = handleSignup;


// ------------------------------------------------------------------
// 4. パスワードリセット機能
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    event.preventDefault(); // Impede o link de navegar

    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("パスワードをリセットするためにメールアドレスを入力してください。");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            if (statusDisplay) {
                statusDisplay.textContent = `${email}に再設定メールが送信されました。受信トレイを確認してください。`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
        })
        .catch((error) => {
            if (statusDisplay) {
                statusDisplay.textContent = `メール送信エラー: ${error.message}`;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
        });
}
window.handlePasswordReset = handlePasswordReset;


// ------------------------------------------------------------------
// 5. 認証状態リスナー（リダイレクト）
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // Usuário logado
        if (statusDisplay) statusDisplay.textContent = `現在のユーザー: ${user.email}`;

        // Redireciona se estiver na página de login
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'newMenu.html';
            console.log("メインメニューにリダイレクト中...");
        }

    } else {
        // Usuário deslogado
        if (statusDisplay) statusDisplay.textContent = "現在のユーザー: なし（ログインしてください）";

        // Redireciona de volta para o login se estiver no menu sem autenticação
        if (currentPage === 'newMenu.html') {
            window.location.href = 'index.html';
        }
    }
});


// ------------------------------------------------------------------
// 6. ログアウト機能 (newMenu.htmlで呼び出されます)
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("ログアウトに成功しました。");
        // O onAuthStateChanged tratará o redirecionamento para index.html
    }).catch(error => {
        console.error("ログアウト中にエラーが発生しました:", error);
        alert("ログアウト中にエラーが発生しました。");
    });
}
window.signOutUser = signOutUser;