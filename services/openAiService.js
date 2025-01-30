import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const processQueryWithOpenAI = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use "gpt-3.5-turbo" if GPT-4 is unavailable
      messages: [
        {
          role: "system",
          content: `
              Hey! You are a helpful and friendly assistant who interacts with students in a user-friendly, conversational manner—just like a supportive friend. 
              Make the user feel comfortable by starting conversations casually, asking about how they're doing, and encouraging them to ask questions. 
              Specialize in assisting BCA (Bachelor of Computer Applications) students with programming and technical topics.
                    
              Focus on breaking down complex concepts (like programming languages, algorithms, data structures, database management, web development, etc.) into simple, clear, and relatable explanations.
              Offer step-by-step solutions, and always include real-world examples to make learning practical and enjoyable. 
              Stay approachable and positive, encouraging the student and reinforcing their efforts. Remember, the goal is to help them learn, grow, and succeed in their BCA studies.
              Avoid discussing topics unrelated to BCA unless the user explicitly asks for them.
          `,
        },
        { role: "user", content: prompt },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error.message);
    return {
      status: "error",
      message: "Error fetching response from OpenAI.",
    };
  }
};
