import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  cloudProvider: {
    type: String,
    required: [true, 'Cloud provider is required'],
    trim: true,
    maxlength: [100, 'Cloud provider cannot exceed 100 characters']
  },
  benefits: {
    type: String,
    required: [true, 'Benefits details are required'],
    trim: true
  },
  challenges: {
    type: String,
    required: [true, 'Challenges details are required'],
    trim: true
  },
  roi: {
    type: String,
    required: [true, 'ROI details are required'],
    trim: true,
    maxlength: [200, 'ROI details cannot exceed 200 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  }
}, {
  timestamps: true
});

const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);

export default CaseStudy;
