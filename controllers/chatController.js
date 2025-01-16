import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';
import resourceModel from '../models/resourceModel.js';
import examDetailsResourceModel from '../models/examDetailsModel.js';
import timeTableModel from '../models/timeTableModel.js';
import previousPapersResourceModel from '../models/previousPaperModel.js';
import { processQueryWithGoogleAI } from '../services/aiService.js';

// 1. Start
export const start = async (req, res) => {
  try {
    const {conversationId} = req.body;

    const message = "Hi there! How can I assist you today? Choose one of the options below, or feel free to ask me directly about any topic like 'What is JS?' or 'Explain variables.'";
    const options =  [
      {option: "Access Study Materials 📚", apiRoute: "/get-semster/ACCESS_STUDY_MATERIAL"},
      {option: "Check Exam Details 🗓️", apiRoute: "/get-semster/CHECK_EXAM_DETAILS"},
      {option: "View Time Table 🕒", apiRoute: "/get-semster/VIEW_TIME_TABLE"},
      {option: "Access Previous Papers 📃", apiRoute: "/get-semster/ACCESS_PREVIOUS_PAPERS"},
      {option: "Ask Learnix... 💡", apiRoute: "/"},
    ];

    let conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation  = new conversationModel({
        userId: req.user._id,
        title: "Hello!"
      });
      await conversation.save();
    }
      
    // Create and store a new message associated with the conversation
    const newMessage = new messageModel({
      conversationId: conversation._id,
      sender: "learnix",
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
    
    let message = "";

    if (option === "ACCESS_STUDY_MATERIAL") {
      message = "Great! To help you access the study materials, please let me know your semester. Select from the options below.";
    } else if (option === "CHECK_EXAM_DETAILS") {
      message = "Awesome! Let’s get started with your exam details. Please tell me your semester by choosing from the options below.";
    } else if (option === "VIEW_TIME_TABLE") {
      message = "Fantastic! To fetch your semester's timetable, please select your semester from the options below.";
    } else if (option === "ACCESS_PREVIOUS_PAPERS") {
      message = "Perfect! To find previous exam papers, could you let me know your semester? Choose from the options below.";
    }
    
    const options = Array.from({ length: 6 }, (_, i) => {
      const semester = `semester ${i + 1}`;
      return {
        option: semester,
        apiRoute: `/student-data-Selector/${option}/${semester}`,
      };
    });
      
    // Create and store a new message associated with the conversation
    const newMessage = new messageModel({
      conversationId: conversation._id,
      sender: "learnix",
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
export const studentDataSelector = async(req, res) => {
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

    let message = "", options = [];
    
    if (option === "ACCESS_STUDY_MATERIAL") {
      const subjects = await resourceModel.distinct("subject", { semester });
    
      if (subjects.length === 0) {
        // No subjects found for the given semester
        message = `We couldn't find any subjects for ${semester}. Would you like to explore other semesters?`;
        options = Array.from({ length: 6 }, (_, i) => {
          const sem = `semester ${i + 1}`;
          return {
            option: sem,
            apiRoute: `/get-subject/${option}/${sem}`,
          };
        });
      } else {
        // Subjects found for the given semester
        message = `Here are the subjects available for ${semester}. Please select one to get the study materials:`;
        options = subjects.map((subject) => ({
          option: subject,
          apiRoute: `/get-resources/${option}/${semester}/${subject}`,
        }));
      }
    } 
    else if (option === "CHECK_EXAM_DETAILS") {
      const examTypes = await examDetailsResourceModel.distinct("examType", { semester });
      if (examTypes.length === 0) {
        message = `We couldn't find any exam types for ${semester}. Please check other semesters.`;
        options = Array.from({ length: 6 }, (_, i) => {
          const semester = `semester ${i + 1}`;
          return {
            option: semester,
            apiRoute: `/student-data-Selector/${option}/${semester}`,
          };
        });
      } else {
        message = `Here are the available exam types for your ${semester}. Select one to get detailed information:`;
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
      }
    } 
    else if (option === "VIEW_TIME_TABLE") {
      const divisions = await timeTableModel.distinct("division", { semester });
      if (divisions.length === 0) {
        message = `No divisions found for ${semester}. Try selecting a different semester.`;
        options = Array.from({ length: 6 }, (_, i) => {
          const semester = `semester ${i + 1}`;
          return {
            option: semester,
            apiRoute: `/student-data-Selector/${option}/${semester}`,
          };
        });
      } else {
        message = "Please select your division to view the timetable:";
        options = divisions.map((division) => ({
          option: division,
          apiRoute: `/get-resources/${option}/${semester}/${division}`,
        }));
      }
    } 
    else if (option === "ACCESS_PREVIOUS_PAPERS") {
      const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
      console.log(examTypes);
      if (examTypes.length === 0) {
        message = `We couldn't find any previous papers for ${semester}. Please try another semester.`;
        options = Array.from({ length: 6 }, (_, i) => {
          const sem = `Semester ${i + 1}`;
          return {
            option: sem,
            apiRoute: `/student-data-Selector/${option}/${sem}`,
          };
        });
      } else {
        message = "Select the exam type for which you need previous papers:";
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
      }
    }
    else {
      // Handle any other unexpected options or default behavior
      message = "Invalid option selected.";
      options = [];
    }
    

    // Create and store a new message associated with the conversation
    const newMessage = new messageModel({
      conversationId: conversation._id,
      sender: "learnix",
      botResponse: {
        message,
        options
      }
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
    const {option, semester, studentDataSelector} = req.params;
    const { conversationId } = req.body;

    // Input validation
    if (!option || !semester || !studentDataSelector) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide option, semester, and studentDataSelector!",
      });
    }
    if (!conversationId) {
      return res.status(400).json({
        status: "fail",
        error: "conversationId is required!",
      });
    }


    let message, options, botResponse;

    if (option === "ACCESS_STUDY_MATERIAL") {
      // Fetch materials for the given semester and subject
      const materials = await resourceModel.find({ semester, subject: studentDataSelector }).populate("userId");
      
      if (materials.length === 0) {
        // No resources found
        message = `Unfortunately, we couldn't find study materials for "${studentDataSelector}" in "${semester}". Would you like to explore materials for other subjects?`;
  
        const subjects = await resourceModel.distinct("subject", { semester });
        options = subjects.map((subj) => ({
          option: subj,
          apiRoute: `/get-resources/${option}/${semester}/${subj}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Here are some valuable resources for "${studentDataSelector}" in ${semester}. Click the links below to access them:`;
        
        const resources = materials.map(material => ({
          title: material.title,
          subject: material.subject,
          semester: material.semester,
          resourceLink: material.resourceLink,
          note: material.note,
          author: material.userId.fullName
        }));
  
        const note = `Let us know if you need resources for other subjects in ${semester}`;
  
        const subjects = await resourceModel.distinct("subject", { semester });
        options = subjects.map((subj) => ({
          option: subj,
          apiRoute: `/get-resources/${option}/${semester}/${subj}`,
        }));
  
        botResponse = { message, resources, note, options };
      }
      
    } 
    else if (option === "CHECK_EXAM_DETAILS") {
      // Fetch materials for the given semester and subject
      const materials = await examDetailsResourceModel.find({ semester, examType: studentDataSelector }).populate("userId");
      
      if (materials.length === 0) {
        // No resources found
        message = `We couldn't locate detailed information for "${studentDataSelector}" in "${semester}". Would you like to explore other exam types?`;
  
        const examTypes = await examDetailsResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Great choice! Here's the exam details link for '${studentDataSelector}' in ${semester}:`;
        
        const resources = materials.map(material => ({
          title: material.title,
          examType: material.examType,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName
        }));
  
        const note = `If you need more details about other exams for ${semester}, feel free to ask!`;
  
        const examTypes = await examDetailsResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, resources, note, options };
      }
    } 
    else if (option === "VIEW_TIME_TABLE") {
      // Fetch materials for the given semester and subject
      const materials = await timeTableModel.find({ semester, division: studentDataSelector }).populate("userId");
      
      if (materials.length === 0) {
        // No resources found
        message = `We couldn't found time table for "${studentDataSelector}" in "${semester}". Would you like to explore other divisions?`;
  
        const divisions = await timeTableModel.distinct("division", { semester });
        options = divisions.map((division) => ({
          option: division,
          apiRoute: `/get-resources/${option}/${semester}/${division}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Great choice! Here's the time table link for '${studentDataSelector}' in ${semester}:`;
        
        const resources = materials.map(material => ({
          title: material.title,
          division: material.division,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName
        }));
  
        const note = `If you need other division title table for ${semester}, feel free to ask!`;
  
        const divisions = await timeTableModel.distinct("division", { semester });
        options = divisions.map((division) => ({
          option: division,
          apiRoute: `/get-resources/${option}/${semester}/${division}`,
        }));
  
        botResponse = { message, resources, note, options };
      }
    }    
    else if (option === "ACCESS_PREVIOUS_PAPERS") {
      // Fetch materials for the given semester and subject
      const materials = await previousPapersResourceModel.find({ semester, examType: studentDataSelector }).populate("userId");
      
      if (materials.length === 0) {
        // No resources found
        message = `We couldn't find examtype for "${studentDataSelector}" in "${semester}". Would you like to explore other exam types?`;
  
        const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Great choice! Here's the previous papers link for '${studentDataSelector}' in ${semester}:`;
        
        const resources = materials.map(material => ({
          title: material.title,
          examType: material.examType,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName
        }));
  
        const note = `If you need papers for other exams for ${semester}, feel free to ask!`;
  
        const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, resources, note, options };  
      }
    }
    // Save bot response
    const newMessage = new messageModel({
      conversationId,
      sender: "learnix",
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
export const activateScholara = async(req, res) => {
  try {
    const {prompt, conversationId} = req.body;
    if (!prompt) {
      return res.status(400).json({status: "fail", error: "Prompt is required!"});
    }
    if (!conversationId) {
      return res.status(400).json({status: "fail", error: "conversationId not found"});
    }

    const response = await processQueryWithGoogleAI(prompt);

    const newMessage = new messageModel({
      conversationId,
      sender: "ai",
      aiResponse: response
    })
    await newMessage.save();
    
    res.status(200).json({status: "success", newMessage});
    
  } catch (error) {
    res.status(500).json({status: "error", error});
  }
}