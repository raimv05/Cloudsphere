import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['text', 'multiple_choice', 'rating'],
      message: 'Question type must be text, multiple_choice, or rating'
    },
    default: 'text'
  },
  options: [{
    type: String,
    trim: true
  }]
});

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for a response']
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required']
    },
    value: {
      type: String,
      required: [true, 'Answer value is required'],
      trim: true
    }
  }]
}, {
  timestamps: true
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Survey title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(val) {
        return val && val.length > 0;
      },
      message: 'A survey must have at least one question'
    }
  },
  responses: [responseSchema]
}, {
  timestamps: true
});

const Survey = mongoose.model('Survey', surveySchema);

export default Survey;
