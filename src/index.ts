import express, { Express } from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Users from "./modals/usersModal";
import cors from "cors";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { authenticateAccessToken } from "./middleware/authentication";
import RefreshToken from "./modals/refreshTokenModal";

dotenv.config();
const port = process.env.PORT ?? 5000;
const dbURI = process.env.DBURI ?? "";

const app: Express = express();

app.use(cors());

app.use(express.json()); // parses post request json body

app.use(express.urlencoded({ extended: true })); // parses html post body



app.get("/", (req, res) => {
  res.send("<h1>HOME PAGE.....</h1>");
});

app.get("/blogs", authenticateAccessToken, (req, res) => {
  res.status(200).send({message:"successful token auth"});
});




app.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(404).send();
  }

  try {
    const userData = await Users.findOne({ email: email }).lean();
    if (!userData) {
      return response.status(404).send();
    }

    if (await bcrypt.compare(password, userData.password)) {
      const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN!, {
        expiresIn: "120s",
      });
      const refreshToken = jwt.sign( { email: email }, process.env.REFRESH_TOKEN!, { expiresIn: "1y" } );

      await RefreshToken.updateOne({email: email}, {email, refreshToken},{ upsert: true });

      return response.status(200).send({ ...userData, accessToken: accessToken, refreshToken: refreshToken, });

    } else {

      return response.status(404).send({ message: "Invalid Password" });

    }
  } catch (err) {
    response.status(500).send();
  }
});



app.post("/register", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(404).send();
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({ email, password: hashedPassword });

    await user.save();

    response.status(200).send({ message: "Successfully Registered"});
  } catch (err) {
    // console.log(err);
    response.status(500).send();
  }
});



app.post("/getAccessToken", async(req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).send();

  const dbsRefreshTokenData = await RefreshToken.findOne({refreshToken});

  if(!dbsRefreshTokenData?.refreshToken || dbsRefreshTokenData?.refreshToken!==refreshToken){
    return res.status(401).send();
  }
    
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN!, (err, user) => {
        if (err) return res.status(401).send();
    
        const accessToken = jwt.sign(
          { email: user.email },
          process.env.ACCESS_TOKEN!,
          { expiresIn: "60s" }
        );

        res.status(200).send({ accessToken });

      });
    
});


app.post("/logout",authenticateAccessToken,async(req,res)=>{
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).send();

  await RefreshToken.deleteOne({refreshToken});

  res.status(200).send();
})




console.log(process.env.PORT);
// DB
mongoose
  .connect(process.env.DBURI??"mongodb+srv://chidamanbu:mongodbATLAS@cluster0.8peajye.mongodb.net/Blog_App?retryWrites=true&w=majority")
  .then(() => {
    console.log("app connected to db");

    app.listen(process.env.PORT, () => {
      console.log("app running on port", port);
    });
  })
  .catch(() => {
    console.log("app init failed");
  });
