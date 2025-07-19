import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY!;

export function generateToken( id: number, role: string, email: string) {
    return jwt.sign({ id, email, role }, JWT_SECRET, {expiresIn: "10m"});
}

export function verifyToken(token: string) {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "id" in decoded && "email" in decoded && "role" in decoded) {
        return {
            id: (decoded as any).id,
            email: (decoded as any).email,
            role: (decoded as any).role
        };
    }
    throw new Error("Invalid token payload");
}