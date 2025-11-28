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

// Define a persistência como LOCAL para salvar o login
// Isso é crucial para que o usuário não precise logar novamente
const persistence = firebase.auth.Auth.Persistence.LOCAL;

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

    // A. CONFIGURA a persistência antes de tentar autenticar
    auth.setPersistence(persistence)
        .then(() => {
            // B. Tenta LOGIN primeiro
            return auth.signInWithEmailAndPassword(email, password);
        })
        .then(() => {
            console.log("ログイン成功");
            // O onAuthStateChanged (Seção 3) cuidará do redirecionamento
        })
        .catch((error) => {
            
            // C. Se o usuário NÃO EXISTE → cria conta automaticamente (SIGNUP)
            if (error.code === "auth/user-not-found") {
                console.log("ユーザーが存在しません → 新規登録します");

                // Note: a persistência já está configurada do passo A
                return auth.createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        alert("新規登録完了！ログインしました。");
                    });

            } else {
                // Qualquer outro erro (senha errada, email inválido, etc.)
                alert(`ログインエラー: ${error.message}`);
            }
        })
        .catch((finalError) => {
             // Captura erros de sign-up, setPersistence ou outros erros que não são "user-not-found"
             // Garante que o usuário veja a mensagem de erro.
             if (finalError) {
                 alert(`認証エラー: ${finalError.message}`);
                 console.error("Erro final de autenticação:", finalError);
             }
        });
}

// Disponibiliza para o HTML
window.loginOrSignup = loginOrSignup;


// ------------------------------------------------------------------
// 3. LISTENER DE AUTENTICAÇÃO (REDIRECIONAMENTO)
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    // Melhoria: Garante que a lógica de redirecionamento só aconteça 
    // após o primeiro carregamento, e não em cada autenticação do firebase.

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

            // 2️⃣ Se está na página de login → vai para o menu
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
// 4. REDEFINIÇÃO DE SENHA (Forgot Password)
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    // 1. Previne o comportamento padrão do link
    event.preventDefault(); 
    
    // Pega o e-mail do campo de input.
    const email = document.getElementById('email').value.trim();
    const authStatus = document.getElementById('auth-status');

    // 2. Verifica se o campo de e-mail está preenchido
    if (!email) {
        authStatus.textContent = "上記のメールアドレスを入力してパスワードを再設定してください。";
        authStatus.style.backgroundColor = '#ffcdd2'; 
        return;
    }

    // 3. Chama o método do Firebase
    auth.sendPasswordResetEmail(email)
        .then(() => {
            // Mensagem de segurança: sucesso genérico para não vazar se o e-mail existe.
            authStatus.textContent = `メールアドレスが登録されている場合、再設定リンクを ${email} に送信しました。`;
            authStatus.style.backgroundColor = '#c8e6c9'; 
            console.log("再設定メールが正常に送信されました！");
        })
        .catch((error) => {
            // Se o erro for 'user-not-found' ou 'invalid-email', mantém a mensagem de sucesso 
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                 authStatus.textContent = `メールアドレスが登録されている場合、再設定リンクを ${email} に送信しました。`;
                 authStatus.style.backgroundColor = '#c8e6c9'; 
                 console.warn("Segurança: Reset solicitado, mas e-mail não encontrado/inválido.");
            } else {
                authStatus.textContent = `予期せぬエラー: ${error.message}`;
                authStatus.style.backgroundColor = '#ffcdd2';
                console.error("パスワードリセットエラー：", error);
            }
        });
}
window.handlePasswordReset = handlePasswordReset;


// ------------------------------------------------------------------
// 5. LOGOUT (se você quiser reativar futuramente)
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("ログアウト成功");
        if (window.location.pathname.endsWith('newMenu.html')) {
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error("Erro ao sair:", error);
    });
}
window.signOutUser = signOutUser;

