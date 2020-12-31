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

export function update(oldPassword, password) {
  const currentUser = auth().currentUser;
  const cred = auth.EmailAuthProvider.credential(
    currentUser.email,
    oldPassword
  );

  return currentUser
    .reauthenticateWithCredential(cred)
    .then(() => currentUser.updatePassword(password));
}

export function deleteAccount(password) {
  const currentUser = auth().currentUser;
  const cred = auth.EmailAuthProvider.credential(
    currentUser.email,
    password
  );

  return currentUser
    .reauthenticateWithCredential(cred)
    .then(() => currentUser.delete());
}
