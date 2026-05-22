import CaseStudy from '../models/CaseStudy.js';

/**
 * @desc    Create a new Case Study
 * @route   POST /api/case-studies
 * @access  Private
 */
export const addCaseStudy = async (req, res) => {
  try {
    const { institution, cloudProvider, benefits, challenges, roi } = req.body;

    if (!institution || !cloudProvider || !benefits || !challenges || !roi) {
      return res.status(400).json({
        success: false,
        message: 'All fields (institution, cloudProvider, benefits, challenges, roi) are required'
      });
    }

    const caseStudy = await CaseStudy.create({
      institution,
      cloudProvider,
      benefits,
      challenges,
      roi,
      creator: req.user._id
    });

    const populatedCaseStudy = await CaseStudy.findById(caseStudy._id)
      .populate('creator', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedCaseStudy
    });
  } catch (error) {
    console.error('Error creating case study:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create case study'
    });
  }
};

/**
 * @desc    Fetch all Case Studies
 * @route   GET /api/case-studies
 * @access  Private
 */
export const fetchCaseStudies = async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find()
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: caseStudies.length,
      data: caseStudies
    });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch case studies'
    });
  }
};

/**
 * @desc    Delete a Case Study
 * @route   DELETE /api/case-studies/:id
 * @access  Private
 */
export const deleteCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: 'Case study not found'
      });
    }

    const isCreator = caseStudy.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you can only delete your own case studies'
      });
    }

    await caseStudy.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Case study deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting case study:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete case study'
    });
  }
};
