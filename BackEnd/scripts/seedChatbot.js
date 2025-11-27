#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runSeed() {
  try {
    console.log('🌱 Starting chatbot places seeding...\n');
    
    // Run the seed script
    const { stdout, stderr } = await execAsync('node seeds/chatbotPlaces.js');
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('Seeding warnings/errors:', stderr);
    }
    
    console.log('\n✅ Chatbot places seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Start your frontend server: npm run dev');
    console.log('3. Visit your website and look for the chatbot button in the bottom-right corner');
    console.log('4. Test the chatbot by asking about nearby places!');
    
  } catch (error) {
    console.error('❌ Error running seed script:', error.message);
    process.exit(1);
  }
}

runSeed();
