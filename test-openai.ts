import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API...");
    console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("API Key starts with:", process.env.OPENAI_API_KEY?.substring(0, 20));
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say hello in Arabic"
        }
      ],
      max_tokens: 50,
    });

    console.log("\n✅ Success!");
    console.log("Response:", completion.choices[0].message.content);
  } catch (error: any) {
    console.error("\n❌ Error:");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Type:", error.type);
    console.error("Code:", error.code);
  }
}

testOpenAI();
