import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Aqui a gente verifica se já tem uma conexão aberta para não dar erro de "App already exists"
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      if (serviceAccount.project_id) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }
    } else {
      console.warn("⚠️ Firebase: FIREBASE_SERVICE_ACCOUNT_KEY não configurada. (Isso é normal durante o build)");
    }
  } catch (err) {
    console.error("❌ Firebase: Erro ao inicializar:", err.message);
  }
}

// Se não inicializou (falta de chave), o getFirestore vai reclamar depois, 
// mas pelo menos o build passa.
let db;
try {
  db = getFirestore();
} catch (e) {
  console.log("⚠️ Firebase não inicializado (Falta a chave no .env?)");
  db = null;
}

// --- AS FUNÇÕES QUE ESTAVAM FALTANDO ---

// 2. Função para salvar quem mandou mensagem (Webhook usa essa)
export const saveUser = async (user) => {
  if (!db) return;

  // Salva na coleção 'leads' usando o ID do Telegram como chave
  await db.collection("leads").doc(String(user.id)).set({
    first_name: user.first_name || "",
    username: user.username || "",
    data_entrada: new Date(),
  }, { merge: true }); // merge: true evita apagar dados se o usuário voltar
};

// 3. Função para pegar todo mundo (Broadcast usa essa)
export const getAllLeads = async () => {
  if (!db) return [];

  const snapshot = await db.collection("leads").get();
  // Retorna uma lista só com os IDs (ex: ['12345', '67890'])
  return snapshot.docs.map((doc) => doc.id);
};

export { db };