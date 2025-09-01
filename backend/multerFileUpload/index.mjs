import express from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sesTransport from "nodemailer-ses-transport";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("env -->", {
    PORT: process.env.PORT,
    SENDEREMAILID: process.env.SENDEREMAILID,
    RECEVIEREMAILID: process.env.RECEVIEREMAILID,
    CCEMAILID: process.env.CCEMAILID,
    SESCREDENTIALS: process.env.SESCREDENTIALS,
});

// Multer setup - store in memory (no disk files needed)
const upload = multer({ storage: multer.memoryStorage() });

// API route
app.post("/send-email", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send({ success: false, message: "No file uploaded" });
        }

        const attachments = [
            {
                filename: file.originalname,
                content: file.buffer, // direct from memory
            },
        ];

        await sendEmail(
            process.env.SENDEREMAILID,
            process.env.RECEVIEREMAILID,
            process.env.CCEMAILID,
            "Loss Notification – Financial Summary",
            "Please find attached the snapshot of the financial summary showing the reported loss for the PRJ6006 Engagement.",
            attachments,
            JSON.parse(process.env.SESCREDENTIALS) // ensure JSON string in .env
        );
        res.json({
            success: true, message: "Email sent successfully"
        });

    } catch (err) {
        console.error("Error in /send-email:", err);
        res.status(500).send({ success: false, message: err.message });
    }
});

const sendEmail = (senderEmailId, receiverEmailId, ccEmail, subject, body, attachments = [], sesCredentials) => {
    console.log("receiverEmailId --->", senderEmailId, receiverEmailId, ccEmail, subject);

    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport(sesTransport(sesCredentials));

        const mailOptions = {
            from: senderEmailId,
            to: receiverEmailId,
            cc: ccEmail || undefined, // only add if not empty
            subject,
            html: body,
            attachments,
        };

        console.log("mailOptions -->", mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending mail:", error);
                return reject(error);
            }
            console.log("Message sent:", info);
            resolve(info);
        });
    });
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
