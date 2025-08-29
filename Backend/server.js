require('dotenv').config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const studentRoutes = require("./routes/student")
// const productRoutes = require("./routes/productRoutes")
const gradesRoutes = require("./routes/grade");
const classesRoutes = require("./routes/class");
const subjectsRoutes = require("./routes/subject");
const lessonsRoutes = require("./routes/lesson");
const examsRoutes = require("./routes/exam");
const assignmentsRoutes = require("./routes/assignment");
const resultsRoutes = require("./routes/result");
const attendanceRoutes = require("./routes/attendance");
const eventsRoutes = require("./routes/event");
const announcementsRoutes = require("./routes/announcement");
const teacherRoutes = require("./routes/teacher");
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(express.json())
app.use(cors());



app.use(cors({
    origin: ['http://localhost:3000', 'https://scholio-yash-rajvanshis-projects.vercel.app','https://scholio.vercel.app/'],
    credentials: true
  }));
dotenv.config();
// console.log('JWT_SECRET is:', process.env.JWT_SECRET);
app.options('*', cors());
const PORT = process.env.PORT || 6969;


// connect to mongoDB
connectDB(); 

app.get("/", (req,res)=>{
    res.send("WELCOME TO RABBIT API!");
})



//API Routes 
// app.use("/api/users",userRoutes);  
app.use("/api/student",studentRoutes);
app.use("/api/teacher",teacherRoutes);
app.use("/api/grade", gradesRoutes);
app.use("/api/class", classesRoutes);
app.use("/api/subject", subjectsRoutes);
app.use("/api/lesson", lessonsRoutes);
app.use("/api/exam", examsRoutes);
app.use("/api/assignment", assignmentsRoutes);
app.use("/api/result", resultsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/event", eventsRoutes);
app.use("/api/announcement", announcementsRoutes);
app.use('/api/auth', authRoutes);


app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})

