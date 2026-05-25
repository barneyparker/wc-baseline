/**
 * Rewrite viewer request URIs for a static MPA site.
 *
 * - Trailing `/`  →  append `index.html`
 * - No extension  →  append `.html`
 * - Otherwise     →  pass through
 *
 * @param {{ request: { uri: string } }} event – CloudFront viewer-request event.
 * @returns {{ request: { uri: string } }}
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '.html';
  }

  return request;
}
