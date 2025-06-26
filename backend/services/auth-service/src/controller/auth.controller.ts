import bcrypt from "bcrypt";
import {db} from "../db";
import {roleTable} from "../db/schema";
import {generateToken} from "../utils/jwt";
import {Request, Response} from "express";
import {eq} from "drizzle-orm";

export function signUp() {
    return async (req: Request, res: Response) => {
        const {email, password, role} = req.body;
        const userTable = roleTable[role];
        // check if user already exists
        const existingUser = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
        if (existingUser && existingUser.length > 0) {
            res.status(400).json({message: "User already exists"});
            return;
        }
        const hashed = await bcrypt.hash(password, 10);
        try {
            const newUser = await db.insert(userTable).values({ email:email, password_hash: hashed}).returning();
            const token = generateToken( newUser[0].id, role, email);
            res.status(200).json({token});
        } catch (e) {
            res.status(500).json({message: "Error creating user", error: e});
        }
    }
}

export function signIn() {
    return async (req: Request, res: Response) => {
        const {email, password, role} = req.body;
        const userTable = roleTable[role];
        try {
            const user = await db.select(
                {
                    id: userTable.id,
                    email: userTable.email,
                    password_hash: userTable.password_hash
                }
            ).from(userTable).where(eq(userTable.email, email)).limit(1);
            if (!user || user.length === 0) {
                res.status(401).json({message: "Invalid email or password"});
                return;
            }
            const isValid = await bcrypt.compare(password, user[0].password_hash);
            if (!isValid) {
                res.status(401).json({message: "Invalid email or password"});
                return;
            }
            const token = generateToken( user[0].id, role, email);
            res.status(200).json({token});
        } catch (e) {
            res.status(500).json({message: "Error signing in", error: e});
        }
    }
}