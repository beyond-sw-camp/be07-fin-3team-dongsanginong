importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");


const firebaseConfig = {
  apiKey: "AIzaSyDWOhjh5Zi-Bs9TN6CRQJ_tIx3k0X5z89M",
  authDomain: "dongsanginong-24f95.firebaseapp.com",
  projectId: "dongsanginong-24f95",
  storageBucket: "dongsanginong-24f95.appspot.com",
  messagingSenderId: "331466655968",
  appId: "1:331466655968:web:f9802c140ab1701b63a885",
  measurementId: "G-WK79L8VKTR"
};
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => { 
    saveToIndexedDB(payload);
    
      console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload,
      );

      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: "favicon.ico"
      };

  
      self.registration.showNotification(notificationTitle, notificationOptions);
    });


    messaging.onMessage((payload) => {   
      saveToIndexedDB(payload);
  
      console.log(
        '[firebase-messaging-sw.js] Received foreground message!! ',
        payload
      );

      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: "favicon.ico"
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });

// IndexedDB를 사용하여 데이터를 저장하는 함수
function saveToIndexedDB(payload) {
const request = indexedDB.open("notificationDB", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("notifications")) {
    db.createObjectStore("notifications", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction("notifications", "readwrite");
  const store = transaction.objectStore("notifications");
  store.add(payload);
};

request.onerror = (event) => {
  console.error("Error opening IndexedDB", event);
};
}