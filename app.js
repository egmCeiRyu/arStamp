// Este arquivo contém a lógica de autenticação do Firebase usando o SDK "Compat" 
// (versão simples) e duas funções separadas para Login e Novo Registro.

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
// 2. FUNÇÃO 1: APENAS LOGIN (handleLogin)
// Para usuários que JÁ possuem conta.
// ------------------------------------------------------------------
function handleLogin() {
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

    // Tenta fazer login
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login bem-sucedido. Redireção tratada pelo onAuthStateChanged.
            console.log("Login successful:", userCredential.user.email);
        })
        .catch((error) => {
            // Trata erros de login
            let errorMessage = "Erro no Login. Verifique seu e-mail e senha.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Este e-mail não está registrado. Use o botão 'Novo Registro'.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Senha incorreta.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "E-mail inválido.";
            } else if (error.code === 'auth/invalid-credential') {
                 // Este é o erro geral quando algo está errado (malformado, expirado, etc.)
                errorMessage = "Credencial inválida ou malformada. Verifique se o formato do e-mail está correto e a senha.";
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
// 3. FUNÇÃO 2: APENAS NOVO REGISTRO (handleSignup)
// Para usuários que NUNCA se registraram.
// ------------------------------------------------------------------
function handleSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        if (statusDisplay) {
            statusDisplay.textContent = "Por favor, insira o e-mail e a senha para registro.";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }
    
    // Alerta de senha fraca ANTES de enviar ao Firebase
    if (password.length < 6) {
        if (statusDisplay) {
            statusDisplay.textContent = "Erro no Registro: A senha deve ter no mínimo 6 caracteres.";
            statusDisplay.style.backgroundColor = '#ffcdd2';
        }
        return;
    }

    if (statusDisplay) {
        statusDisplay.textContent = "Tentando registrar novo usuário...";
        statusDisplay.style.backgroundColor = '#fff3cd';
    }

    // Tenta criar um novo usuário
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registro e login bem-sucedidos. Redireção será feita pelo onAuthStateChanged.
            console.log("Sign up successful:", userCredential.user.email);
            if (statusDisplay) {
                statusDisplay.textContent = `Registro bem-sucedido! Entrando como ${userCredential.user.email}...`;
                statusDisplay.style.backgroundColor = '#c8e6c9';
            }
        })
        .catch((error) => {
            // Trata erros de registro
            let errorMessage = "Erro no Registro. Tente novamente.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Este e-mail já está em uso. Use o botão 'Login'.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "E-mail malformado ou inválido.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
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
// 4. FUNÇÃO DE RESET DE SENHA
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
// 5. LISTENER DE ESTADO DE AUTENTICAÇÃO (REDIRECIONAMENTO)
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // Usuário logado
        if (statusDisplay) statusDisplay.textContent = `Usuário atual: ${user.email}`;

        // Redireciona se estiver na página de login
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'newMenu.html';
            console.log("Redirecionando para o menu principal...");
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
// 6. FUNÇÃO DE LOGOUT (Para ser chamada em newMenu.html)
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