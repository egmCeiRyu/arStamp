// ------------------------------------------------------------------
// 1. CONFIGURAÇÃO FIREBASE (COMPAT SDK)
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

// 💡 NOVO: Inicializa o Firestore (SDK Compat) para usar na função de carimbo
// Você DEVE incluir a tag <script src="...firebase-firestore-compat.js"></script> no seu HTML!
const db = app.firestore(); 

// Define a persistência como LOCAL para salvar o login
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
        })
        .catch((error) => {
            
            // C. Se o usuário NÃO EXISTE → cria conta automaticamente (SIGNUP)
            if (error.code === "auth/user-not-found") {
                console.log("ユーザーが存在しません → 新規登録します");

                return auth.createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        alert("新規登録完了！ログインしました。");
                    });

            } else {
                alert(`ログインエラー: ${error.message}`);
            }
        })
        .catch((finalError) => {
            if (finalError) {
                alert(`認証エラー: ${finalError.message}`);
                console.error("Erro final de autenticação:", finalError);
            }
        });
}

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

            // 1️⃣ Redirecionamento para a URL salva (após login)
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
                console.log(`保存されたURLへのリダイレクト： ${redirectUrl}`);

            // 2️⃣ Redirecionamento da página de login para o menu
            } else if (currentPage === 'index.html' || currentPage === '') {
                window.location.href = 'newMenu.html';
                console.log("メインメニューにリダイレクト中...");
            }

        } else {
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
    event.preventDefault(); 
    const email = document.getElementById('email').value.trim();
    const authStatus = document.getElementById('auth-status');

    if (!email) {
        authStatus.textContent = "上記のメールアドレスを入力してパスワードを再設定してください。";
        authStatus.style.backgroundColor = '#ffcdd2'; 
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            authStatus.textContent = `メールアドレスが登録されている場合、再設定リンクを ${email} に送信しました。`;
            authStatus.style.backgroundColor = '#c8e6c9'; 
            console.log("再設定メールが正常に送信されました！");
        })
        .catch((error) => {
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
// 5. LOGOUT
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


// ------------------------------------------------------------------
// 6. LÓGICA DO SCANNER DE QR CODE E REGISTRO DE CARIMBO
// ------------------------------------------------------------------

// Variável global para o scanner (se estiver usando uma biblioteca como html5-qrcode)
let html5QrCode = null;
const qrCodeRegionId = "reader";
const expectedStampPrefix = "STAMP_MODEL_"; // O dado esperado no QR Code (ex: STAMP_MODEL_model1)

/**
 * Função chamada após escanear com sucesso um QR Code.
 * @param {string} qrCodeMessage - O dado lido do QR Code.
 */
async function onScanSuccess(qrCodeMessage) {
    if (html5QrCode) {
        // Para o scanner após uma leitura bem-sucedida para evitar leituras repetidas
        html5QrCode.stop().then(() => {
            console.log("Scanner parado após leitura.");
        }).catch(err => {
            console.error("Erro ao parar o scanner:", err);
        });
        html5QrCode = null; // Reseta a variável do scanner
        document.querySelector('#stamp-section button').textContent = "qrcode";
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Erro de Autenticação: Usuário não logado.");
        return;
    }

    // Processa a mensagem do QR Code (remove o prefixo para obter o nome do modelo)
    const modelName = qrCodeMessage.replace(expectedStampPrefix, '');
    
    // Simples validação de formato (verifica se o prefixo está correto)
    if (!qrCodeMessage.startsWith(expectedStampPrefix) || !modelName) {
        alert("QRコードが無効です。Prefix: STAMP_MODEL_");
        return;
    }

    // Registra o carimbo no Firebase
    await handleStampRegistration(modelName, user.uid);
}


/**
 * Função para iniciar/parar o scanner de QR Code (chamada pelo botão no HTML).
 */
window.startQrCodeScanner = function() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Por favor, faça login primeiro.");
        return;
    }
    
    // Se o scanner já estiver ativo, pare-o
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode = null;
            document.getElementById(qrCodeRegionId).innerHTML = '';
            document.querySelector('#stamp-section button').textContent = "qrcode";
        }).catch(err => {
            console.error("Erro ao parar o scanner:", err);
        });
        return;
    }

    // Inicializa e inicia o scanner (NOVO)
    // **NOTA:** Você DEVE incluir o link para a biblioteca html5-qrcode no seu HTML!
    if (typeof Html5Qrcode === 'undefined') {
         alert("Erro: Biblioteca 'html5-qrcode' não carregada no HTML.");
         return;
    }
    
    html5QrCode = new Html5Qrcode(qrCodeRegionId);
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        // Use 'environment' para a câmera traseira em dispositivos móveis
        facingMode: "environment" 
    };
    
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
    .then(() => {
         document.querySelector('#stamp-section button').textContent = "Parar Scanner";
         console.log("Scanner iniciado.");
    })
    .catch(err => {
        document.getElementById(qrCodeRegionId).innerHTML = `Erro ao iniciar a câmera: ${err}`;
        console.error("Erro ao iniciar scanner:", err);
        html5QrCode = null;
    });
};


/**
 * Função para registrar o carimbo no Firestore.
 * @param {string} modelName - O nome do carimbo/modelo (ex: 'model1').
 * @param {string} uid - O ID do usuário logado.
 */
async function handleStampRegistration(modelName, uid) {
    try {
        // Acessa a coleção 'users' e o documento com o UID do usuário
        const userDocRef = db.collection("users").doc(uid); 
        
        // 1. Pega os dados atuais
        const docSnap = await userDocRef.get();
        const currentStamps = docSnap.exists ? docSnap.data().stamps || [] : [];

        // 2. Checa se já tem o carimbo
        if (currentStamps.includes(modelName)) {
            alert(`Você já tem este carimbo: ${modelName}!`);
            // Redireciona apenas para limpar a URL de 'newStamp' (se houver)
            window.location.href = window.location.pathname; 
            return;
        }

        // 3. Adiciona o novo carimbo
        const newStamps = [...currentStamps, modelName];
        await userDocRef.set({ stamps: newStamps }, { merge: true });

        alert(`Carimbo ${modelName} desbloqueado com sucesso!`);
        
        // Redireciona para a mesma página, com o parâmetro 'newStamp' para acionar a animação
        window.location.href = `${window.location.pathname}?newStamp=${modelName}`;

    } catch (e) {
        console.error("Erro ao registrar o carimbo:", e);
        alert("Erro ao salvar carimbo. Tente novamente.");
    }
}