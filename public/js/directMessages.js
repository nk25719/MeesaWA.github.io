// DO NOT import firebase — it's already available globally

export async function getOrCreateConversation(uid1, uid2) {
  const convoId = [uid1, uid2].sort().join("_");
  const db = firebase.firestore();
  const convoRef = db.collection("conversations").doc(convoId);
  const doc = await convoRef.get();
  if (!doc.exists) {
    await convoRef.set({
      participants: [uid1, uid2],
      lastMessage: "",
      updatedAt: new Date(),
    });
  }
  return convoId;
}

export async function sendDirectMessage(convoId, senderId, content) {
  const db = firebase.firestore();
  const message = {
    senderId,
    content,
    timestamp: new Date(),
    read: false
  };
  await db.collection("conversations").doc(convoId).collection("messages").add(message);
  await db.collection("conversations").doc(convoId).update({
    lastMessage: content,
    lastSender: senderId,
    updatedAt: new Date()
  });
}
