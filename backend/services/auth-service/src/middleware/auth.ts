import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import {db} from "../db";
import {eq} from "drizzle-orm";
import {roleTable} from "../db/schema";

export function authMiddleware(requiredRoles: string[] = []) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const role = requiredRoles[0]
        const token = req.headers["x-access-token"] || req.headers["authorization"];
        if (!token) {
            res.status(403).json({ message: "No token provided!" });
            return;
        }
        const actualToken = token.toString().startsWith("Bearer ")
            ? token.slice(7, token.length).toString()
            : token.toString();
        try{
            const decodedToken = verifyToken(actualToken)
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
