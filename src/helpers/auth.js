import { auth } from "../services/firebase";

export function signup(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

export function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

export function logout() {
  return auth.signOut();
}

export function reset(email, redirectUrl = null) {
  var actionCodeSettings = redirectUrl ? { url: redirectUrl } : undefined; 
  return auth.sendPasswordResetEmail(email, actionCodeSettings);
}

export function update(oldPassword, password) {
  return auth.reauthenticateCurrentUser(oldPassword)
    .then(({ user }) => auth.updatePassword(user, password));
}

export function deleteAccount(password) {
  return auth.reauthenticateCurrentUser(password)
    .then(({ user }) => auth.deleteUser(user));
}
