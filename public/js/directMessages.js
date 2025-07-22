// directMessages.js

// import firebase from 'firebase/compat/app';
// import 'firebase/compat/firestore';
const db = firebase.firestore();

// Generate consistent conversation ID
export function generateConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// Create or fetch an existing conversation between two users
export async function getOrCreateConversation(uid1, uid2) {
  const convoId = generateConversationId(uid1, uid2);
  const convoRef = firebase.firestore().collection('conversations').doc(convoId);
  const convoDoc = await convoRef.get();

  if (!convoDoc.exists) {
    await convoRef.set({
      participants: [uid1, uid2],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: "",
      lastSender: ""
    });
  }

  return convoRef;
}

// Send a direct message within a conversation
export async function sendDirectMessage(convoId, senderId, content) {
  const convoRef = firebase.firestore().collection('conversations').doc(convoId);
  const messageRef = convoRef.collection('messages').doc();

  const timestamp = firebase.firestore.FieldValue.serverTimestamp();

  await messageRef.set({
    senderId,
    content,
    timestamp,
    read: false
  });

  await convoRef.update({
    lastMessage: content,
    lastSender: senderId,
    updatedAt: timestamp
  });
}

// Listen to live updates from a conversation's messages
export function listenToMessages(convoId, callback) {
  return firebase.firestore()
    .collection('conversations')
    .doc(convoId)
    .collection('messages')
    .orderBy('timestamp')
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
}  

// Mark all unread messages as read (e.g., when user opens the convo)
export async function markMessagesAsRead(convoId, currentUserId) {
  const messagesRef = firebase.firestore()
    .collection('conversations')
    .doc(convoId)
    .collection('messages')
    .where('read', '==', false)
    .where('senderId', '!=', currentUserId);

  const snapshot = await messagesRef.get();

  const batch = firebase.firestore().batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}
