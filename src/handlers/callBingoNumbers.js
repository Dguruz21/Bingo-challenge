const documentClient = require('../utils/database');
const BINGO_GAME_TABLE = process.env.BINGO_GAME_TABLE;
const BINGO_CARD_TABLE = process.env.BINGO_CARD_TABLE;
module.exports.handler = async (event, context, callback) => {

   const idGame = event.pathParameters.id;

   try {

      const gameExists = await checkIfGameExists(idGame);

      if (!gameExists) {
         return {
            statusCode: 400,
            body: JSON.stringify({ message: "El juego no existe" }),
         };
      }

      const bolillasdb = await checkCurrentNumbers(idGame);

      if (bolillasdb === undefined) {

         const firstRandomNumber = Math.floor(Math.random() * 75) + 1;

         await createFirstNumber(idGame, firstRandomNumber);

         callback(null, {
            statusCode: 200,
            body: JSON.stringify({
               message: "Se ha creado el primer número",
               idGame: idGame,
               balls: [firstRandomNumber]
            })
         })

      } else if (bolillasdb.values.length >= 24) {

         const params = {
            TableName: BINGO_CARD_TABLE,
         }
         const data = await documentClient.scan(params).promise();

         for (let card of data.Items) {

            const allBallsFromPlayer = []
            for (let fila of card.Card) {
               for (let numero of fila) {
                  allBallsFromPlayer.push(numero);
               }
            }
            let count = 0;
            for (let i = 0; i < allBallsFromPlayer.length; i++) {
               if (bolillasdb.values.includes(allBallsFromPlayer[i])) {
                  count++;
                  if (count === 24) {
                     callback(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                           message: "Hay al menos un ganador",
                           idGame: idGame,
                        })
                     })
                  }
               }
            }
         }
      }

      const response = await createNextNumbers(idGame, bolillasdb.values);

      callback(null, {
         statusCode: 200,
         body: JSON.stringify({
            message: "Se ha creado el siguiente número",
            idGame: idGame,
            balls: response,
            total: response.length
         })
      })

   } catch (error) {
      return {
         statusCode: 500,
         body: JSON.stringify({ message: "Error al crear el juego de Bingo" + "|" + error.message + "|" + error + idGame }),
      };
   }
};

async function checkIfGameExists(idGame) {
   const params = {
      TableName: BINGO_GAME_TABLE,
      Key: { GameId: idGame },
   };

   const result = await documentClient.get(params).promise();
   return !!result.Item;
}

async function checkCurrentNumbers(idGame) {
   const params = {
      TableName: BINGO_GAME_TABLE,
      Key: {
         GameId: idGame,
      },
   };

   const data = await documentClient.get(params).promise();

   return data.Item.numbers;
}

async function createFirstNumber(idGame, ball) {

   const params = {
      TableName: BINGO_GAME_TABLE,
      Key: {
         GameId: idGame,
      },
      UpdateExpression: "set numbers = :numbers",
      ExpressionAttributeValues: {
         ":numbers": documentClient.createSet([Number(ball)])
      },
      ReturnValues: "UPDATED_NEW",
   };

   await documentClient.update(params).promise();
}

async function createNextNumbers(idGame, currentBalls) {

   let number;

   do {
      number = Math.floor(Math.random() * 75) + 1;
   } while (currentBalls.includes(number));

   currentBalls.push(number);

   const params = {
      TableName: BINGO_GAME_TABLE,
      Key: {
         GameId: idGame,
      },
      UpdateExpression: "set numbers = :numbers",
      ExpressionAttributeValues: {
         ":numbers": documentClient.createSet(currentBalls),
      },
      ReturnValues: "UPDATED_NEW",
   };

   await documentClient.update(params).promise();

   return currentBalls;
}






