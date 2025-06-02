// Test Production Configuration Script
// Run with: node scripts/test-production-config.js

console.log('🔍 Testing Production Configuration...\n');

// Simulate environment variables that would be set in production
const testConfigs = [
  {
    name: 'Development (Local)',
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000/api'
    }
  },
  {
    name: 'Production (Railway + Vercel)',
    env: {
      VITE_API_BASE_URL: 'https://your-app-name.railway.app/api'
    }
  }
];

function getBackendUrl(env) {
  // Simulate the logic from src/services/api/client.ts
  const envUrl = env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api';
}

function getBackendBaseUrl(apiUrl) {
  return apiUrl.replace('/api', '');
}

testConfigs.forEach(config => {
  console.log(`📝 ${config.name}:`);
  const apiUrl = getBackendUrl(config.env);
  const baseUrl = getBackendBaseUrl(apiUrl);
  
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Health Check: ${baseUrl}/health`);
  console.log('');
});

console.log('✅ Configuration test complete!');
console.log('\n📋 Next Steps:');
console.log('1. Deploy your backend to Railway');
console.log('2. Update VITE_API_BASE_URL with your Railway URL');
console.log('3. Deploy frontend to Vercel with the environment variable');
console.log('4. Test the full production flow'); 