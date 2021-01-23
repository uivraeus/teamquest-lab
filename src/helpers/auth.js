import { auth } from "../services/firebase";

export function signup(email, password) {
  return auth().createUserWithEmailAndPassword(email, password);
}

export function login(email, password) {
  return auth().signInWithEmailAndPassword(email, password);
}

export function logout() {
  return auth().signOut();
}

export function reset(email, redirectUrl) {
  var actionCodeSettings = { url: redirectUrl }; 
  return auth().sendPasswordResetEmail(email, actionCodeSettings);
}

export function authenticate(password) {
  const currentUser = auth().currentUser;
  const cred = auth.EmailAuthProvider.credential(
    currentUser.email,
    password
  );

  return currentUser.reauthenticateWithCredential(cred);
}

export function update(oldPassword, password) {
  return authenticate(oldPassword)
    .then(({ user }) => user.updatePassword(password));
}

export function deleteAccount(password) {
  return authenticate(password)
    .then(({ user }) => user.delete());
}
