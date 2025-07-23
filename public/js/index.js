// index.js
import { auth, provider, signInWithPopup, signOut, db, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, where, limit } from './firebase.js';
import { getOrCreateConversation, sendDirectMessage, listenToDirectMessages } from './directMessages.js';

let currentUser = null;
let convoId = null;
let peerUid = '';
let isPrivate = true;
let typingTimeout = null;
let unsubscribeRoom = null;

const loginBtn = document.getElementById('googleSignIn');
const logoutBtn = document.getElementById('logoutBtn');
const peerSelect = document.getElementById('peerSelect');
const togglePrivacy = document.getElementById('togglePrivacy');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const chatBox = document.getElementById('chat');
const typingIndicator = document.getElementById('typingIndicator');
const roomSelect = document.getElementById("roomSelect");
const directArea = document.getElementById("directArea");

loginBtn.onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
    directArea.style.display = 'block';
    loadPeers();

    const selectedRoom = roomSelect?.value;
    if (selectedRoom) {
      listenToRoomMessages(selectedRoom, currentUser.displayName);
    }
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
    listenToDirectMessages(convoId, currentUser.uid, appendDirectMessage);
    listenToTyping();
  }
};

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !currentUser?.uid) return;

  if (isPrivate) {
    if (!peerUid) return;
    await sendDirectMessage(convoId, currentUser.uid, text);
    await db.collection('conversations').doc(convoId).update({ typing: '' });
  } else {
    await addDoc(collection(db, "messages"), {
      username: currentUser.displayName,
      room: roomSelect.value,
      text,
      timestamp: serverTimestamp()
    });
  }

  messageInput.value = '';
};

messageInput.oninput = async () => {
  if (!isPrivate || !convoId || !currentUser?.uid) return;
  await db.collection('conversations').doc(convoId).update({ typing: currentUser.uid });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await db.collection('conversations').doc(convoId).update({ typing: '' });
  }, 2000);
};

function appendDirectMessage(data, type) {
  const div = document.createElement('div');
  div.className = 'message ' + type;
  const timeStr = data.timestamp?.toDate?.().toLocaleTimeString?.() || '';
  div.innerHTML = `${data.senderId}: ${data.content} <span class="timestamp">${timeStr}</span>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, type, timestamp) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  if (timestamp) {
    const time = document.createElement("div");
    time.className = "timestamp";
    time.textContent = timestamp.toLocaleTimeString();
    msg.appendChild(time);
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function listenToRoomMessages(room, username) {
  if (unsubscribeRoom) unsubscribeRoom();
  const q = query(
    collection(db, "messages"),
    where("room", "==", room),
    orderBy("timestamp", "asc"),
    limit(50)
  );

  unsubscribeRoom = onSnapshot(q, snapshot => {
    chatBox.innerHTML = "";
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const data = change.doc.data();
        const type = data.username === username ? "you" : "other";
        appendMessage(`${data.username}: ${data.text}`, type, data.timestamp?.toDate?.());
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

roomSelect.onchange = () => {
  if (!isPrivate) {
    const selectedRoom = roomSelect?.value;
    if (selectedRoom) {
      listenToRoomMessages(selectedRoom, currentUser?.displayName);
    }
  }
};
