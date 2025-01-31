import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Google API Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Initialize GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Create a generative model instance using a specific model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Check if a query relates to IT
 * @param {string} query - The user's query
 * @returns {boolean} - True if query is IT-related, false otherwise
 */
// const isITRelated = (query) => {
//   const itKeywords = [
//     'Hello',
//     'programming',
//     'development',
//     'software',
//     'database',
//     'framework',
//     'coding',
//     'algorithm',
//     'system design',
//     'backend',
//     'frontend',
//     'technology',
//   ];
//   return itKeywords.some((keyword) => query.toLowerCase().includes(keyword));
// };

/**
 * Handle queries with Google Generative AI
 * @param {string} prompt - The user's query
 * @returns {object} - The response from Google Generative AI or a custom response for invalid queries
 */
export const processQueryWithGoogleAI = async (prompt) => {
  // if (!isITRelated(prompt)) {
  //   return {
  //     status: 'fail',
  //     message: 'Ask only IT-related questions.',
  //   };
  // }

  try {
    // Generate the response from the generative model
    const result = await model.generateContent(prompt);
    
    // Return the text generated by the AI model
    return result.response.text();

  } catch (error) {
    console.error('Error communicating with Google Generative AI API:', error.message);
    return {
      status: 'error',
      message: 'Error fetching response from Google Generative AI.',
    };
  }
};

