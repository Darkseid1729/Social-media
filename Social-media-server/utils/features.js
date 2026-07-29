import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";
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
      /**
       * Cloudinary resource_type strategy:
       *
       *  "video"  → real video files (mp4, mov, avi…). Cloudinary transcodes them.
       *             audio/webm MUST NOT go here — Cloudinary rejects it with
       *             "unsupported video format".
       *
       *  "raw"    → audio files (webm, ogg, wav, mp3, m4a) and unknown blobs.
       *             Cloudinary stores them as-is with NO processing.
       *             With "raw", the public_id is used verbatim in the URL so we
       *             include the extension here — Cloudinary does NOT append a second one.
       *             Result: …/raw/upload/<uuid>.webm  ✅  (single extension, playable)
       *
       *  "image"  → images (jpeg, png, gif, webp…). public_id extension-free;
       *             Cloudinary appends the correct extension automatically.
       */
      const mime = (file.mimetype || "").split(";")[0].trim().toLowerCase();
      const originalExt = file.originalname
        ? "." + file.originalname.split(".").pop().toLowerCase()
        : "";

      let resource_type;
      let public_id;
      let extraOpts = {};

      if (mime.startsWith("audio/")) {
        // Audio: store raw so Cloudinary never tries to transcode it.
        // Include the extension in public_id — raw storage doesn't add one.
        resource_type = "raw";
        const ext = originalExt || (mime === "audio/mpeg" ? ".mp3"
                                  : mime === "audio/ogg"  ? ".ogg"
                                  : mime === "audio/wav"  ? ".wav"
                                  : ".webm");
        public_id = uuid() + ext;

      } else if (mime.startsWith("video/")) {
        // Real video: let Cloudinary handle transcoding.
        resource_type = "video";
        public_id = uuid(); // Cloudinary appends the right ext automatically

      } else if (mime.startsWith("image/")) {
        resource_type = "image";
        public_id = uuid(); // Cloudinary appends the right ext automatically

      } else {
        // Unknown / binary: store raw with original extension preserved
        resource_type = "raw";
        public_id = uuid() + originalExt;
      }

      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type,
          public_id,
          timestamp: uploadTimestamp,
          timeout: 120000,
          ...extraOpts,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(
              new Error(`Failed to upload ${file.originalname || "file"}: ${error.message || error}`)
            );
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
