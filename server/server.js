const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbConnection");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');
const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
dbConnect();
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
initRoutes(app);

app.listen(port, () => { 
    console.log("Server running on the port: ", port);
});