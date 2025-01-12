import fs from "fs";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js"; // For OCR (image content)

export const extractContentFromFile = async (file) => {
  const filePath = file.path;
  const fileType = file.mimetype;

  try {
    switch (fileType) {
      case "application/pdf": {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text; // Extracted PDF content
      }
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/webp": {
        // OCR to extract text from images
        const worker = createWorker();
        await worker.load();
        await worker.loadLanguage("eng"); // Adjust the language as needed
        await worker.initialize("eng");
        const { data: { text } } = await worker.recognize(filePath);
        await worker.terminate();
        return text; // Extracted text from image
      }
      default:
        throw new Error("Unsupported file type for content extraction.");
    }
  } catch (error) {
    console.error("Error extracting content from file:", error.message);
    throw error;
  }
};
