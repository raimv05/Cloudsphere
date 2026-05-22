import mongoose from 'mongoose';

const researchPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Virtual field for formatting or other helpers could be added later if needed.

const ResearchPaper = mongoose.model('ResearchPaper', researchPaperSchema);

export default ResearchPaper;
