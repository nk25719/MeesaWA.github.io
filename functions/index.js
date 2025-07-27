import {
  auth, provider, signInWithPopup, signOut,
  db, collection, query, onSnapshot, orderBy
} from './firebase.js';

import {
  getOrCreateConversation, sendDirectMessage
} from './directMessages.js';

let currentUser = null;
let convoId = null;
let peerUid = '';
let isPrivate = true;
let typingTimeout = null;
const seenMessages = new Set();
let unsubscribe = null;

// DOM Elements
const loginBtn = document.getElementById('googleSignIn');
const logoutBtn = document.getElementById('logoutBtn');
const peerSelect = document.getElementById('peerSelect');
const togglePrivacy = document.getElementById('togglePrivacy');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const chatBox = document.getElementById('chat');
const typingIndicator = document.getElementById('typingIndicator');

loginBtn.onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
    document.getElementById('directArea').style.display = 'block';
    loadPeers();
  } catch (e) {
    alert('Login failed: ' + e.message);
  }
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.reload();
};

togglePrivacy.onclick = () => {
  isPrivate = !isPrivate;
  togglePrivacy.innerText = isPrivate ? 'Private Chat' : 'Public Room';
};

peerSelect.onchange = async () => {
  peerUid = peerSelect.value;
  if (unsubscribe) unsubscribe(); // stop old listener

  if (isPrivate && peerUid && currentUser?.uid) {
    convoId = await getOrCreateConversation(currentUser.uid, peerUid);
    chatBox.innerHTML = '';
    seenMessages.clear();
    listenToMessages(convoId);
    listenToTyping();
  }
};

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !peerUid || !currentUser?.uid) return;
  await sendDirectMessage(convoId, currentUser.uid, text);
  messageInput.value = '';
  await db.collection('conversations').doc(convoId).update({ typing: '' });
};

messageInput.oninput = async () => {
  if (!convoId || !currentUser?.uid) return;
  await db.collection('conversations').doc(convoId).update({ typing: currentUser.uid });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await db.collection('conversations').doc(convoId).update({ typing: '' });
  }, 2000);
};

function appendMessage(data, type) {
  const messageId = data.timestamp?.toMillis?.();
  if (!messageId || seenMessages.has(messageId)) return;
  seenMessages.add(messageId);

  const div = document.createElement('div');
  div.className = 'message ' + type;
  const timeStr = data.timestamp?.toDate?.().toLocaleTimeString?.() || '';
  div.innerHTML = `${data.senderId}: ${data.content} <span class="timestamp">${timeStr}</span>`;
  chatBox.appendChild(div);
}

function listenToMessages(convoId) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  unsubscribe = onSnapshot(q, snapshot => {
    const atBottom = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 50;

    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const data = change.doc.data();
        const type = data.senderId === currentUser.uid ? 'you' : 'other';
        appendMessage(data, type);
      }
    });

    if (atBottom) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
}

function loadPeers() {
  const q = query(collection(db, 'users'));
  onSnapshot(q, snapshot => {
    peerSelect.innerHTML = '<option disabled selected>Select a peer</option>';
    snapshot.forEach(doc => {
      const user = doc.data();
      if (user.uid !== currentUser.uid) {
        const opt = document.createElement('option');
        opt.value = user.uid;
        opt.textContent = user.displayName || user.email;
        peerSelect.appendChild(opt);
      }
    });
  });
}

function listenToTyping() {
  const convoRef = db.collection('conversations').doc(convoId);
  convoRef.onSnapshot(snapshot => {
    const data = snapshot.data();
    if (data?.typing && data.typing !== currentUser.uid) {
      typingIndicator.innerText = 'Typing...';
    } else {
      typingIndicator.innerText = '';
    }
  });
}
