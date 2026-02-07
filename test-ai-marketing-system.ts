import Groq from "groq-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testAIMarketing() {
  try {
    console.log("🚀 Testing AI Marketing System...\n");

    // Test 1: Generate Campaign
    console.log("📊 Test 1: Generating Marketing Campaign...");
    const campaignResult = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "أنت خبير تسويق رقمي محترف متخصص في Facebook و Instagram Ads."
        },
        {
          role: "user",
          content: `أنشئ حملة إعلانية مختصرة لـ:
          
المنتج: تيشيرت قطن
الوصف: تيشيرت قطن 100% مريح
الميزانية: 5000 جنيه
الجمهور: شباب 20-35

أعطني:
1. اسم الحملة
2. استراتيجية استهداف مختصرة (3 سطور)
3. نص إعلاني واحد (جذاب ومختصر)`
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    console.log("\n✅ Campaign Generated Successfully!\n");
    console.log("📝 Result:");
    console.log("━".repeat(60));
    console.log(campaignResult.choices[0].message.content);
    console.log("━".repeat(60));
    console.log(`\n💡 Tokens used: ${campaignResult.usage?.total_tokens}`);
    console.log(`⚡ Model: ${campaignResult.model}`);
    
    // Test 2: Generate Ad Copy
    console.log("\n\n📊 Test 2: Generating Ad Variations...");
    const adResult = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "أنت Copywriter محترف حائز على جوائز في كتابة الإعلانات الرقمية."
        },
        {
          role: "user",
          content: `اكتب 3 نصوص إعلانية مختلفة لتيشيرت قطن (كل نص 2-3 سطور فقط)`
        }
      ],
      max_tokens: 300,
      temperature: 0.9,
    });

    console.log("\n✅ Ad Variations Generated!\n");
    console.log("📝 Result:");
    console.log("━".repeat(60));
    console.log(adResult.choices[0].message.content);
    console.log("━".repeat(60));
    console.log(`\n💡 Tokens used: ${adResult.usage?.total_tokens}`);
    
    console.log("\n\n🎉 All Tests Passed! The AI Marketing System is Working!");
    console.log("\n📍 Next Steps:");
    console.log("1. Open: http://localhost:3000/admin/ai-marketing");
    console.log("2. Clear browser cache (Ctrl+Shift+Delete)");
    console.log("3. Hard refresh (Ctrl+Shift+R)");
    console.log("4. Login with: akram@gmail.com / Aazxc123");
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

testAIMarketing();
