#!/usr/bin/env node

/**
 * Environment Variables Setup Helper
 * Run: node scripts/setup-env.js
 */

import readline from 'readline';
import crypto from 'crypto';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function validateMongoDBURI(uri) {
  return uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://');
}

function validateStripeKey(key) {
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

async function setup() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Property Rental Server - Environment Variables Setup  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // MongoDB URI
  console.log('📝 MongoDB Configuration');
  console.log('   Get your connection string from: https://cloud.mongodb.com\n');
  const mongodbUri = await question('   Enter your MongoDB URI: ');

  while (!validateMongoDBURI(mongodbUri)) {
    console.log('   ❌ Invalid MongoDB URI. Must start with mongodb+srv:// or mongodb://');
    const retry = await question('   Enter your MongoDB URI (or press Ctrl+C to exit): ');
    if (!retry) process.exit(1);
  }

  // JWT Secret
  console.log('\n🔐 JWT Secret Configuration');
  const useGenerated = await question('   Auto-generate secure JWT secret? (Y/n): ');
  let jwtSecret;

  if (useGenerated.toLowerCase() === 'n') {
    jwtSecret = await question('   Enter your JWT secret (min 32 chars): ');
    while (jwtSecret.length < 32) {
      console.log('   ❌ JWT secret must be at least 32 characters');
      jwtSecret = await question('   Enter your JWT secret: ');
    }
  } else {
    jwtSecret = generateJWTSecret();
    console.log('   ✅ Generated JWT Secret:', jwtSecret);
  }

  // Stripe Key
  console.log('\n💳 Stripe Configuration');
  console.log('   Get your key from: https://dashboard.stripe.com/apikeys\n');
  const stripeKey = await question('   Enter your Stripe Secret Key: ');

  while (!validateStripeKey(stripeKey)) {
    console.log('   ❌ Invalid Stripe key. Must start with sk_test_ or sk_live_');
    const retry = await question('   Enter your Stripe Secret Key: ');
    if (!retry) process.exit(1);
  }

  // Client URL
  console.log('\n🌐 Frontend Configuration');
  const clientUrl = await question('   Enter your frontend URL (default: http://localhost:3000): ') || 'http://localhost:3000';

  // Admin credentials
  console.log('\n👤 Admin Account Configuration');
  const adminEmail = await question('   Enter admin email (default: admin@example.com): ') || 'admin@example.com';
  const adminPassword = await question('   Enter admin password: ');

  while (adminPassword.length < 8) {
    console.log('   ❌ Password must be at least 8 characters');
    adminPassword = await question('   Enter admin password: ');
  }

  // Generate .env file
  const envContent = `# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Connection
MONGODB_URI=${mongodbUri}

# JWT Authentication
JWT_SECRET=${jwtSecret}

# Stripe Payment Gateway
STRIPE_SECRET_KEY=${stripeKey}

# Frontend URL
CLIENT_URL=${clientUrl}

# Admin Account
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}
`;

  // Save to .env.local for Vercel
  fs.writeFileSync('.env.local', envContent);
  console.log('\n✅ Environment configuration saved to .env.local\n');

  // Vercel instructions
  console.log('📋 Next Steps:');
  console.log('   1. Review the generated .env.local file');
  console.log('   2. Deploy to Vercel:');
  console.log('      npx vercel');
  console.log('   3. Set environment variables in Vercel dashboard:');
  console.log('      - MONGODB_URI');
  console.log('      - JWT_SECRET');
  console.log('      - STRIPE_SECRET_KEY');
  console.log('      - CLIENT_URL');
  console.log('      - ADMIN_EMAIL');
  console.log('      - ADMIN_PASSWORD\n');

  rl.close();
}

setup().catch(console.error);
