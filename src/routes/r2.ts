import { Router } from "express";
import multer from "multer";
import { uploadToR2 } from "../controllers/r2.js";
//
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadToR2);

export default router;