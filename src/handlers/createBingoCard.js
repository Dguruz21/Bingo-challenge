const documentClient = require('../utils/database');
const BINGO_CARD_TABLE = process.env.BINGO_CARD_TABLE;

module.exports.handler = async () => {
   const cardId = new Date().getTime().toString();

   const card = generateRandomBingoCard();

   const params = {
      TableName: BINGO_CARD_TABLE,
      Item: {
         CardId: cardId,
         Card: card,
      },
   };

   try {
      await documentClient.put(params).promise();
      return {
         statusCode: 200,
         body: JSON.stringify({
            message: "Cartilla de bingo creada",
            cardId: cardId,
            card: card.map((column, index) => {
               if (index === 2) {
                  column.splice(2, 0, "FREE");
               }
               return column;
            }),
         }),
      };
   } catch (error) {
      return {
         statusCode: 500,
         body: JSON.stringify({ message: "Error al crear la carta de Bingo" + error.message }),
      };
   }
};

function generateRandomBingoCard() {
   const bingoCard = [];

   for (let col = 0; col < 5; col++) {

      const column = [];

      let limitNumber = 5;

      if (col === 2) limitNumber--;

      while (column.length < limitNumber) {
         const randomNumber = getRandomNumberForColumn(col);
         if (!column.includes(randomNumber)) {
            column.push(randomNumber);
         }
      }

      bingoCard.push(column);
   }

   return bingoCard;
}

function getRandomNumberForColumn(col) {
   const min = col * 15 + 1;
   const max = (col + 1) * 15;
   return Math.floor(Math.random() * (max - min + 1)) + min;
}





