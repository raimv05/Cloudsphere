/**
 * Helper regex for checking email format.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middleware validator for user registration.
 */
export const validateRegister = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be a valid string'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error in validateRegister:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation check'
    });
  }
};

/**
 * Middleware validator for user login.
 */
export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error in validateLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation check'
    });
  }
};

/**
 * Middleware validator for research paper creation.
 */
export const validatePaper = (req, res, next) => {
  try {
    const { title, category, summary } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Paper title is required'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Paper title cannot exceed 200 characters'
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Paper category tag is required'
      });
    }

    if (category.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Paper category tag cannot exceed 100 characters'
      });
    }

    if (!summary || typeof summary !== 'string' || summary.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Executive summary is required and must be at least 10 characters long'
      });
    }

    if (summary.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Executive summary cannot exceed 2000 characters'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error in validatePaper:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation check'
    });
  }
};

/**
 * Middleware validator for survey creation.
 */
export const validateSurvey = (req, res, next) => {
  try {
    const { title, questions } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Survey title is required'
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one survey question is required'
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} text is required`
        });
      }

      if (!['text', 'multiple_choice', 'rating'].includes(q.type)) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} has an invalid type: ${q.type}. Allowed types are: 'text', 'multiple_choice', 'rating'`
        });
      }

      if (q.type === 'multiple_choice') {
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Multiple choice question "${q.text}" (Question ${i + 1}) must contain at least one option`
          });
        }

        const validOptions = q.options.filter(opt => typeof opt === 'string' && opt.trim().length > 0);
        if (validOptions.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Multiple choice question "${q.text}" (Question ${i + 1}) has no valid option strings`
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Validation error in validateSurvey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation check'
    });
  }
};

/**
 * Middleware validator for survey response submission.
 */
export const validateSurveyResponse = (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Survey response must contain answers'
      });
    }

    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      if (!ans.questionId) {
        return res.status(400).json({
          success: false,
          message: `Answer at index ${i} is missing questionId`
        });
      }

      if (ans.value === undefined || ans.value === null || ans.value.toString().trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'All questions must have a response value'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Validation error in validateSurveyResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation check'
    });
  }
};
