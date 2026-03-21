const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CONNECT SUPABASE
const supabase = createClient(
  "https://gctjnwtgpsozbiturgqm.supabase.co",
  "sb_publishable_-bp0y9M35tDWklZVgMRw8A_RrbNxZZ3"
);

// ✅ REGISTER STUDENT
app.post("/register", async (req, res) => {
  const { index, parentPhone, totalFee, grade } = req.body;

  // check if exists
  const { data: existing } = await supabase
    .from("students")
    .select("*")
    .eq("index", index);

  if (existing.length > 0) {
    return res.send("Student already exists");
  }

  const { error } = await supabase.from("students").insert([
    {
      index,
      parentPhone,
      totalFee: Number(totalFee),
      paid: 0,
      grade,
      results: {},
      calendar: "School opens Jan 10"
    }
  ]);

  if (error) return res.send(error.message);

  res.send("Student registered");
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  const { index, parentPhone } = req.body;

  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("index", index)
    .eq("parentPhone", parentPhone);

  if (!data || data.length === 0) {
    return res.json({ success: false });
  }

  res.json({ success: true });
});

// ✅ ADD PAYMENT
app.post("/pay", async (req, res) => {
  const { index, amount } = req.body;

  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("index", index);

  if (!data || data.length === 0) {
    return res.send("Student not found");
  }

  const student = data[0];
  const newPaid = student.paid + Number(amount);

  const { error } = await supabase
    .from("students")
    .update({ paid: newPaid })
    .eq("index", index);

  if (error) return res.send(error.message);

  res.send("Payment added");
});

// ✅ GET STUDENT DATA
app.get("/student", async (req, res) => {
  const { index } = req.query;

  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("index", index);

  if (!data || data.length === 0) {
    return res.send("Student not found");
  }

  const student = data[0];
  const balance = student.totalFee - student.paid;

  res.json({
    totalFee: student.totalFee,
    paid: student.paid,
    balance,
    grade: student.grade,
    results: student.results,
    calendar: student.calendar
  });
});

// ✅ FILTER BY GRADE
app.get("/students-by-grade", async (req, res) => {
  const { grade } = req.query;

  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("grade", grade);

  res.json(data);
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ TEST ROUTE
app.get("/test", async (req, res) => {
  const { data, error } = await supabase
    .from("students")
    .select("*");

  if (error) return res.send(error.message);

  res.json(data);
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server running on " + PORT));