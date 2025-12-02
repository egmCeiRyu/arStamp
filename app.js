// Este arquivo usa a versão "Compat" do SDK do Firebase, 
// necessária para manter a sintaxe simples (ex: firebase.auth()).

// ------------------------------------------------------------------
// 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
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
// 2. FUNÇÃO PRINCIPAL: LOGIN OU NOVO REGISTRO (BOTÃO ÚNICO)
// ------------------------------------------------------------------
function loginOrSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        if (statusDisplay) {
            statusDisplay.textContent = "Por favor, insira o e-mail e a senha.";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }

    if (statusDisplay) {
        statusDisplay.textContent = "Tentando entrar...";
        statusDisplay.style.backgroundColor = '#fff3cd';
    }

    // 1. Tenta fazer login com as credenciais
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login bem-sucedido. A Redireção será feita pelo onAuthStateChanged.
            console.log("Login successful:", userCredential.user.email);
        })
        .catch((loginError) => {
            
            // 2. Se o erro for 'usuário não encontrado', tenta criar a conta
            if (loginError.code === 'auth/user-not-found') {
                console.log("Usuário não encontrado. Tentando registrar...");

                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Registro e login bem-sucedidos.
                        console.log("Sign up successful:", userCredential.user.email);
                    })
                    .catch((signupError) => {
                        // Tratamento de erros de registro (senha fraca, e-mail malformado)
                        let errorMessage = signupError.message;
                        if (signupError.code === 'auth/weak-password') {
                            errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
                        } else if (signupError.code === 'auth/invalid-email') {
                            errorMessage = "E-mail malformado ou inválido.";
                        }
                        
                        if (statusDisplay) {
                            statusDisplay.textContent = `Erro no Registro: ${errorMessage}`;
                            statusDisplay.style.backgroundColor = '#ffcdd2';
                        }
                        console.error("Erro no Registro:", signupError);
                    });
            } 
            // 3. Trata outros erros de login (senha incorreta, etc.)
            else {
                let errorMessage = loginError.message;
                if (loginError.code === 'auth/wrong-password') {
                    errorMessage = "Senha incorreta.";
                }
                
                if (statusDisplay) {
                    statusDisplay.textContent = `Erro no Login: ${errorMessage}`;
                    statusDisplay.style.backgroundColor = '#ffcdd2';
                }
                console.error("Erro no Login:", loginError);
            }
        });
}
// Torna a função acessível pelo HTML (index.html)
window.loginOrSignup = loginOrSignup;


// ------------------------------------------------------------------
// 3. FUNÇÃO DE RESET DE SENHA
// ------------------------------------------------------------------
function handlePasswordReset(event) {
    event.preventDefault(); // Impede o link de navegar

    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("Por favor, insira seu e-mail para solicitar a redefinição de senha.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            if (statusDisplay) {
                statusDisplay.textContent = `E-mail de redefinição enviado para ${email}. Verifique sua caixa de entrada.`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
        })
        .catch((error) => {
            if (statusDisplay) {
                statusDisplay.textContent = `Erro ao enviar e-mail: ${error.message}`;
                statusDisplay.style.backgroundColor = '#ffcdd2';
            }
        });
}
window.handlePasswordReset = handlePasswordReset;


// ------------------------------------------------------------------
// 4. LISTENER DE ESTADO DE AUTENTICAÇÃO (REDIRECIONAMENTO)
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // Usuário logado
        if (statusDisplay) statusDisplay.textContent = `Usuário atual: ${user.email}`;

        // Redireciona se estiver na página de login
        if (currentPage === 'index.html' || currentPage === '') {
            // Redireciona para o menu principal
            window.location.href = 'newMenu.html';
            console.log("Redirecting to main menu...");
        }

    } else {
        // Usuário deslogado
        if (statusDisplay) statusDisplay.textContent = "Usuário atual: Nenhum (Por favor, entre)";

        // Redireciona de volta para o login se estiver no menu sem autenticação
        if (currentPage === 'newMenu.html') {
            window.location.href = 'index.html';
        }
    }
});


// ------------------------------------------------------------------
// 5. FUNÇÃO DE LOGOUT (Para ser chamada em newMenu.html)
// ------------------------------------------------------------------
function signOutUser() {
    auth.signOut().then(() => {
        alert("Logout realizado com sucesso.");
        // O onAuthStateChanged tratará o redirecionamento para index.html
    }).catch(error => {
        console.error("Erro durante o logout:", error);
        alert("Erro durante o logout.");
    });
}
window.signOutUser = signOutUser;