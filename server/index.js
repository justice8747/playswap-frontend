import express from "express";
import client from "./database/connectDB.js";
import userRoutes from "./routes/UserRoutes.js";
import cors from "cors";
import SpotifyRoutes from "./routes/SpotifyRoutes.js";
import YtmusicRoutes from "./routes/YtmusicRoutes.js";
import TransferRoutes from "./routes/transferRoutes.js";
import session from "express-session";
import passport from "passport";
import { googleStrategy } from "./config/googleStrategy.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";

import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cookieParser());

client
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Connection error", err.stack);
    process.exit(1);
  });

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      " https://nightly-aglow-erik.ngrok-free.dev ", // Add your second origin here
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(googleStrategy);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("hello from here");
});

app.use("/", userRoutes);
app.use("/", SpotifyRoutes);
app.use("/", YtmusicRoutes);
app.use("/", TransferRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
