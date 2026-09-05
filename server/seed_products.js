require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/user');
const Listing = require('./models/listing');

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collegeconnect';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Find or create user "abhilasha"
  let user = await User.findOne({
    $or: [
      { username: /^abhilasha$/i },
      { email: 'jhaabhilasha5532@gmail.com' }
    ]
  });

  if (!user) {
    user = await User.create({
      username: 'abhilasha',
      email: 'jhaabhilasha5532@gmail.com',
      password: 'Password123!',
      mobile: '9876543210',
      college: 'Techno India University',
      studentId: '221001001392',
      isEmailVerified: true
    });
    console.log('Created seller user "abhilasha":', user._id);
  } else {
    user.college = 'Techno India University';
    user.studentId = '221001001392';
    await user.save();
    console.log('Found and updated seller user "abhilasha":', user._id);
  }

  // Products across all categories
  const products = [
    // 1. Textbooks
    {
      title: 'Introduction to Algorithms (CLRS 3rd Edition)',
      description: 'Standard computer science algorithms textbook. Clean pages with minimal pencil highlights. Essential for data structures & algorithms coursework.',
      price: 650,
      category: 'Textbooks',
      condition: 'Like New',
      location: 'Central Campus Library',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },
    {
      title: 'Higher Engineering Mathematics by B.S. Grewal',
      description: 'Comprehensive engineering mathematics reference book in excellent condition. Covered in plastic film, no torn pages.',
      price: 450,
      category: 'Textbooks',
      condition: 'Good',
      location: 'Engineering Block 3',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },

    // 2. Electronics
    {
      title: 'Casio fx-991EX Scientific Calculator (ClassWiz)',
      description: 'High-speed scientific calculator with spreadsheet functions. Required for semester engineering and mathematics exams. Includes original protective slide-on case.',
      price: 890,
      category: 'Electronics',
      condition: 'Like New',
      location: 'Hostel Block A',
      images: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },
    {
      title: 'Logitech M221 Silent Wireless Mouse',
      description: 'Smooth 2.4GHz wireless connection, 90% noise reduction, ideal for library and late-night hostel study sessions. Comes with fresh AA battery.',
      price: 499,
      category: 'Electronics',
      condition: 'Like New',
      location: 'Student Activity Center',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },

    // 3. Clothing
    {
      title: 'College Connect Varsity Fleece Hoodie (Navy Blue - Unisex L)',
      description: 'Warm, high-quality fleece hoodie with college emblem patch. Super comfortable for winter campus mornings and AC lecture halls.',
      price: 550,
      category: 'Clothing',
      condition: 'Like New',
      location: 'Girls Hostel 2',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },
    {
      title: 'Formal College Presentation Blazer (Size 38)',
      description: 'Slim-fit charcoal grey blazer, perfect for placement interviews, technical presentations, and college fests. Dry-cleaned and ready to wear.',
      price: 999,
      category: 'Clothing',
      condition: 'Good',
      location: 'Hostel Block B',
      images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },

    // 4. Appliances
    {
      title: 'Pigeon 1.5L Stainless Steel Electric Kettle',
      description: 'Fast boiling 1500W electric kettle with auto-cutoff. Perfect for noodles, coffee, and tea in hostel rooms. Fully tested and clean.',
      price: 520,
      category: 'Appliances',
      condition: 'Like New',
      location: 'Hostel Mess Area',
      images: ['https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },
    {
      title: 'Rechargeable LED Desk Study Lamp with Phone Stand',
      description: '3 brightness levels with eye-protection warm light. Flexible neck and built-in rechargeable battery that lasts up to 6 hours during power cuts.',
      price: 340,
      category: 'Appliances',
      condition: 'Good',
      location: 'Main Library 2nd Floor',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },
    {
      title: 'Bajaj 2000W Induction Cooktop',
      description: 'Lightly used for one semester in PG accommodation. Preset cooking menus, energy-saving, flame-free. Comes with box.',
      price: 1350,
      category: 'Appliances',
      condition: 'Good',
      location: 'Campus South Gate',
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },

    // 5. Notes
    {
      title: 'Database Management Systems (DBMS) Handwritten Notes',
      description: 'Complete syllabus handwritten notes covering SQL, Normalization (1NF to BCNF), Transactions, Concurrency Control, and Indexing. Scoring notes from topper.',
      price: 180,
      category: 'Notes',
      condition: 'Like New',
      location: 'CS Department Cafeteria',
      images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },
    {
      title: 'Operating Systems & System Design Quick Revision Booklet',
      description: 'Short summaries of process scheduling, deadlocks, virtual memory, and page replacement algorithms with diagram explanations.',
      price: 150,
      category: 'Notes',
      condition: 'Good',
      location: 'Central Library Hall',
      images: ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    },

    // 6. PYQ (Previous Year Questions)
    {
      title: 'Solved Semester PYQ Papers (2019 - 2025) All Subjects',
      description: 'Compilation of university previous year exam papers with step-by-step solved answers, recurring questions highlighted, and marking scheme tips.',
      price: 220,
      category: 'PYQ',
      condition: 'Good',
      location: 'Student Union Lounge',
      images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: true
    },
    {
      title: 'Data Structures & Algorithms PYQ Booklet with Code Solutions',
      description: 'Comprehensive 5-year question bank with C++ and Java code solutions, time complexities, and gate exam reference hints.',
      price: 190,
      category: 'PYQ',
      condition: 'Like New',
      location: 'Campus Canteen',
      images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'],
      ownerId: user._id,
      ownerName: user.username,
      status: 'active',
      isFeatured: false
    }
  ];

  for (const item of products) {
    const existing = await Listing.findOne({ title: item.title, ownerId: user._id });
    if (!existing) {
      await Listing.create(item);
      console.log(`✓ Added [${item.category}] - ${item.title}`);
    } else {
      console.log(`Already exists: [${item.category}] - ${item.title}`);
    }
  }

  console.log('--- Finished Seeding Products for Abhilasha ---');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
