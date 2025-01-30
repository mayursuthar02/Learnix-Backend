import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';
import resourceModel from '../models/resourceModel.js';
import examDetailsResourceModel from '../models/examDetailsModel.js';
import timeTableModel from '../models/timeTableModel.js';
import previousPapersResourceModel from '../models/previousPaperModel.js';
import { processQueryWithGoogleAI } from '../services/aiService.js';
import { processQueryWithOpenAI } from '../services/openAiService.js';

import { ElevenLabsClient, stream } from "elevenlabs";
import { Readable } from "stream";

const client = new ElevenLabsClient({
  apiKey: "sk_fe6faf62d8e01ac46cb3adb212d53cfbaacf536346c316b0",
});

// 1. Start
export const start = async (req, res) => {
  try {
    const {conversationId} = req.body;

    let message = "Hi there! How can I assist you today? Choose one of the options below, or feel free to ask me directly about any topic like 'What is JS?' or 'Explain variables.'";
    message = await processQueryWithOpenAI(`${message} make it better say select option. make it short like 2-3 line`)
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
        title: message
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
      message = await processQueryWithOpenAI(`${message} make it better say select option. make it short like 2-3 line`)
    } else if (option === "CHECK_EXAM_DETAILS") {
      message = "Awesome! Let’s get started with your exam details. Please tell me your semester by choosing from the options below.";
      message = await processQueryWithOpenAI(`${message} make it better say select option. make it short like 2-3 line`)
    } else if (option === "VIEW_TIME_TABLE") {
      message = "Fantastic! To fetch your semester's timetable, please select your semester from the options below.";
      message = await processQueryWithOpenAI(`${message} make it better say select option. make it short like 2-3 line`)
    } else if (option === "ACCESS_PREVIOUS_PAPERS") {
      message = "Perfect! To find previous exam papers, could you let me know your semester? Choose from the options below.";
      message = await processQueryWithOpenAI(`${message} make it better say select option. make it short like 2-3 line`)
    }
    
    const options = Array.from({ length: 6 }, (_, i) => {
      const semester = `semester ${i + 1}`;
      return {
        option: semester,
        apiRoute: `/student-data-Selector/${option}/${semester}`, // Ensure route consistency
      };
    });

    conversation.title = message;
    await conversation.save();
      
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
        message = await processQueryWithOpenAI(`${message} make it better. All you have to do is say that select the options given below, you do not have to give any option as per your choice.. make it short like 2-3 line`)
        options = Array.from({ length: 6 }, (_, i) => {
          const sem = `semester ${i + 1}`;
          return {
            option: sem,
            apiRoute: `/student-data-Selector/${option}/${sem}`,
          };
        });
      } else {
        // Subjects found for the given semester
        message = `Tell the user to select one of the given options for ${semester} study materials, but do not include any specific options in your response. 
        Your reply should be short, simple, and restricted to 2-3 lines.`;
        message = await processQueryWithOpenAI(message);
        
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
        message = await processQueryWithOpenAI(`${message} make it better. All you have to do is say that select the options given below, you do not have to give any option as per your choice.. make it short like 2-3 line`)
        options = Array.from({ length: 6 }, (_, i) => {
          const semester = `semester ${i + 1}`;
          return {
            option: semester,
            apiRoute: `/student-data-Selector/${option}/${semester}`,
          };
        });
      } else {
        message = `Tell the user to select one of the options below for the available exam types in ${semester}, but do not include or mention any specific options yourself. Your response should be concise, limited to 2-3 lines. `;
        message = await processQueryWithOpenAI(message);        
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
        message = await processQueryWithOpenAI(`${message} make it better. All you have to do is say that select the options given below, you do not have to give any option as per your choice.. make it short like 2-3 line`)
        options = Array.from({ length: 6 }, (_, i) => {
          const semester = `semester ${i + 1}`;
          return {
            option: semester,
            apiRoute: `/student-data-Selector/${option}/${semester}`,
          };
        });
      } else {
        message = "Please select your division to view the timetable:";
        message = await processQueryWithOpenAI(`${message} make it better. All you have to do is say that select the options given below, you do not have to give any option as per your choice.. make it short like 2-3 line`)
        options = divisions.map((division) => ({
          option: division,
          apiRoute: `/get-resources/${option}/${semester}/${division}`,
        }));
      }
    } 
    else if (option === "ACCESS_PREVIOUS_PAPERS") {
      const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
      if (examTypes.length === 0) {
        message = `We couldn't find any previous papers for ${semester}. Make this message polite, concise, and user-friendly. Emphasize retrying with another semester. Do not add or suggest any options. Keep it 2-3 lines.`;
        message = await processQueryWithOpenAI(message);
        
        options = Array.from({ length: 6 }, (_, i) => {
          const sem = `Semester ${i + 1}`;
          return {
            option: sem,
            apiRoute: `/student-data-Selector/${option}/${sem}`,
          };
        });
      } else {
        message = "Select the exam type for which you need previous papers:";
        message = await processQueryWithOpenAI(`${message} make it better. All you have to do is say that select the options given below, you do not have to give any option as per your choice.. make it short like 2-3 line`)
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
    
    conversation.title = message;
    await conversation.save();

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
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(400).json({status: "fail", error: "Conversation not found!"});
    }


    let message, options, botResponse;

    if (option === "ACCESS_STUDY_MATERIAL") {
      // Fetch materials for the given semester and subject
      const materials = await resourceModel.find({ semester, subject: studentDataSelector }).populate("userId");
      
      if (materials.length === 0) {
        // No resources found
        message = `Unfortunately, we couldn't find study materials for "${studentDataSelector}" in "${semester}". Make this message polite, concise, and user-friendly. Do not include suggestions or options. Keep it 2-3 lines.`;
        message = await processQueryWithOpenAI(message);
        
  
        const subjects = await resourceModel.distinct("subject", { semester });
        options = subjects.map((subj) => ({
          option: subj,
          apiRoute: `/get-resources/${option}/${semester}/${subj}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Here are some valuable resources for "${studentDataSelector}" in ${semester}. Make this message polite and concise, and ensure it encourages the user to click the provided links for access. Keep it 2-3 lines.`;
        message = await processQueryWithOpenAI(message);
        
        
        const resources = materials.map(material => ({
          title: material.title,
          subject: material.subject,
          semester: material.semester,
          resourceLink: material.resourceLink,
          note: material.note,
          author: material.userId.fullName,
          authorProfilePic: material.userId.profilePic
        }));
  
        let note = await processQueryWithOpenAI(`
          Generate a friendly, short message asking users to feel free to ask for resources for other subjects in the current semester. Mention that the subject and semester info will be dynamic and taken from user input. Keep it 1 half line.`);        
  
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
        message = `We couldn't locate detailed information for "${studentDataSelector}" in "${semester}". Would you like to explore other exam types? Keep it 1 half line.`;
        message = await processQueryWithOpenAI(message);
  
        const examTypes = await examDetailsResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = await processQueryWithOpenAI(`
          Generate a friendly, personalized message confirming the user's choice of subject ('${studentDataSelector}') and semester ('${semester}'). 
          The message should include an exam details link and sound welcoming, like: "Great choice! Here's the exam details link for 'subject' in 'semester'. keep it short 1-2 lines."
        `);
        
        const resources = materials.map(material => ({
          title: material.title,
          examType: material.examType,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName,
          authorProfilePic: material.userId.profilePic
        }));
  
        let note = `If you need more details about other exams for ${semester}, feel free to ask! Keep it 1 half line.`;
        note = await processQueryWithOpenAI(note);
  
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
        message = `We couldn't found time table for "${studentDataSelector}" in "${semester}". Would you like to explore other divisions? Keep it 1 half line.`;
        message = await processQueryWithOpenAI(message);
  
        const divisions = await timeTableModel.distinct("division", { semester });
        options = divisions.map((division) => ({
          option: division,
          apiRoute: `/get-resources/${option}/${semester}/${division}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Great choice! Here's the time table link for '${studentDataSelector}' in ${semester}. Keep it 1 half line.`;
        message = await processQueryWithOpenAI(message);
        
        const resources = materials.map(material => ({
          title: material.title,
          division: material.division,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName,
          authorProfilePic: material.userId.profilePic
        }));
  
        let note = `If you need other division title table for ${semester}, feel free to ask! Keep it 1 half line.`;
        note = await processQueryWithOpenAI(note);
  
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
        message = await processQueryWithOpenAI(message);
  
        const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, options };
      
      } else {
        // Resource Found
        message = `Great choice! Here's the previous papers link for '${studentDataSelector}' in ${semester}.`;

        const resources = materials.map(material => ({
          title: material.title,
          examType: material.examType,
          semester: material.semester,
          resourceLink: material.resourceLink,
          description: material.description,
          author: material.userId.fullName,
          authorProfilePic: material.userId.profilePic
        }));
  
        let note = `If you need papers for other exams for ${semester}, feel free to ask! Keep it 1 half line.`;
        note = await processQueryWithOpenAI(note);
        const examTypes = await previousPapersResourceModel.distinct("examType", { semester });
        options = examTypes.map((examType) => ({
          option: examType,
          apiRoute: `/get-resources/${option}/${semester}/${examType}`,
        }));
  
        botResponse = { message, resources, note, options };  
      }
    }

    conversation.title = message;
    await conversation.save();
    
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

    let conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation  = new conversationModel({
        userId: req.user._id,
        title: prompt
      });
      await conversation.save();
    }
    
    conversation.title = prompt || conversation.title;
    await conversation.save();


    // const response = await processQueryWithGoogleAI(prompt);
    const response = await processQueryWithOpenAI(prompt);


    const newMessage = new messageModel({
      conversationId : conversation._id,
      sender: "ai",
      aiResponse: response
    })
    await newMessage.save();
    
    res.status(200).json({status: "success", newMessage});
    
  } catch (error) {
    res.status(500).json({status: "error", error});
  }
}


export const textToSpeech = async (req, res) => {
  const { text } = req.body;
  try {
    const audioStream = await client.textToSpeech.convertAsStream("Xb7hH8MSUJpSbSDYk0k2", {
      text: text, 
      model_id: "eleven_multilingual_v2", 
      voice: "Alice" // Use the desired voice
    });

    // Stream audio back
    res.setHeader('Content-Type', 'audio/mpeg');
    audioStream.pipe(res); // Directly pipe the audio stream to the response
  } catch (error) {
    console.error("Error with ElevenLabs API:", error);
    res.status(500).send('Error generating speech');
  }
};


