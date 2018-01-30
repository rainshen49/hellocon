// Initialize Firebase
/* global firebase*/
var config = {
  apiKey: "AIzaSyC0qeYriiR2j1yR4zBofrqtEK0OjotP3dg",
  authDomain: "hellocon-map-1496105308208.firebaseapp.com",
  databaseURL: "https://hellocon-map-1496105308208.firebaseio.com",
  projectId: "hellocon-map-1496105308208",
  storageBucket: "hellocon-map-1496105308208.appspot.com",
  messagingSenderId: "468713207669"
};
firebase.initializeApp(config);
const db = firebase.database();

function writeDb(path, json) {
  db.ref(path).set(json);
}

function listenDb(path, callback) {
  const ref = db.ref(path);
  ref.on("value", snap => {
    callback(snap.val());
  });
}

function readDb(path) {
  return new Promise((yes, no) => {
    const ref = db.ref(path);
    ref.once("value", snap => {
      yes(snap.val());
    });
    setTimeout(() => no("Database Timeout"), 2000);
  });
}

// listenData('next',data=>console.log(data))
