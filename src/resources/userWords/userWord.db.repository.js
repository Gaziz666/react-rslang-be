const UserWord = require('./userWord.model');
const { NOT_FOUND_ERROR, ENTITY_EXISTS } = require('../../errors/appErrors');
const ENTITY_NAME = 'user word';
const MONGO_ENTITY_EXISTS_ERROR_CODE = 11000;

const getAll = async userId => UserWord.find({ userId });

const get = async (wordId, userId) => {
  const userWord = await UserWord.findOne({ wordId, userId });
  if (!userWord) {
    throw new NOT_FOUND_ERROR(ENTITY_NAME, { wordId, userId });
  }

  return userWord;
};

const save = async (wordId, userId, userWord) => {
  try {
    return await UserWord.create(userWord);
  } catch (err) {
    if (err.code === MONGO_ENTITY_EXISTS_ERROR_CODE) {
      throw new ENTITY_EXISTS(`such ${ENTITY_NAME} already exists`);
    } else {
      throw err;
    }
  }
};

const update = async (wordId, userId, userWord) => {
  const updatedWord = await UserWord.findOneAndUpdate(
    { wordId, userId },
    { $set: userWord },
    { new: true }
  );
  if (!updatedWord) {
    throw new NOT_FOUND_ERROR(ENTITY_NAME, { wordId, userId });
  }

  return updatedWord;
};

const updateLearn = async (wordId, userId, userWord) => {
  let updatedWord = {};
  if (userWord.optional.isCorrect) {
    updatedWord = await UserWord.findOneAndUpdate(
      { wordId, userId },
      {
        $set: { 'optional.learning': true, 'optional.learned': true },
        $inc: { 'optional.correctCount': 1, 'optional.inCorrectCount': 0 }
      },
      { new: true }
    );
  } else {
    updatedWord = await UserWord.findOneAndUpdate(
      { wordId, userId },
      {
        $set: { 'optional.learning': true, 'optional.learned': false },
        $inc: { 'optional.inCorrectCount': 1, 'optional.correctCount': 0 }
      }
    );
  }

  if (!updatedWord) {
    throw new NOT_FOUND_ERROR(ENTITY_NAME, { wordId, userId });
  }
  return updatedWord;
};

const remove = async (wordId, userId) => UserWord.deleteOne({ wordId, userId });

module.exports = { getAll, get, save, update, remove, updateLearn };
