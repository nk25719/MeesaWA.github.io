// directMessages.js (Firebase-only)

import { db, collection, addDoc, doc, setDoc, getDoc, onSnapshot, orderBy, query } from './firebase.js';

export async function getOrCreateConversation(uid1, uid2) {
  const convoId = [uid1, uid2].sort().join('_');
  const convoRef = doc(db, 'conversations', convoId);
  const convoSnap = await getDoc(convoRef);

  if (!convoSnap.exists()) {
    await setDoc(convoRef, {
      participants: [uid1, uid2],
      updatedAt: new Date(),
    });
  }

  return convoId;
}

export async function sendDirectMessage(convoId, senderId, content) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    content,
    timestamp: new Date(),
    read: false,
  });
  await setDoc(doc(db, 'conversations', convoId), {
    lastMessage: content,
    lastSender: senderId,
    updatedAt: new Date()
  }, { merge: true });
}

export function listenToDirectMessages(convoId, currentUserId, callback) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const data = change.doc.data();
        const type = data.senderId === currentUserId ? 'you' : 'other';
        callback(data, type);
      }
    });
  });
}
