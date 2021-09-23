import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  getDatabase,
  equalTo,
  limitToLast,
  onValue,
  orderByChild,
  orderByKey,
  push,
  query,
  ref,
  remove,
  runTransaction,
  set,
  update  
} from "firebase/database";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL
};
const app = initializeApp(config);

//Exported (sometimes refined) auth functions
export const auth = {
  createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(getAuth(app), email, password),
  deleteUser: deleteUser,
  onAuthStateChanged: (cb) => onAuthStateChanged(getAuth(app), cb),
  sendPasswordResetEmail: (email, actionCodeSettings) => sendPasswordResetEmail(getAuth(app), email, actionCodeSettings),
  signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(getAuth(app), email, password),
  signOut: () => signOut(getAuth(app)),
  updatePassword: updatePassword,
  //The reauth-function is abstraced a bit instead of just exporting every detail 
  reauthenticateCurrentUser: (password) => {
    const user = getAuth(app).currentUser;
    const cred = EmailAuthProvider.credential(user.email, password);
    return reauthenticateWithCredential(user, cred); 
  }
}

//Exported (sometimes refined) db functions
export const db = {
  equalTo: equalTo,
  limitToLast: limitToLast,
  once: (pathOrQuery) => new Promise((resolve, reject) =>
    onValue(makeQuery(pathOrQuery), 
      snap => resolve(snap), 
      err => reject(err), 
      { onlyOnce: true })),
  onValue: onValue,
  orderByChild: orderByChild,
  orderByKey: orderByKey,
  push: (pathOrRef, value) => push(makeQuery(pathOrRef), value),
  query: (pathOrQuery, ...rest) => query(makeQuery(pathOrQuery), ...rest),
  // ref: (path) => ref(getDatabase(app), path),
  remove: (pathOrRef) => remove(makeQuery(pathOrRef)),
  runTransaction: (pathOrRef, ...rest) => runTransaction(makeQuery(pathOrRef), ...rest),
  set: (pathOrRef, value) => set(makeQuery(pathOrRef), value),
  update: (pathOrRef, ...rest) => update(makeQuery(pathOrRef), ...rest)
}

//Helper for supporting ref/query-strings
const dbRef = (path) => ref(getDatabase(app), path);
const makeQuery = (pathOrQuery) => (typeof pathOrQuery === "string" ? dbRef(pathOrQuery) : pathOrQuery );