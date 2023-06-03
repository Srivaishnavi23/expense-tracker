const express = require("express");
//const sequelize = require("./database");
const productRoutes = require("./routes/products");
const bodyParser = require("body-parser");
const cors = require("cors");
const Product = require("./models/products");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)))

app.use("/", userRoutes);

app.use("/homepage",(req,res)=>{

  res.sendFile(path.join(__dirname,"Signup","signup.html"))
})

app.all("/", (req, res) => {
  res.send("<h2>Page Not Found</h2>");
});

sequelize
  .sync()
  .then(() => { 
    app.listen(3000,()=>{
      console.log("listening")
    });
  })
  .catch((err) => {
    console.log(err);
  });