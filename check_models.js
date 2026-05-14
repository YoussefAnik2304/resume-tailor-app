const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
if (!keyMatch) {
  console.error("API Key not found in .env.local");
  process.exit(1);
}
const key = keyMatch[1].trim();

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS FOR GENERATECONTENT:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.error(data);
    }
  })
  .catch(console.error);
