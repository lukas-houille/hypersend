import db from "../models/index.js";

const verifySignUp = async function (req, res, next) {
    const userType = req.body.type;
    // check user type
    const UserModel = db.mymodels[userType];
    if (!UserModel) {
        return res.status(500).json({ message: "Invalid user type!" });
    }
    // Check if user already exists selecting only email
    const existingUser = await UserModel.findOne({
        where: { email: req.body.email },
    });
    if (existingUser) {
        return res.status(400).json({ message: "email already exists!" });
    }
    next();
}

export default verifySignUp;