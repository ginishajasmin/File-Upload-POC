import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.S3_BUCKET; // e.g. "my-upload-bucket"
console.log("BUCKET", BUCKET)

// Generate a pre-signed PUT URL
app.get("/s3/presign", async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename and contentType are required" });
    }

    // Optionally prefix by user/tenant/date, etc.
    const ext = filename.split(".").pop();
    const timestamp = Date.now();
    const key = `cate-doc/${timestamp}/${filename}`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    console.log("cmd", cmd)

    // Optionally enforce server-side encryption:
    // ServerSideEncryption: "AES256"

    const url = await getSignedUrl(s3, cmd, { expiresIn: 360 });
    console.log("url", url)

    console.log("`https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`", `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`)
    res.json({
      url,        // PUT to this URL with the file bytes
      key,        // Save this in your DB if you need to reference the file later
      publicUrl: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// Generate a pre-signed GET URL
app.get("/s3/view", async (req, res) => {
  try {
    console.log("Insideeee")
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: "key is required" });
    }
    console.log("key", key);
    const cmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ACL: "private",
      ContentType: "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(s3, cmd, { expiresIn: 360 });
    res.json({ url: presignedUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate view URL" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
