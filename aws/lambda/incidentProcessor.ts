/**
 * AWS Lambda Handler: Incident Processor
 * Persists escalated safety events into Amazon DynamoDB and triggers notification.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' }));
const TABLE_NAME = process.env.DYNAMODB_TABLE_INCIDENTS || 'guardianx-incidents';

export const handler = async (incidentPayload: any): Promise<any> => {
  const incident = {
    id: incidentPayload.id || `inc_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'open',
    severity: incidentPayload.severity || 'high',
    location: incidentPayload.location || 'Front Entrance',
    aiAnalysis: incidentPayload.aiAnalysis,
    caregiversNotified: incidentPayload.caregiversNotified || [],
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: incident,
    })
  );

  return { success: true, incidentId: incident.id };
};
