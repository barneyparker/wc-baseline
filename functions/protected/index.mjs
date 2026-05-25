/**
 * @import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
 */

/**
 * Protected endpoint – only reachable via the JWT authorizer.
 * Returns the authenticated user's subject claim.
 *
 * @param {APIGatewayEvent & { requestContext: { authorizer: { jwt: { claims: Record<string, string> } } } }} event
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: claims.sub,
      message: 'You are authenticated!',
      timestamp: new Date().toISOString(),
    }),
  };
};
