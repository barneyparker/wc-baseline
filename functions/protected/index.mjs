const AUTH_ORIGIN = 'https://auth.barneyparker.com';

export const handler = async (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  const sub = claims.sub;
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';

  let user = { sub };

  if (authHeader) {
    try {
      const res = await fetch(`${AUTH_ORIGIN}/userinfo`, {
        headers: { 'Authorization': authHeader },
      });
      if (res.ok) {
        user = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err.message);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'You are authenticated!',
      user,
      timestamp: new Date().toISOString(),
    }),
  };
};
