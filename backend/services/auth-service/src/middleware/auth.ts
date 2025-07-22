import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import {db} from "../db";
import {eq} from "drizzle-orm";
import {roleTable} from "../db/schema";

export function authMiddleware(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies['auth_token'];
        if (!token) {
            res.status(403).json({ message: "No token provided!" });
            return;
        }
        try{
            const decodedToken = verifyToken(token)
            if (decodedToken.role != role) {
                res.status(403).json({ message: "Unauthorized" });
                return;
            }
            const userTable = roleTable[role]
            const user = await db.select().from(userTable).where(eq(userTable.email, decodedToken.email));
            if(!user){
                res.status(403).json({ message: "Unauthorized" });
                return;
            }
            // Attach user information to the request object
            req.body = {
                email: decodedToken.email,
                role: decodedToken.role,
                userId: Number(user[0].id)
            };
            next()
        } catch (error){
            res.status(403).json({})
        }
    };
}

export function checkSignRequest (){
    return (req: Request, res: Response, next: NextFunction) => {
    // Validate required fields
    if (!req.body.email || !req.body.password || !req.body.role) {
        res.status(400).json({ message: "All fields are required!" });
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        res.status(400).json({ message: "Invalid email format!" });
        return;
    }

    // Validate user type
    const allowedUserRoles = ["client", "driver", "restaurant"];
    if (!allowedUserRoles.includes(req.body.role)) {
        res.status(400).json({ message: "Bad request" });
        return;
    }

    next();
    }
}
