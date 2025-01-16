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
