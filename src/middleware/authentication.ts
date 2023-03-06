import { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const authenticateAccessToken = function (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader ?? null;
  if (!token) return res.status(401).send();

  jwt.verify(token, process.env.ACCESS_TOKEN!, (err, user) => {
    if (err) return res.status(403).send();
    
    req.user = user;
    next();
  });
};


