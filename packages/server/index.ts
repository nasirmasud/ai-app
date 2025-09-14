import dotenv from "dotenv";
import type { Request, Response } from "express";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
