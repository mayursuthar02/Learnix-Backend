import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("-password");

        if (!user) return res.status(404).json({ error: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.error("Unexpected error:", error.message);
        res.status(500).json({ error: "Invalid Token" });
    }
};

export default protectRoute;