import express from "express";
import { getMails, getFilteredMails, sendMail, deleteMails } from "./controller.js";

const router = express.Router();

const SECRET_PASSWORD = process.env.SECRET_PASSWORD;
const authenticate = (req, res, next) => {
   const providedPassword = req.params.password;
   if (providedPassword === SECRET_PASSWORD) {
      next();
   } else {
      res.status(401).json({ error: "UNAUTHORIZED" });
   }
};

router.get("/:password", authenticate, getMails);
router.get("/filter/:password", authenticate, getFilteredMails);
router.post("/", sendMail);
router.delete("/:password", authenticate, deleteMails);
   
export default router;
