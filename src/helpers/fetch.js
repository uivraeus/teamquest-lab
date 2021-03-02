//Translate any failed response from fetch into a thrown error
export function handleFetchErrors(response) {
  if (!response.ok) {
    if (!response.ok) {
      const url = response.url ? response.url : "";
      const status = response.status ? response.status : "<?>";
      const statusText = response.statusText ? (": " + response.statusText) : "";
      const errMsg =
        "Fetch  " + url + " failed, response " + status + statusText;
      throw new Error(errMsg);
    }
    return response; //pass through if ok
  }
  return response;
}

//minimal "wrapper" around fetch(), which always throws in case of error
export function myFetch(...args) {
  return fetch(...args).then(handleFetchErrors)
}