import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const connectDB = (uri) => {
  mongoose
    .connect(uri, { 
      dbName: "my-social-media",
      serverSelectionTimeoutMS: 5000,    // Timeout after 5s instead of hanging
      socketTimeoutMS: 45000,             // Close sockets after 45s of inactivity  
      maxPoolSize: 10,                    // Limit connection pool size
      minPoolSize: 2,                     // Keep minimum connections ready
      connectTimeoutMS: 10000,            // Initial connection timeout
    })
    .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
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

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
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
