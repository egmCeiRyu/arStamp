// app.js

// ------------------------------------------------------------------
// ⚠️ 1. SUA CONFIGURAÇÃO FIREBASE
// As chaves são necessárias aqui, pois este script é carregado separadamente.
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
// Como você está usando os scripts compat (firebase-app-compat.js e firebase-auth-compat.js),
// a inicialização é feita via firebase.initializeApp.
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
        // Se estiver em newMenu.html, redireciona de volta para index.html
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
// Esta é a lógica de redirecionamento principal.
// ------------------------------------------------------------------
auth.onAuthStateChanged((user) => {
    // Verifica se o elemento statusDisplay existe
    if (statusDisplay) {
        if (user) {
            // Usuário está logado
            statusDisplay.textContent = `Current User: ${user.email} (UID: ${user.uid})`;

            // Redireciona APENAS se estiver na página de login (index.html)
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'newMenu.html'; 
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