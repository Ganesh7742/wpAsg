const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

const seedTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_workload');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('[Seed] Cleared existing tasks.');

    const now = new Date();
    
    // Dates relative to current date (now is 2026-10-11 in the prompt)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 2);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    
    const later = new Date(today);
    later.setDate(today.getDate() + 8);

    const pastOverdue = new Date(today);
    pastOverdue.setDate(today.getDate() - 3);

    const pastCompleted = new Date(today);
    pastCompleted.setDate(today.getDate() - 2);

    const sampleTasks = [
      {
        taskName: 'Complete DBMS Normalization Assignment',
        subject: 'Database Management Systems',
        deadline: tomorrow,
        priority: 'High',
        status: 'In Progress',
      },
      {
        taskName: 'OS Memory Management Lab Report',
        subject: 'Operating Systems',
        deadline: today,
        priority: 'High',
        status: 'Pending',
      },
      {
        taskName: 'Computer Networks Socket Programming',
        subject: 'Computer Networks',
        deadline: nextWeek,
        priority: 'Medium',
        status: 'Pending',
      },
      {
        taskName: 'Web Programming HTML & CSS Exercise',
        subject: 'Web Technologies',
        deadline: pastCompleted,
        priority: 'Medium',
        status: 'Completed',
      },
      {
        taskName: 'Data Structures AVL Trees Implementation',
        subject: 'Data Structures & Algorithms',
        deadline: pastOverdue,
        priority: 'High',
        status: 'Pending',
      },
      {
        taskName: 'Software Engineering SRS Documentation',
        subject: 'Software Engineering',
        deadline: later,
        priority: 'Low',
        status: 'Pending',
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[Seed] Successfully inserted ${sampleTasks.length} sample tasks.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedTasks();
