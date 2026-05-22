import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import CaseStudy from '../src/models/CaseStudy.js';
import ResearchPaper from '../src/models/ResearchPaper.js';
import SecurityReport from '../src/models/SecurityReport.js';
import Survey from '../src/models/Survey.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsphere';

const seed = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected. Clearing existing demo data...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      CaseStudy.deleteMany({}),
      ResearchPaper.deleteMany({}),
      SecurityReport.deleteMany({}),
      Survey.deleteMany({})
    ]);

    console.log('Creating demo users...');
    const users = await User.create([
      { name: 'Demo Admin', email: 'admin@example.com', password: 'Password123!', role: 'admin' },
      { name: 'Demo User', email: 'user@example.com', password: 'Password123!', role: 'user' }
    ]);

    const admin = users.find(u => u.role === 'admin');
    const user = users.find(u => u.role === 'user');

    console.log('Creating demo case studies...');
    const cs1 = await CaseStudy.create({
      institution: 'Acme University',
      cloudProvider: 'AWS',
      benefits: 'Improved scalability and reduced costs',
      challenges: 'Initial migration complexity',
      roi: '40% cost reduction',
      creator: admin._id
    });

    const cs2 = await CaseStudy.create({
      institution: 'City Hospital',
      cloudProvider: 'Microsoft Azure',
      benefits: 'Better compliance and availability',
      challenges: 'Staff training',
      roi: '20% improvement',
      creator: user._id
    });

    console.log('Creating demo research papers...');
    const p1 = await ResearchPaper.create({
      title: 'Cloud Economics 101',
      category: 'Economics',
      summary: 'An introduction to cloud cost modelling.',
      author: admin._id
    });

    const p2 = await ResearchPaper.create({
      title: 'Secure Cloud Architectures',
      category: 'Security',
      summary: 'Patterns for building secure cloud systems.',
      author: user._id
    });

    console.log('Creating demo security reports...');
    const sr1 = await SecurityReport.create({
      institution: 'Acme University',
      riskLevel: 'Medium',
      complianceStatus: 'Under Review',
      findings: ['Open S3 buckets', 'Weak IAM policies'],
      creator: admin._id
    });

    console.log('Creating demo surveys...');
    const survey = await Survey.create({
      title: 'Cloud Adoption Survey',
      questions: [
        { text: 'Which cloud provider do you use?', type: 'multiple_choice', options: ['AWS', 'Azure', 'GCP'] },
        { text: 'Rate your cloud maturity (1-5)', type: 'rating' },
        { text: 'Any comments on migration?', type: 'text' }
      ],
      creator: user._id
    });

    console.log('Seeding complete. Summary:');
    console.log(`Users: ${users.length}, CaseStudies: 2, Papers: 2, SecurityReports: 1, Surveys: 1`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Seed script finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

seed();
