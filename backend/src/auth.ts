import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export type Role = "admin" | "manager" | "supervisor" | "barber";

export type AuthUser = {
  userId: number;
  username: string;
  fullName: string;
  role: Role;
  barberId: number | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const secret = () => process.env.JWT_SECRET || "barbazza-dev-secret-change-me";

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret(), { expiresIn: "12h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  try {
    req.user = jwt.verify(token, secret()) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
}

export function allow(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "You do not have access to this area" });
      return;
    }
    next();
  };
}
