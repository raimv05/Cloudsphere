import Survey from '../models/Survey.js';

/**
 * @desc    Create a new survey
 * @route   POST /api/surveys
 * @access  Private
 */
export const createSurvey = async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Survey title is required'
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      });
    }

    // Validate that multiple_choice questions have options
    for (const q of questions) {
      if (!q.text) {
        return res.status(400).json({
          success: false,
          message: 'All questions must have text'
        });
      }
      if (q.type === 'multiple_choice' && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Multiple choice question "${q.text}" must have options`
        });
      }
    }

    const survey = await Survey.create({
      title,
      questions,
      creator: req.user._id
    });

    res.status(201).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create survey'
    });
  }
};

/**
 * @desc    Fetch all surveys
 * @route   GET /api/surveys
 * @access  Private
 */
export const fetchSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch surveys'
    });
  }
};

/**
 * @desc    Fetch a survey by ID
 * @route   GET /api/surveys/:id
 * @access  Private
 */
export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('creator', 'name email role')
      .populate('responses.user', 'name email role');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('Error fetching survey details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch survey details'
    });
  }
};

/**
 * @desc    Submit responses to a survey
 * @route   POST /api/surveys/:id/responses
 * @access  Private
 */
export const submitResponse = async (req, res) => {
  try {
    const { answers } = req.body;
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check if the user has already responded
    const alreadyResponded = survey.responses.some(
      (response) => response.user.toString() === req.user._id.toString()
    );

    if (alreadyResponded) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a response for this survey'
      });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Survey responses must contain answers'
      });
    }

    // Ensure all answers correspond to survey questions
    const surveyQuestionIds = survey.questions.map((q) => q._id.toString());
    for (const ans of answers) {
      if (!ans.questionId) {
        return res.status(400).json({
          success: false,
          message: 'Each answer must specify a questionId'
        });
      }
      if (!surveyQuestionIds.includes(ans.questionId.toString())) {
        return res.status(400).json({
          success: false,
          message: `Question with ID ${ans.questionId} does not belong to this survey`
        });
      }
      if (ans.value === undefined || ans.value === null || ans.value === '') {
        return res.status(400).json({
          success: false,
          message: 'All questions must be answered'
        });
      }
    }

    // Push the response and save
    survey.responses.push({
      user: req.user._id,
      answers: answers.map((ans) => ({
        questionId: ans.questionId,
        value: ans.value.toString()
      }))
    });

    await survey.save();

    // Populate for response
    const updatedSurvey = await Survey.findById(survey._id)
      .populate('creator', 'name email role')
      .populate('responses.user', 'name email role');

    res.status(201).json({
      success: true,
      data: updatedSurvey
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit response'
    });
  }
};
