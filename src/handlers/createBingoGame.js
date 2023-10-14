const documentClient = require('../utils/database');
const { v4: uuidv4 } = require('uuid');
const BINGO_GAME_TABLE = process.env.BINGO_GAME_TABLE;

module.exports.handler = async () => {
   const gameId = uuidv4();

   const params = {
      TableName: BINGO_GAME_TABLE,
      Item: {
         GameId: gameId,
      },
   };

   try {
      await documentClient.put(params).promise();
      return {
         statusCode: 200,
         body: JSON.stringify({ gameId }),
      };
   } catch (error) {
      return {
         statusCode: 500,
         body: JSON.stringify({ message: "Error al crear el juego de Bingo" + error.message }),
      };
   }
};






