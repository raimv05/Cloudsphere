import SecurityReport from '../models/SecurityReport.js';

/**
 * @desc    Create a new Security Report
 * @route   POST /api/security-reports
 * @access  Private
 */
export const addSecurityReport = async (req, res) => {
  try {
    const { institution, riskLevel, complianceStatus, findings } = req.body;

    if (!institution || !riskLevel || !complianceStatus || !findings) {
      return res.status(400).json({
        success: false,
        message: 'All fields (institution, riskLevel, complianceStatus, findings) are required'
      });
    }

    if (!Array.isArray(findings) || findings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Findings must be a non-empty array of strings'
      });
    }

    const report = await SecurityReport.create({
      institution,
      riskLevel,
      complianceStatus,
      findings,
      creator: req.user._id
    });

    const populatedReport = await SecurityReport.findById(report._id)
      .populate('creator', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedReport
    });
  } catch (error) {
    console.error('Error creating security report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create security report'
    });
  }
};

/**
 * @desc    Fetch all Security Reports
 * @route   GET /api/security-reports
 * @access  Private
 */
export const fetchSecurityReports = async (req, res) => {
  try {
    const reports = await SecurityReport.find()
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching security reports:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch security reports'
    });
  }
};
