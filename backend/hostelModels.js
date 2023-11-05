const mongoose = require("mongoose");

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    password: String,
  })
);

const Hostel = mongoose.model(
  "Hostel",
  new mongoose.Schema({
    hostelName: String,
    location: String,
    hostelOwner: String,
    contact: String,
    roomType: String,
    amenties: [{ name: String, description: String }],
  })
);

module.exports = { Hostel ,Student};

