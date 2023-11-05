const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CORS = require("cors");
require("dotenv").config();
const Hostel = require("./hostelModels").Hostel;
const Student = require("./hostelModels").Student;

const app = express();
app.use(CORS());

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 4000;
app.use(express.json());

mongoose.connect("mongodb://localhost/hostel_booking_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function authenticateUser(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ message: "Not authorised,No token provide" });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = decoded;
    next();
  } catch (error) {
    res.json({ message: "invalid token" });
  }
}

app.post("/api/StudentRegistration", async (req, res) => {
  const { firstName, lastName, email, gender, password } = req.body;

  const availableEmail = await Student.findOne({ email: email });

  if (availableEmail) return res.json({ message: "Email already exits" });
  const student = new Student({ firstName, lastName, gender, password, email });
  const salt = await bcrypt.genSalt(10);
  student.password = await bcrypt.hash(password, salt);
  await student.save();
  res.json({ message: "Registered sucessfully" });
});

app.post("/HostelRegistration", async (req, res) => {
  const { name, location, amenties } = req.body;
});

app.get("/api/Hostels", async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    console.log(hostels);
    await res.json(hostels);
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/StudentLogin", async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email: email });
  if (!student)
    return res.json({ message: "Email doesnot exists or invalid password" });
  const validPassword = await bcrypt.compare(password, student.password);
  if (!validPassword)
    return res.json({ message: "Email doesnot exit or invalid password" });

  const token = jwt.sign({ _id: student.id }, SECRET_KEY);
  res.header("x-auth-token", token).json({ message: "Login sucessfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
