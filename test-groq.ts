import Groq from "groq-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  try {
    console.log("🧪 Testing Groq API...");
    console.log("✓ API Key exists:", !!process.env.GROQ_API_KEY);
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
      console.log("\n❌ Error: GROQ_API_KEY not set!");
      console.log("\n📝 Follow these steps:");
      console.log("1. Go to: https://console.groq.com/keys");
      console.log("2. Create a new API key");
      console.log("3. Copy it and paste in .env file:");
      console.log('   GROQ_API_KEY="gsk_your_key_here"');
      console.log("4. Run this test again");
      return;
    }
    
    console.log("✓ API Key starts with:", process.env.GROQ_API_KEY?.substring(0, 15) + "...");
    console.log("\n🚀 Sending test request...");
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "أنت مساعد تسويق محترف."
        },
        {
          role: "user",
          content: "اكتب جملة تسويقية قصيرة لمنتج ملابس"
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    console.log("\n✅ Success! Groq API is working!");
    console.log("\n📊 Model:", completion.model);
    console.log("⚡ Response:", completion.choices[0].message.content);
    console.log("\n💡 Tokens used:", completion.usage?.total_tokens);
    console.log("⏱️  Speed: ULTRA FAST! 🚀");
    
  } catch (error: any) {
    console.error("\n❌ Error:");
    console.error("Message:", error.message);
    if (error.status) {
      console.error("Status:", error.status);
    }
    if (error.response?.data) {
      console.error("Details:", error.response.data);
    }
    
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your API key in .env");
    console.log("2. Make sure it starts with 'gsk_'");
    console.log("3. Get a new key from: https://console.groq.com/keys");
  }
}

testGroq();
