const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://lakshmanandeveloper777:123@cluster0.29ibj3k.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

const credentialsModel = mongoose.model(
  "credentialModel",
  { user: String, pass: String },
  "bulkmail" // Collection name
);

app.post("/sendmail", async (req, res) => {
  const { msg, emailList } = req.body;

  try {
    const [cred] = await credentialsModel.find();
    if (!cred) {
      console.log("No credentials found in DB");
      return res.send(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cred.user,
        pass: cred.pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: cred.user,
        to: emailList[i],
        subject: "Mail from BulkMail API",
        text: msg,
      });
      console.log("Email sent to:", emailList[i]);
    }

    res.send(true);
  } catch (error) {
    console.error("Failed to send email:", error);
    res.send(false);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
