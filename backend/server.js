const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CORS = require("CORS");
require("dotenv").config();

const app = express();
app.use(CORS());

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 4000;
app.use(express.json());

mongoose.connect("mongodb://localhost/hostel_booking_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    password: String,
  })
);

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

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, gender, password } = req.body;

  const availableEmail = await User.findOne({ email: email });

  if (availableEmail) return res.json({ message: "Email already exits" });
  const user = new User({ firstName, lastName, gender, password, email });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  res.json({ message: "User registered sucessfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user)
    return res.json({ message: "Email doesnot exists or invalid password" });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.json({ message: "Email doesnot exit or invalid password" });

  const token = jwt.sign({ _id: user.id }, SECRET_KEY);

  res.header("x-auth-token", token).json({ message: "Login sucessfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
