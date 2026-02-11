
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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
    }
  } catch (err) {
    console.error("❌ Firebase Admin Initialization Error:", err.message);
  }
}

let db;
try {
  db = getFirestore();
  console.log("🔥 [DATABASE] Firestore initialized successfully.");
} catch (e) {
  console.error("❌ [DATABASE] Firestore initialization failed:", e.message);
  db = null;
}

// Helper to clean Firestore REST format
const cleanRESTFields = (fields) => {
  const data = {};
  if (!fields) return data;
  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) data[key] = value.stringValue;
    else if (value.booleanValue !== undefined) data[key] = value.booleanValue;
    else if (value.integerValue !== undefined) data[key] = parseInt(value.integerValue);
    else if (value.doubleValue !== undefined) data[key] = parseFloat(value.doubleValue);
    else if (value.timestampValue !== undefined) data[key] = value.timestampValue;
    else if (value.arrayValue !== undefined) {
      data[key] = (value.arrayValue.values || []).map(v => {
        if (v.mapValue) return cleanRESTFields(v.mapValue.fields);
        if (v.stringValue !== undefined) return v.stringValue;
        return v;
      });
    }
  }
  return data;
};

// Fallback Config
const PROJECT_ID = "botsudo-77b3a";
const API_KEY = "AIzaSyBUckf3rVxEIGm3gCasxHeAPVK6mF4p-8w";

// Save Users to Leads Collection
export const saveUser = async (user) => {
  if (db) {
    try {
      await db.collection("leads").doc(String(user.id)).set({
        first_name: user.first_name || "",
        username: user.username || "",
        type: "private",
        data_entrada: FieldValue.serverTimestamp(),
      }, { merge: true });
      return;
    } catch (e) { }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/leads/${user.id}?key=${API_KEY}`;
    await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          first_name: { stringValue: user.first_name || "" },
          username: { stringValue: user.username || "" },
          type: { stringValue: "private" },
          data_entrada: { timestampValue: new Date().toISOString() }
        }
      })
    });
  } catch (e) { }
};

// Increment Message Count
export const incrementMessageCount = async () => {
  if (db) {
    try {
      await db.collection("settings").doc("stats").set({
        total_messages: FieldValue.increment(1)
      }, { merge: true });
    } catch (e) { }
  }
};

// Save Groups to Groups Collection
export const saveGroup = async (chat) => {
  if (db) {
    try {
      await db.collection("groups").doc(String(chat.id)).set({
        title: chat.title || "",
        type: "group",
        data_active: FieldValue.serverTimestamp(),
      }, { merge: true });

      const groupRef = db.collection("groups").doc(String(chat.id));
      const groupDoc = await groupRef.get();
      if (groupDoc.exists && groupDoc.data().authorized === undefined) {
        await groupRef.update({ authorized: false });
      }
    } catch (e) { }
  }
};

export const getAllLeads = async () => {
  if (db) {
    try {
      const snapshot = await db.collection("leads").get();
      return snapshot.docs.map((doc) => doc.id);
    } catch (e) { console.error("Admin SDK Error (leads):", e); }
  }

  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/leads?key=${API_KEY}&pageSize=1000`);
    const data = await res.json();
    return data.documents ? data.documents.map(doc => doc.name.split("/").pop()) : [];
  } catch (e) { return []; }
};

export const getAllGroups = async () => {
  if (db) {
    try {
      const snapshot = await db.collection("groups").where("authorized", "==", true).get();
      return snapshot.docs.map((doc) => doc.id);
    } catch (e) { console.error("Admin SDK Error (groups):", e); }
  }

  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/groups?key=${API_KEY}&pageSize=1000`);
    const data = await res.json();
    if (data.documents) {
      return data.documents
        .map(doc => ({ id: doc.name.split("/").pop(), ...cleanRESTFields(doc.fields) }))
        .filter(g => g.authorized === true)
        .map(g => g.id);
    }
    return [];
  } catch (e) { return []; }
};

export const getBotSettings = async () => {
  if (db) {
    try {
      const docSnap = await db.collection("settings").doc("bot_config").get();
      if (docSnap.exists) return docSnap.data();
    } catch (e) { }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/bot_config?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.fields ? cleanRESTFields(data.fields) : null;
  } catch (e) { return null; }
};

export const getStats = async () => {
  if (db) {
    try {
      const docSnap = await db.collection("settings").doc("stats").get();
      if (docSnap.exists) return docSnap.data();
    } catch (e) { }
  }
  return { total_messages: 0 };
};

export const findAutomation = async (text) => {
  if (!text) return null;
  const input = text.toLowerCase().trim();

  const evaluateMatch = (rule, userInput) => {
    if (!rule.active) return false;
    const trigger = (rule.trigger || "").toLowerCase().trim();
    const matchType = rule.match_type || "exact";

    let processedInput = userInput;
    if (userInput.includes("@")) {
      processedInput = userInput.split("@")[0];
    }

    if (matchType === "keyword") return processedInput.includes(trigger);
    if (matchType === "regex") {
      try { return new RegExp(trigger, "i").test(processedInput); } catch (e) { return false; }
    }

    const triggerNoSlash = trigger.replace(/^\//, "");
    const processedInputNoSlash = processedInput.replace(/^\//, "");
    if (rule.strict_slash) return processedInput === trigger;
    return processedInputNoSlash === triggerNoSlash;
  };

  if (db) {
    try {
      const snapshot = await db.collection("automation").where("active", "==", true).get();
      const automations = snapshot.docs.map(doc => doc.data());
      return automations.find(rule => evaluateMatch(rule, input)) || null;
    } catch (e) { }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/automation?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.documents) {
      const automations = data.documents.map(doc => cleanRESTFields(doc.fields));
      return automations.find(rule => evaluateMatch(rule, input)) || null;
    }
  } catch (e) { }
  return null;
};

export const getGroups = async () => {
  if (db) {
    try {
      const snapshot = await db.collection("groups").where("active", "==", true).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/groups?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.documents) {
      return data.documents.map(doc => ({
        id: doc.name.split('/').pop(),
        ...cleanRESTFields(doc.fields)
      })).filter(g => g.active);
    }
  } catch (e) { }
  return [];
};

export const getAllAutomations = async () => {
  if (db) {
    try {
      const snapshot = await db.collection("automation").where("active", "==", true).get();
      return snapshot.docs.map(doc => doc.data());
    } catch (e) { }
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/automation?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.documents) {
      return data.documents.map(doc => cleanRESTFields(doc.fields)).filter(a => a.active);
    }
  } catch (e) { }
  return [];
};


// --- CHAT HISTORY (MEMORY) ---

export const saveChatMessage = async (chatId, role, text) => {
  if (db) {
    try {
      await db.collection("chats").doc(String(chatId)).collection("messages").add({
        role,
        text,
        created_at: FieldValue.serverTimestamp()
      });
    } catch (e) { console.error("Error saving chat message:", e); }
  }
};

export const getChatHistory = async (chatId, limit = 10) => {
  if (db) {
    try {
      const snapshot = await db.collection("chats")
        .doc(String(chatId))
        .collection("messages")
        .orderBy("created_at", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.data()).reverse();
    } catch (e) {
      console.error("Error getting chat history:", e);
      return [];
    }
  }
  return [];
};
export { db };
