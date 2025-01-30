import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const adminProtectRoute = async(req,res,next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) return res.status(401).json({error: "Unauthorized"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({_id:decoded.userId}).select("-password");
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Unexpected error: ", error.message);
    }
}

export default adminProtectRoute;