import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
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
  createUserWithEmailAndPassword: (email, password) => authWrap(createUserWithEmailAndPassword(getAuth(app), email, password)),
  deleteUser: deleteUser,
  onAuthStateChanged: (cb) => onAuthStateChanged(getAuth(app), cb),
  sendPasswordResetEmail: (email, actionCodeSettings) => authWrap(sendPasswordResetEmail(getAuth(app), email, actionCodeSettings)),
  signInWithEmailAndPassword: (email, password) => authWrap(signInWithEmailAndPassword(getAuth(app), email, password)),
  signOut: () => signOut(getAuth(app)),
  updatePassword: updatePassword,
  //The reauth-function is abstracted a bit instead of just exporting every detail 
  reauthenticateCurrentUser: (password) => {
    const user = getAuth(app).currentUser;
    const cred = EmailAuthProvider.credential(user.email, password);
    return authWrap(reauthenticateWithCredential(user, cred)); 
  },
  //The verification-function is abstracted to always operate on the current user
  sendEmailVerification: (actionCodeSettings) => authWrap(sendEmailVerification(getAuth(app).currentUser, actionCodeSettings))
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

//Helper for parsing and adjusting some "common" auth (user/usage) errors
const userErrorSignatures = {
  "auth/wrong-password": "Wrong password",
  "auth/user-not-found": "User not recognized",
  "auth/email-already-in-use": "User account already exists",
  "auth/network-request-failed": "Network error"
}
const authWrap = (promise) => {
  return promise.catch(err => {
    if ("string" === typeof err.message) {
      for (const [signature, message] of Object.entries(userErrorSignatures)) {
        if (err.message.includes(signature)) {
          throw new Error(message) // found a match -> replace the with translated error
        }
      }
      //Don't translate the error but remove any explicit "Firebase" references
      throw new Error(err.message.replace("Firebase", "Backend service"))
    }
    throw(new Error("Unexpected authentication error")) // plan-B;
  })
}