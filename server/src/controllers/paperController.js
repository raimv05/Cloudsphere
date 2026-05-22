import ResearchPaper from '../models/ResearchPaper.js';

/**
 * @desc    Add a new research paper
 * @route   POST /api/papers
 * @access  Private
 */
export const addPaper = async (req, res, next) => {
  try {
    const { title, category, summary } = req.body;

    // Simple validation
    if (!title || !category || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, and summary'
      });
    }

    const paper = await ResearchPaper.create({
      title,
      category,
      summary,
      author: req.user._id
    });

    // Populate author info for response
    const populatedPaper = await ResearchPaper.findById(paper._id).populate('author', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Research paper added successfully',
      data: populatedPaper
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all research papers
 * @route   GET /api/papers
 * @access  Private
 */
export const getPapers = async (req, res, next) => {
  try {
    const papers = await ResearchPaper.find()
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a research paper
 * @route   DELETE /api/papers/:id
 * @access  Private
 */
export const deletePaper = async (req, res, next) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Research paper not found'
      });
    }

    // Check ownership or admin role
    if (paper.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this research paper'
      });
    }

    await ResearchPaper.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Research paper removed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
