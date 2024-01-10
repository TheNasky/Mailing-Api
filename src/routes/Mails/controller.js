// controller.js
import fs from "fs";
import nodemailer from "nodemailer";
import { generateId } from "../../config/utils/generateId.js";

// Function to read mails from the file
const readMailsFromFile = () => {
   try {
      const data = fs.readFileSync("mails.txt", "utf-8");
      return JSON.parse(data);
   } catch (error) {
      return [];
   }
};

const writeMailsToFile = (mails) => {
   fs.writeFileSync("mails.txt", JSON.stringify(mails, null, 2), "utf-8");
};

// Get all mails
export const getMails = (req, res) => {
   const mails = readMailsFromFile();
   res.status(200).json(mails);
};

// Get filtered mails
export const getFilteredMails = (req, res) => {
   const { sender, date, id } = req.query;
   let filteredMails = readMailsFromFile();
   if (sender) {
      filteredMails = filteredMails.filter((mail) => mail.sender === sender);
   }
   if (date) {
      const queryDate = new Date(date).toLocaleDateString("en-GB", {
         year: "2-digit",
         month: "2-digit",
         day: "2-digit",
      });
      filteredMails = filteredMails.filter((mail) => {
         const mailDate = new Date(mail.date).toLocaleDateString("en-GB", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
         });
         return mailDate === queryDate;
      });
   }
   if (id) {
      filteredMails = filteredMails.filter((mail) => mail._id === id);
   }
   res.status(200).json(filteredMails);
};

// Send mail and save to file
export const sendMail = async (req, res) => {
   const { sender, subject, message, goals, name, lastName, company, country } = req.body;
   if (!sender) {
      return res.status(400).json({ error: "Email is required" });
   }
   const _id = generateId(); // Generate a 10-digit ID
   const ip = req.connection.remoteAddress;
   const date = new Date().toLocaleString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
   });
   const newMail = {
      _id,
      sender,
      subject,
      message,
      goals,
      name,
      lastName,
      company,
      country,
      ip,
      date,
   };
   // Send mail using Nodemailer
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.MAIL_SENDER,
         pass: process.env.MAIL_PASS,
      },
   });
   const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: process.env.MAIL_TARGET,
      subject: subject,
      html: `  
         <h1 style="color: #000000;">New Message from <span style="color: #3366cc;">${newMail.sender}</span></h1>
         <p style="color: #000000;">${newMail.message}</p>
         <ul>
            <li style="color: #000000;">Name: ${newMail.name}</li>
            <li style="color: #000000;">Last Name: ${newMail.lastName}</li>
            <li style="color: #000000;">Company: ${newMail.company}</li>
            <li style="color: #000000;">Country: ${newMail.country}</li>
            <li style="color: #000000;">Goals: ${newMail.goals}</li>
            <li style="color: #000000;">Date: ${newMail.date}</li>
            <li style="color: #000000;">IP: ${newMail.ip}</li>
         </ul>
      `,
   };
   try {
      await transporter.sendMail(mailOptions);
      // Save mail to file
      const allMails = readMailsFromFile();
      allMails.push(newMail);
      writeMailsToFile(allMails);
      res.status(201).json({ message: "Mail sent and saved successfully" });
   } catch (error) {
      res.status(500).json({ error: "Failed to send mail" });
   }
};

// Delete mails based on multiple queries
export const deleteMails = (req, res) => {
   const { sender, date, id } = req.query;

   let mailsToDelete = readMailsFromFile();

   if (sender) {
      mailsToDelete = mailsToDelete.filter((mail) => mail.sender === sender);
   }

   if (date) {
      const queryDate = new Date(date).toLocaleDateString("en-GB", {
         year: "2-digit",
         month: "2-digit",
         day: "2-digit",
      });

      mailsToDelete = mailsToDelete.filter((mail) => {
         const mailDate = new Date(mail.date).toLocaleDateString("en-GB", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
         });
         return mailDate === queryDate;
      });
   }

   if (id) {
      mailsToDelete = mailsToDelete.filter((mail) => mail._id === id);
   }

   if (mailsToDelete.length === 0) {
      return res.status(200).json({ message: "No matching mails found" });
   }

   const messages = [];

   if (sender) {
      messages.push(`All Mails from Sender ${mailsToDelete[0].sender} Deleted`);
   }
   if (date) {
      messages.push(
         `All Mails from Date ${new Date(mailsToDelete[0].date).toLocaleDateString("en-GB", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
         })} Deleted`
      );
   }
   if (id) {
      messages.push(`Mail with ID ${id} Deleted`);
   }

   const remainingMails = readMailsFromFile().filter(
      (mail) => !mailsToDelete.some((mailToDelete) => mailToDelete._id === mail._id)
   );

   writeMailsToFile(remainingMails);

   res.status(200).json({ message: messages.join(", ") });
};
