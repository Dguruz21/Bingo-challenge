const documentClient = require('../utils/database');
const BINGO_GAME_TABLE = process.env.BINGO_GAME_TABLE;
const BINGO_CARD_TABLE = process.env.BINGO_CARD_TABLE;

module.exports.handler = async (event, context, callback) => {

   const data = JSON.parse(event.body);

   try {

      const gameExists = await checkIfGameExists(data.idGame);

      if (!gameExists) {
         return {
            statusCode: 400,
            body: JSON.stringify({ message: "El juego no existe" }),
         };
      }

      const cardExists = await checkIfCardExists(data.idCard);

      if (!cardExists) {
         return {
            statusCode: 400,
            body: JSON.stringify({ message: "La cartilla no existe" }),
         };
      }

      const bolillasdb = await checkCurrentNumbers(data.idGame);

      if (bolillasdb === undefined || bolillasdb.length === 0) {

         callback(null, {
            statusCode: 200,
            body: JSON.stringify({
               message: "Aun no se ha seleccionado ningún número",
               idGame: data.idGame,
            })
         })

      } else if (bolillasdb.values.length < 24) {
         callback(null, {
            statusCode: 200,
            body: JSON.stringify({
               message: "La cantidad de números seleccionados es menor a 24",
               amountOfNumbers: bolillasdb.values.length,
               idGame: data.idGame,
            })
         })
      } else if (bolillasdb.values.length >= 24) {

         const playerballs = await getPlayerBalls(data.idCard);

         const allBallsFromPlayer = []

         for (let fila of playerballs) {
            for (let numero of fila) {
               allBallsFromPlayer.push(numero);
            }
         }

         let todosEncontrados = true;

         for (let i = 0; i < allBallsFromPlayer.length; i++) {
            if (!bolillasdb.values.includes(allBallsFromPlayer[i])) {
               todosEncontrados = false;
               break;
            }
         }

         callback(null, {
            statusCode: 200,
            body: JSON.stringify({
               message: todosEncontrados ? "Bingo!" : "No Bingo",
            })
         })
      }



   } catch (error) {
      return {
         statusCode: 500,
         body: JSON.stringify({ message: "Error verificar" + "|" + error.message + "|" + error + data.idGame }),
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

async function checkIfCardExists(idCard) {
   const params = {
      TableName: BINGO_CARD_TABLE,
      Key: { CardId: idCard },
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

async function getPlayerBalls(idCard) {
   const params = {
      TableName: BINGO_CARD_TABLE,
      Key: {
         CardId: idCard,
      },
   };

   const data = await documentClient.get(params).promise();

   return data.Item.Card;
}






