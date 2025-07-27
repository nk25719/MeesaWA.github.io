import {
  auth, provider, signInWithPopup, signOut,
  db, collection, query, onSnapshot, orderBy
} from './firebase.js';

import {
  getOrCreateConversation, sendDirectMessage, getMessagesPage
} from './directMessages.js';

let currentUser = null;
let convoId = null;
let peerUid = '';
let isPrivate = true;
let typingTimeout = null;
let lastVisible = null;
let isLoading = false;
const seenMessages = new Set();  // prevent duplicates

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
  if (isPrivate && peerUid && currentUser?.uid) {
    convoId = await getOrCreateConversation(currentUser.uid, peerUid);
    chatBox.innerHTML = '';
    lastVisible = null;
    isLoading = false;
    seenMessages.clear();
    await loadInitialMessages();
    listenToNewMessages();  // 🔄 real-time updates
    chatBox.addEventListener('scroll', handleScroll);
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

function appendMessage(data, type, prepend = false) {
  const messageId = data.timestamp?.toMillis?.();
  if (seenMessages.has(messageId)) return;
  seenMessages.add(messageId);

  const div = document.createElement('div');
  div.className = 'message ' + type;
  const timeStr = data.timestamp?.toDate?.().toLocaleTimeString?.() || '';
  div.innerHTML = `${data.senderId}: ${data.content} <span class="timestamp">${timeStr}</span>`;

  if (prepend) {
    chatBox.insertBefore(div, chatBox.firstChild);
  } else {
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

async function loadInitialMessages() {
  isLoading = true;
  const snapshot = await getMessagesPage(convoId);
  if (!snapshot.empty) {
    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const messages = [];
    snapshot.forEach(doc => messages.unshift({ id: doc.id, ...doc.data() }));
    messages.forEach(msg => {
      const type = msg.senderId === currentUser.uid ? 'you' : 'other';
      appendMessage(msg, type);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  isLoading = false;
}

async function loadMoreMessages() {
  if (!lastVisible || isLoading) return;
  isLoading = true;

  const snapshot = await getMessagesPage(convoId, lastVisible);
  if (!snapshot.empty) {
    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const messages = [];
    snapshot.forEach(doc => messages.unshift({ id: doc.id, ...doc.data() }));
    const scrollPos = chatBox.scrollHeight;
    messages.forEach(msg => {
      const type = msg.senderId === currentUser.uid ? 'you' : 'other';
      appendMessage(msg, type, true);
    });
    chatBox.scrollTop = chatBox.scrollHeight - scrollPos;
  }

  isLoading = false;
}

function handleScroll() {
  if (chatBox.scrollTop === 0 && !isLoading) {
    loadMoreMessages();
  }
}

function listenToNewMessages() {
  const messagesRef = collection(db, 'conversations', convoId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

  onSnapshot(q, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const data = change.doc.data();
        const type = data.senderId === currentUser.uid ? 'you' : 'other';
        appendMessage(data, type);
      }
    });
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
