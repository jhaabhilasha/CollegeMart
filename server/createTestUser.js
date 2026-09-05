const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const abhilasha = await mongoose.connection.collection('users').findOne({
    $or: [{ username: /^abhilasha$/i }, { email: 'jhaabhilasha553@gmail.com' }]
  });

  if (!abhilasha) {
    console.error('Abhilasha user not found!');
    process.exit(1);
  }

  console.log('Found Abhilasha:', abhilasha._id);

  let ritik = await mongoose.connection.collection('users').findOne({ email: 'ritik10@gmail.com' });
  let shreeya = await mongoose.connection.collection('users').findOne({ email: 'jhaabhilasha5532@gmail.com' });

  // 1. Add 7 exciting new college items for Abhilasha
  const newItems = [
    {
      title: 'boAt Rockerz 450 Bluetooth On-Ear Headphones (Matte Black)',
      description: 'Up to 15 hours battery backup, 40mm dynamic drivers, padded ear cushions. Clean sound and powerful bass. Comes with aux cable and box.',
      price: 799,
      category: 'Electronics',
      condition: 'Like New',
      location: 'Student Center / North Canteen',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'AmazonBasics Ergonomic Aluminum Laptop Stand (Silver)',
      description: 'Sturdy metallic laptop riser with silicone anti-slip pads. Keeps laptop cool and elevates screen to eye level. Supports 11-inch to 17-inch laptops.',
      price: 480,
      category: 'Electronics',
      condition: 'Good',
      location: 'Girls Hostel Block A',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Fastrack Sturdy Campus College Backpack (Navy Blue - 32L)',
      description: 'Durable 3-compartment water-resistant backpack with padded 15.6 inch laptop sleeve, bottle holders, and rain cover included.',
      price: 590,
      category: 'Clothing',
      condition: 'Good',
      location: 'Central Campus Gate',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Computer Networks (5th Edition) by Andrew S. Tanenbaum',
      description: 'The definitive textbook for computer networking, protocol layers, socket programming, and security. Very well preserved, perfect for 5th semester exam prep.',
      price: 520,
      category: 'Textbooks',
      condition: 'Like New',
      location: 'Computer Science Department',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Engineering Mini Drafter with Sheet Clips and Scale Set',
      description: 'Omega mini drafter with stainless steel rod, clamping knob, and protector. Used for 1st year Engineering Graphics. Works smoothly without any misalignment.',
      price: 390,
      category: 'Appliances',
      condition: 'Good',
      location: 'Mechanical Workshop Block',
      images: [
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Yonex GR 303 Badminton Racket Duo with Nylon Shuttles',
      description: 'Pair of lightweight aluminum alloy racquets with grip wrap and full carrying cover. Perfect for evening games at the campus sports complex.',
      price: 490,
      category: 'Clothing',
      condition: 'Good',
      location: 'Campus Sports Complex',
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Milton Thermosteel Flip Lid Insulated Water Bottle (1000ml)',
      description: 'Double-walled vacuum insulated flask. Keeps tea or coffee warm for 18 hours and cold water chilled for 24 hours. Food-grade 18/8 stainless steel.',
      price: 360,
      category: 'Appliances',
      condition: 'Like New',
      location: 'Main Library 1st Floor',
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
      ],
      ownerId: abhilasha._id,
      ownerName: abhilasha.username,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const insertRes = await mongoose.connection.collection('listings').insertMany(newItems);
  console.log('Inserted new listings for Abhilasha:', insertRes.insertedCount);

  // 2. Add realistic messages for Abhilasha from Ritik and Shreeya
  if (ritik) {
    const casio = await mongoose.connection.collection('listings').findOne({
      ownerId: abhilasha._id,
      title: /Casio/i
    });

    await mongoose.connection.collection('messages').insertOne({
      text: 'Hey Abhilasha! Is your Casio calculator still available? Can we meet at the Central Library around 4 PM today?',
      senderId: ritik._id,
      receiverId: abhilasha._id,
      listingId: casio ? casio._id : null,
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date()
    });
    console.log('Added message from Ritik');
  }

  if (shreeya) {
    const clrs = await mongoose.connection.collection('listings').findOne({
      ownerId: abhilasha._id,
      title: /Algorithms/i
    });

    await mongoose.connection.collection('messages').insertOne({
      text: 'Hi Abhilasha, I saw your listing for the Algorithms textbook! Is the condition good? Would you consider ₹550 for it?',
      senderId: shreeya._id,
      receiverId: abhilasha._id,
      listingId: clrs ? clrs._id : null,
      isRead: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      updatedAt: new Date()
    });
    console.log('Added message from Shreeya');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
