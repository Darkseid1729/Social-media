import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";
import path from "path";
import https from "https";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const connectDB = (uri, retries = 5, delayMs = 3000) => {
  const attempt = (remaining) => {
    mongoose
      .connect(uri, {
        dbName: "my-social-media",
        serverSelectionTimeoutMS: 30000,  // 30 s — gives Atlas time to elect a primary
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        connectTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
      })
      .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
      .catch((err) => {
        if (remaining > 0) {
          console.error(`DB connection failed (${err.message}). Retrying in ${delayMs / 1000}s… (${remaining} attempt(s) left)`);
          setTimeout(() => attempt(remaining - 1), delayMs);
        } else {
          console.error("Could not connect to MongoDB after several retries. Check your Atlas cluster (may be paused) and network access settings.");
          throw err;
        }
      });
  };
  attempt(retries);
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(code).cookie("my-social-media-token", token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};

const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

const getNetworkUnixTimestamp = async () => {
  return new Promise((resolve) => {
    const req = https.request(
      "https://api.cloudinary.com",
      { method: "HEAD", timeout: 4000 },
      (res) => {
        const dateHeader = res.headers.date;
        const parsed = dateHeader ? Math.floor(new Date(dateHeader).getTime() / 1000) : NaN;

        if (Number.isFinite(parsed) && parsed > 0) {
          resolve(parsed);
        } else {
          resolve(Math.floor(Date.now() / 1000));
        }
      }
    );

    req.on("error", () => resolve(Math.floor(Date.now() / 1000)));
    req.on("timeout", () => {
      req.destroy();
      resolve(Math.floor(Date.now() / 1000));
    });
    req.end();
  });
};

const uploadFilesToCloudinary = async (files = []) => {
  const uploadTimestamp = await getNetworkUnixTimestamp();

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const ext = file.originalname ? path.extname(file.originalname).toLowerCase() : '';
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid() + ext,
          timestamp: uploadTimestamp,
          timeout: 120000, // 2 minutes timeout for mobile uploads
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Failed to upload ${file.originalname || 'file'}: ${error.message || error}`));
          }
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    console.error('Upload to Cloudinary failed:', err);
    throw new Error(err.message || "Error uploading files to cloudinary");
  }
};

const deletFilesFromCloudinary = async (public_ids) => {
  // Delete files from cloudinary
};

export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deletFilesFromCloudinary,
  uploadFilesToCloudinary,
};
