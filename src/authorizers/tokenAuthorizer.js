exports.handler = (event, context, callback) => {
   const token = event.headers.authorization;
   console.log(token);

   if (token === 'allow') {
      callback(null, generatedPolicy(token, 'Allow', event.routeArn));
   } else if (token === 'deny') {
      callback(null, generatedPolicy(token, 'Deny', event.routeArn));
   } else {
      callback('No Authozization token found')
   }
}

const generatedPolicy = (principalId, effect, resource) => {
   const response = {}
   response.principalId = principalId;

   if (effect && resource) {
      const policyDocument = {
         Version: '2012-10-17',
         Statement: [
            {
               Effect: effect,
               Action: 'execute-api:Invoke',
               Resource: resource
            }
         ]
      }
      response.policyDocument = policyDocument;
   }
   return response;
}
