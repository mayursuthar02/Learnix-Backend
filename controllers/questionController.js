import questionModel from "../models/questionModel.js";
import userModel from "../models/userModel.js";

export const askAQuestion = async (req, res) => {
  try {
    const { question, professorId } = req.body;
    if (!question || !professorId) {
      return res.status(422).json({
        status: "fail",
        error: "Both 'question' and 'professorId' fields are required.",
      });
    }

    // Verify Professor
    const professor = await userModel.findById(professorId);
    if (!professor || professor.profileType !== "professor") {
      return res.status(404).json({
        status: "fail",
        error: "Valid professor not found.",
      });
    }

    const newQuestion = await questionModel.create({
      studentId: req.user._id,
      title: question,
      professorId,
    });

    res.status(201).json({
      status: "success",
      message: "Question sent successfully.",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error sending question:", error);
    res.status(500).json({
      status: "error",
      error: "Something went wrong. Please try again later.",
    });
  }
};

export const getProfessorQuestions = async (req, res) => {
  try {
    const questions = await questionModel
    .find({ professorId: req.user._id })
    .populate("studentId", "fullName profilePic")
    .sort({ createdAt: -1 });

    // Send success response
    res.status(200).json({
      status: "success",
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    console.error("Error fetching professor questions:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error fetching professor questions",
      error: error.message,
    });
  }
};

export const replyQuestion = async (req, res) => {
  try {
    const { reply } = req.body; 
    const { questionId } = req.params;

    if (!reply || !questionId) {
      return res.status(400).json({
        status: "fail",
        message: "Reply and question ID are required",
      });
    }

    const question = await questionModel.findById(questionId);

    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    question.reply = reply;
    question.status = "answered";
    await question.save();

    return res.status(200).json({
      status: "success",
      message: "Replying successfully",
      question,
    });
  } catch (error) {
    console.error("Error replying to question:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Error replying to question",
      error: error.message,
    });
  }
};

export const getUserReplies = async (req, res) => {
  try {
    const questions = await questionModel
    .find({ studentId: req.user._id })
    .populate("professorId studentId", "fullName profilePic")
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: "success",
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    console.error("Error fetching student questions:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error fetching student questions",
      error: error.message,
    });
  }
};
