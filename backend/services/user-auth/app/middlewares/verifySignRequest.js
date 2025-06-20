import db from "../models/index.js";
const verifySignRequest = async function (req, res, next) {
    // validate fields
    if (!req.body.email || !req.body.password || !req.body.type) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "Invalid email format!" });
    }
    // Validate user type and format
    if (!req.body.type || typeof req.body.type !== "string") {
        return res.status(400).json({ message: "Invalid user type!" });
    }
    // Whitelist allowed user types for security
    const allowedUserTypes = ["client", "driver", "restaurant"];
    if (!allowedUserTypes.includes(req.body.type)) {
        return res.status(400).json({ message: "Invalid user type!" });
    }
    // check user type
    const UserModel = db.mymodels[req.body.type];
    if (!UserModel) {
        return res.status(400).json({ message: "Invalid user type!" });
    }
    next();
}

export default verifySignRequest;