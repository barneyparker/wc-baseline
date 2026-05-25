/**
 * @import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
 */

/**
 * Root API handler – returns a simple timestamp payload.
 *
 * @param {APIGatewayEvent} event – API Gateway HTTP API event.
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp: new Date().toISOString() }),
  };
};
