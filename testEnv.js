// testEnv.js
require('dotenv').config();

console.log('=== Testing Environment Variables ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
console.log('===============================');

// Test if .env is loading
if (!process.env.JWT_SECRET) {
  console.log('\n❌ .env file is not loading! Check:');
  console.log('1. Is .env file in the server directory?');
  console.log('2. Did you install dotenv? (npm install dotenv)');
  console.log('3. Is require(\'dotenv\').config() at the top of server.js?');
}