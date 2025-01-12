import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';
import resourceModel from '../models/resourceModel.js';
import { processQueryWithGoogleAI } from '../services/aiService.js';
// import { extractContentFromFile } from "../helpers/fileProcessor.js";

// 1. Start
export const start = async (req, res) => {
  try {
    const {conversationId} = req.body;

    const message = "Hi there! How can I assist you today? Choose one of the options below, or feel free to ask me directly about any topic like 'What is JS?' or 'Explain variables.'";
    const options =  [
      {option: "Access Study Material 📚", apiRoute: "/get-semster/ACCESS_STUDY_MATERIAL"},
      {option: "Check Exam Dates 🗓️", apiRoute: "/get-semster/CHECK_EXAM_DATES"},
      {option: "View Time Table 🕒", apiRoute: "/get-semster/VIEW_TIME_TABLE"},
      {option: "Ask Scholara... 💡", apiRoute: "/"},
    ];

    let conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation  = new conversationModel({
        userId: req.user._id,
        title: "New Conversation"
      });
      await conversation.save();
    }
      
    // Create and store a new message associated with the conversation
    const newMessage = new messageModel({
      conversationId: conversation._id,
      sender: "scholara",
      botResponse: {
        message,
        options
      }
    });
    await newMessage.save();
    res.status(200).json({status: "success", newMessage});
    
  } catch (error) {
    res.status(500).json({status: "error", error });
  }
};


// 2. Get Semester
export const getSemester = async(req, res) => {
  try {
    const {option} = req.params;
    const { conversationId } = req.body;

    if (!option) {
      return res.status(400).json({status: "fail", error: "Please select the option!"});
    }
    if (!conversationId) {
      return res.status(400).json({ status: "fail", error: "conversationId is required!" });
    }
    
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(400).json({status: "fail", error: "Conversation not found!"});
    }
    conversation.title = option || conversation.title; 
    await conversation.save();
 
    const message = "Awesome! Could you tell me which semester you're in? Choose from the options below.";
    const options = Array.from({ length: 6 }, (_, i) => {
      const semester = `semester ${i + 1}`;
      return {
        option: semester,
        apiRoute: `/get-subject/${option}/${semester}`,
      };
    });
      
    // Create and store a new message associated with the conversation
    const newMessage = new messageModel({
      conversationId: conversation._id,
      sender: "scholara",
      botResponse: {
        message,
        options
      }
    });
    await newMessage.save();
    res.status(200).json({status: "success", newMessage});

  } catch (error) {
    res.status(500).json({status: "error", error });
  }
}


// 3. Get Subject
export const getSubject = async(req, res) => {
  try {
    const {option, semester} = req.params;
    const { conversationId } = req.body;

    if (!option || !semester) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide both option and semester!",
      });
    }
    if (!conversationId) {
      return res.status(400).json({
        status: "fail",
        error: "conversationId is required!",
      });
    }

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(400).json({status: "fail", error: "Conversation not found!"});
    }
    conversation.title = semester || conversation.title; 
    await conversation.save();

    const subjects = await resourceModel.distinct("subject", { semester });

    let message, options;
    
    if (subjects.length === 0) {
       // No subjects found for the given semester
      message = `No subjects found for ${semester}. Would you like to explore other semesters?`;
      options = Array.from({ length: 6 }, (_, i) => {
        const sem = `semester ${i + 1}`;
        return {
          option: sem,
          apiRoute: `/get-subject/${option}/${sem}`,
        };
      });
    } else {
      // Subjects found for the given semester
      message = `Here are the subjects for ${semester}. Select a subject to get study materials:`;
      options = subjects.map((subject) => ({
        option: subject,
        apiRoute: `/get-materials/${option}/${semester}/${subject}`,
      }));
    }

    // Store response as a bot message
    const newMessage = new messageModel({
      conversationId,
      sender: "scholara",
      botResponse: {
        message,
        options,
      },
    }); 
    await newMessage.save();
    res.status(200).json({status: "success", newMessage});
    
  } catch (error) {
    console.log(error)
    res.status(500).json({status: "error", error });
  }
}


// 3. Get Material
export const getMaterials = async(req, res) => {
  try {
    const {option, semester, subject} = req.params;
    const { conversationId } = req.body;

    // Input validation
    if (!option || !semester || !subject) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide option, semester, and subject!",
      });
    }
    if (!conversationId) {
      return res.status(400).json({
        status: "fail",
        error: "conversationId is required!",
      });
    }

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(400).json({status: "fail", error: "Conversation not found!"});
    }
    conversation.title = subject || conversation.title; 
    await conversation.save();

    // Fetch materials for the given semester and subject
    const materials = await resourceModel.find({ semester, subject }).populate("userId");

    let message, options, botResponse;
    
    if (materials.length === 0) {
      // No resources found
      message = `Sorry, we couldn't find any resources for '${subject}' in '${semester}'. Please check back later or explore other subjects!`;

      const subjects = await resourceModel.distinct("subject", { semester });
      options = subjects.map((subj) => ({
        option: subj,
        apiRoute: `/get-materials/${option}/${semester}/${subj}`,
      }));

      botResponse = { message, options };
    
    } else {
      // Resource Found
      message = `Great choice! Here's the resource link for '${subject}' in ${semester}:`;
      
      const resources = materials.map(material => ({
        title: material.title,
        subject: material.subject,
        semester: material.semester,
        resourceLink: material.resourceLink,
        note: material.note,
        author: material.userId.fullName
      }));

      const note = "Let us know if you need resources for other subjects or semesters!";

      const subjects = await resourceModel.distinct("subject", { semester });
      options = subjects.map((subj) => ({
        option: subj,
        apiRoute: `/get-materials/${option}/${semester}/${subj}`,
      }));

      botResponse = { message, resources, note, options };
    }
    
    // Save bot response
    const newMessage = new messageModel({
      conversationId,
      sender: "scholara",
      botResponse
    });
    await newMessage.save();
    
    res.status(200).json({status: "success", newMessage});
    
  } catch (error) {
    console.error("Error in getMaterials function:", error);
    res.status(500).json({status: "error", error });
  }
}



// Scholora Logic
export const activateScholara = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;
    const file = req.file; // Handle file uploaded via multer

    if (!prompt && !file) {
      return res
        .status(400)
        .json({ status: "fail", error: "Either prompt or file is required!" });
    }

    if (!conversationId) {
      return res
        .status(400)
        .json({ status: "fail", error: "conversationId not found" });
    }

    const conversation = await conversationModel.findById(conversationId);
    conversation.title = prompt || conversation.title;
    await conversation.save();

    let fileContent = "";
    if (file) {
      fileContent = await extractContentFromFile(file); // Extract content
    }

    const combinedPrompt = `${prompt || ""}\n\nFile Content:\n${fileContent}`;

    const aiResponse = await processQueryWithGoogleAI(combinedPrompt);

    const newMessage = new messageModel({
      conversationId,
      sender: "ai",
      aiResponse,
    });
    await newMessage.save();

    res.status(200).json({ status: "success", newMessage });
  } catch (error) {
    console.error("Error in activateScholara:", error.message);
    res.status(500).json({ status: "error", error: error.message });
  }
};