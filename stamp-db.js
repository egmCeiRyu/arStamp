// Função para salvar um novo carimbo no Firebase
async function addStampToFirebase(uid, modelName) {
  if (!uid) return;

  try {
    const docRef = doc(db, "users", uid);

    // 1. Carrega o estado atual (para garantir que não sobrescrevemos)
    const docSnap = await getDoc(docRef);
    let currentStamps = [];

    if (docSnap.exists()) {
      currentStamps = docSnap.data().stamps || [];
    }

    // 2. Adiciona o novo carimbo se não estiver na lista
    if (!currentStamps.includes(modelName)) {
      currentStamps.push(modelName);

      // 3. Atualiza o array no Firestore
      await updateDoc(docRef, {
        stamps: currentStamps
      });
      console.log(`Carimbo '${modelName}' salvo para o usuário ${uid}`);
    } else {
      console.log(`Carimbo '${modelName}' já existe.`);
    }

  } catch (error) {
    console.error("Erro ao salvar carimbo:", error);
  }
}