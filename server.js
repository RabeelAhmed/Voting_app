const express = require("express");
const app = express();
const db = require("./db")
const bodyParser = require('body-parser');
require("dotenv").config()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.send("Ho gy bhi");
  });

  const userRouter = require("./routes/userRouter");
  const candidateRouter = require("./routes/candidateRouter");


app.use("/user", userRouter)
app.use("/candidate", candidateRouter)


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});