import mongoose from 'mongoose';

const securityReportSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [120, 'Institution name cannot exceed 120 characters']
  },
  riskLevel: {
    type: String,
    required: [true, 'Risk level is required'],
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Risk level must be Low, Medium, High, or Critical'
    }
  },
  complianceStatus: {
    type: String,
    required: [true, 'Compliance status is required'],
    enum: {
      values: ['Compliant', 'Non-Compliant', 'Under Review'],
      message: 'Compliance status must be Compliant, Non-Compliant, or Under Review'
    }
  },
  findings: {
    type: [String],
    required: [true, 'Findings are required'],
    validate: {
      validator: function(val) {
        return Array.isArray(val) && val.length > 0;
      },
      message: 'At least one finding must be provided'
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  }
}, {
  timestamps: true
});

const SecurityReport = mongoose.model('SecurityReport', securityReportSchema);

export default SecurityReport;
