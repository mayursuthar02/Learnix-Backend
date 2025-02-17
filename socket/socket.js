import { Server } from "socket.io";
import userMessageModel from "../models/UserMessageModel.js";
import UserConversation from "../models/UserConversationModel.js";

// Function to initialize Socket.IO
export const initializeSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow frontend origins
      methods: ["GET", "POST"],
      // credentials: true,
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left conversation: ${conversationId}`);
    });

      // Listen for typing event
      socket.on("typing", ({userName, userId, profilePic, conversationId}) => {
        io.to(conversationId).emit("typing", {userName, userId, profilePic});
      });
    
      // Listen for stop typing event
      socket.on("stop_typing", (conversationId) => {
        io.to(conversationId).emit("stop_typing");
      });

    // Listen for chat messages
    socket.on('newMessage', async(message) => {
      console.log('Message received:', message._id);

      // Fetch the conversation and populate the required fields
    const populatedConversation = await UserConversation.findById(message.conversationId._id)
      .populate("members", "-password -resources")
      .populate("groupAdmin", "-password -resources")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "fullName profilePic",
        },
      });

    if (!populatedConversation) {
      console.error("Conversation not found for message:", message._id);
      return;
    }
      
      
    io.to(message.conversationId._id).emit("receiveMessage", {
      msg: message, // The message object
      conversation: populatedConversation, // The populated conversation
    });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
};
