// ------------------------------------------------------------------
// 1. CONFIGURAÇÃO FIREBASE
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

// Inicializa o Firebase (Compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const statusDisplay = document.getElementById('auth-status');


// ------------------------------------------------------------------
// 2. FUNÇÃO ÚNICA: LOGIN → ou → SIGNUP AUTOMÁTICO
// ------------------------------------------------------------------
function loginOrSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("メールアドレスとパスワードを入力してください。");
        return;
    }

    // 1️⃣ Tenta LOGIN primeiro
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log("ログイン成功");
        })
        .catch((error) => {

            // Se o usuário NÃO EXISTE → cria conta automaticamente
            if (error.code === "auth/user-not-found") {

                console.log("ユーザーが存在しません → 新規登録します");

                auth.createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        alert("新規登録完了！ログインしました。");
                    })
                    .catch((signupError) => {
                        alert(`登録エラー: ${signupError.message}`);
                    });

            } else {
                // Qualquer outro erro (senha errada, email inválido etc.)
                alert(`ログインエラー: ${error.message}`);
            }
        });
}

// Disponibiliza para o HTML
window.loginOrSignup = loginOrSignup;


// ------------------------------------------------------------------
// 3. LISTENER DE AUTENTICAÇÃO (REDIRECIONAMENTO)
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {

    if (statusDisplay) {
        if (user) {
            statusDisplay.textContent = `Current User: ${user.email} (UID: ${user.uid})`;

            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            const currentPage = window.location.pathname.split('/').pop();

            // 1️⃣ Se havia uma URL salva (modelo 3D) → Vai pra lá
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
                console.log(`保存されたURLへのリダイレクト： ${redirectUrl}`);

            // 2️⃣ Se está no login → vai para o menu
            } else if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'newMenu.html';
                console.log("メインメニューにリダイレクト中...");
            }

        } else {
            // Quando está deslogado
            statusDisplay.textContent = "現在のユーザー: なし (サインインしてください)";

            // Se está no menu sem login → voltar para login
            if (window.location.pathname.endsWith('newMenu.html')) {
                window.location.href = 'index.html';
            }
        }
    } else {
        console.log(user ? `User logged in: ${user.uid}` : "User logged out");
    }
});


// ------------------------------------------------------------------
// 4. OPÇÃO (se você quiser reativar futuramente)
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("成功終了");
        if (window.location.pathname.endsWith('newMenu.html')) {
            window.location.href = 'index.html';
        }
    });
}
window.signOutUser = signOutUser;


function handlePasswordReset(event) {
    // 1. Previne o comportamento padrão do link
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const authStatus = document.getElementById('auth-status');

    // 2. Verifica se o campo de e-mail está preenchido
    if (!email) {
        authStatus.textContent = "上記のメールアドレスを入力してパスワードを再設定してください。";
        authStatus.style.backgroundColor = '#ffcdd2'; // Fundo vermelho claro
        return;
    }

    // 3. Chama o método do Firebase
    // Certifique-se de que o firebase-auth-compat.js foi carregado no HTML.
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            // E-mail de redefinição enviado!
            authStatus.textContent = `Se o e-mail estiver registrado, um link de redefinição foi enviado para ${email}.`;
            authStatus.style.backgroundColor = '#c8e6c9'; // Fundo verde claro
            console.log("再設定メールが正常に送信されました！");
        })
        .catch((error) => {
            // Lidar com erros específicos ou manter a mensagem de segurança
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                 authStatus.textContent = `Se o e-mail estiver registrado, um link de redefinição foi enviado para ${email}.`;
                 authStatus.style.backgroundColor = '#c8e6c9'; 
                 console.warn("パスワードのリセットをリクエストしましたが、メールアドレスが見つかりません。");
            } else {
                authStatus.textContent = `Erro inesperado: ${error.message}`;
                authStatus.style.backgroundColor = '#ffcdd2';
                console.error("パスワードリセットエラー：", error);
            }
        });
}
