export const appPaths = {
  contact: "contact",
  creator: "creator",
  login: "login",
  passwordReset: "reset",
  privacy :"privacy",
  results: "results",
  run: "run",
  signup: "signup",
  start: "start",
  terms: "terms",
}

export const creatorPaths = {
  changePassword: "password",
  info: "info",
  inherit: "inherit",
  main: "main",
  manage: "manage",
  monitor: "tracker",
  new: "new",
  shareResults: "share-results",
  terminate: "terminate",
  transfer: "transfer",
  verify: "verify"
}

export const absAppPath = (key) => `/${appPaths[key]}`;

export const absCreatorPath = (key) => `/${appPaths.creator}/${creatorPaths[key]}`;