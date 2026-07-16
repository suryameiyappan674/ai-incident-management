require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

const seedData = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_incident_management';

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Clear existing data to ensure a clean start
    await User.deleteMany({});
    await Role.deleteMany({});
    console.log('Cleared existing Users and Roles.');

    // 1. Insert Roles
    const roles = await Role.create([
      {
        name: 'user',
        description: 'Regular employee with basic profile access.',
        permissions: ['read_profile']
      },
      {
        name: 'engineer',
        description: 'Engineer with capability to manage application content.',
        permissions: ['read_profile', 'manage_content']
      },
      {
        name: 'admin',
        description: 'Administrator with full database and user management capabilities.',
        permissions: ['read_profile', 'manage_content', 'manage_users']
      }
    ]);
    console.log('Inserted Roles: user, engineer, admin.');

    // Map role names to ObjectIds for user creation
    const userRole = roles.find(r => r.name === 'user');
    const engineerRole = roles.find(r => r.name === 'engineer');
    const adminRole = roles.find(r => r.name === 'admin');

    // 2. Insert Users (the User pre-save hook will automatically hash the passwords)
    await User.create([
      {
        username: 'alice_regular',
        email: 'alice@example.com',
        password: 'password123',
        role: userRole._id
      },
      {
        username: 'bob_engineer',
        email: 'bob@example.com',
        password: 'password123',
        role: engineerRole._id
      },
      {
        username: 'charlie_admin',
        email: 'charlie@example.com',
        password: 'password123',
        role: adminRole._id
      }
    ]);
    console.log('Inserted Users (alice_regular, bob_engineer, charlie_admin). Passwords set to "password123".');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
