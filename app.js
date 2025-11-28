// app.js

// ------------------------------------------------------------------
// ⚠️ 1. SUA CONFIGURAÇÃO FIREBASE
// ------------------------------------------------------------------
const firebaseConfig = {
    // Estas são as chaves que você forneceu anteriormente
    apiKey: "AIzaSyAM88d_Qu-_FFDf-NF7Ckk0eYYYKAZA3pU",
    authDomain: "stamp-edfc5.firebaseapp.com",
    projectId: "stamp-edfc5",
    storageBucket: "stamp-edfc5.firebasestorage.app",
    messagingSenderId: "522739532414",
    appId: "1:522739532414:web:047e4168251b5542ce8e2f",
    measurementId: "G-2EVLH3GZNS"
};

// Inicializa o Firebase (versão compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth(); // Obtém o serviço de autenticação
const statusDisplay = document.getElementById('auth-status'); // Elemento de status

// ------------------------------------------------------------------
// 2. FUNÇÕES DE AUTENTICAÇÃO (chamadas pelos botões no index.html)
// ------------------------------------------------------------------

// Sign Up Function
function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Por favor, insira email e senha.');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            // O onAuthStateChanged tratará o redirecionamento
            alert('Registro bem-sucedido! Redirecionando...');
        })
        .catch((error) => {
            alert(`Falha no Registro: ${error.message}`);
        });
}

// Sign In Function
function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Por favor, insira email e senha.');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // O onAuthStateChanged tratará o redirecionamento
            console.log('Login bem-sucedido. Redirecionando...');
        })
        .catch((error) => {
            // Trata Erros (ex: usuário não encontrado, senha errada)
            alert(`Falha no Login: ${error.message}`);
        });
}

// Sign Out Function (Se você decidir reativar o botão de Sign Out)
function signOutUser() {
    auth.signOut().then(() => {
        alert('Saiu com sucesso!');
        // Redireciona de volta para index.html se estiver no menu
        if (window.location.pathname.endsWith('newMenu.html')) {
             window.location.href = 'index.html';
        }
    }).catch((error) => {
        console.error('Erro ao sair:', error);
        alert('Falha ao sair.');
    });
}

// Torna as funções globais para que o HTML (onclick) possa chamá-las
window.signUp = signUp;
window.signIn = signIn;
window.signOutUser = signOutUser; 

// ------------------------------------------------------------------
// 3. OUVINTE DE ESTADO DE AUTENTICAÇÃO (AUTH STATE LISTENER)
// Lógica de redirecionamento CORRIGIDA para usar 'redirectAfterLogin'.
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    // Verifica se o elemento statusDisplay existe
    if (statusDisplay) {
        if (user) {
            // Usuário está logado
            statusDisplay.textContent = `Current User: ${user.email} (UID: ${user.uid})`;

            // 🚨 CORREÇÃO PRINCIPAL: Verifica se há uma URL salva para redirecionar.
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            const currentPage = window.location.pathname.split('/').pop();
            
            // 1. Prioriza o redirecionamento para a URL salva (modelo 3D)
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin'); // Limpa a chave após o uso
                window.location.href = redirectUrl; // Redireciona para o modelo
                console.log(`Redirecionando para URL salva (modelo): ${redirectUrl}`);

            // 2. Se não houver URL salva, mas estiver na página de login, redireciona para o menu principal
            } else if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'newMenu.html'; 
                console.log('Redirecionando para o menu principal (newMenu.html).');
            }

        } else {
            // Usuário está deslogado
            statusDisplay.textContent = 'Current User: None (Please Sign In)';

            // Se o usuário deslogou e está na página do menu, redireciona para o login
            if (window.location.pathname.endsWith('newMenu.html')) {
                 window.location.href = 'index.html'; 
            }
        }
    } else {
        // Se o script for usado em outras páginas sem #auth-status, apenas loga
        console.log(user ? `User logged in: ${user.uid}` : 'User logged out');
    }
});