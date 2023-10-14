const DynamoDB = require('aws-sdk/clients/dynamodb');

const docuemntClient = new DynamoDB.DocumentClient({
   region: process.env.AWS_REGION || 'us-east-1',
   maxRetries: 3,
   httpOptions: {
      timeout: 5000,
   },
});

module.exports = docuemntClient;