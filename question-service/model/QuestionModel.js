import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  examples: {
    type: String,
    required: true,
  },
});

const QuestionModel = mongoose.model('QuestionModel', QuestionModelSchema);

const createQuestion = async (name, description, difficulty, examples) => {
  try {
    const newQuestion = new QuestionModel({
      name,
      description,
      difficulty,
      examples,
    });
    return await newQuestion.save();
  } catch (err) {
    console.log(`ERROR (DB could not create new question):\n ${err}`);
    return false;
  }
};

const getQuestions = async () => {
  try {
    return await QuestionModel.find();
  } catch (err) {
    console.log(`ERROR (DB could not find questions):\n ${err}`);
    return false;
  }
};

const getQuestionsByDifficulty = async (difficulty) => {
  try {
    return await QuestionModel.find({ difficulty });
  } catch (err) {
    console.log(`ERROR (DB could not find questions by difficulty):\n ${err}`);
    return false;
  }
};

export default { createQuestion, getQuestions, getQuestionsByDifficulty, };
