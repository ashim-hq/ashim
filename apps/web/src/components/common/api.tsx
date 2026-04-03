// -- API Helper functions --------------------------------------------------------

function getToken(): string {
  return localStorage.getItem("stirling-token") || "";
}

export function formatHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);

  // We only want to add the authorization header if there is a token.
  // This is to avoid sending the authorization header with an empty token,
  // which could cause issues with forward auth requestd through a proxy
  // which may try to authenticate the request with an empty token.
  const token = getToken();
  if (token && token.length > 0) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
