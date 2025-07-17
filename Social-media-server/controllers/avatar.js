import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import { deletFilesFromCloudinary, uploadFilesToCloudinary } from "../utils/features.js";

// Update user avatar

const updateAvatar = TryCatch(async (req, res, next) => {
  const userId = req.user;
  const file = req.file;

  console.log("[Avatar] userId:", userId);
  console.log("[Avatar] req.file:", file);

  if (!file) {
    console.log("[Avatar] No file received");
    return next(new ErrorHandler("Please upload an avatar image", 400));
  }

  const user = await User.findById(userId);
  console.log("[Avatar] user found:", user ? user._id : null);
  if (!user) {
    console.log("[Avatar] User not found");
    return next(new ErrorHandler("User not found", 404));
  }

  // Delete old avatar from cloudinary
  if (user.avatar && user.avatar.public_id) {
    console.log("[Avatar] Deleting old avatar from Cloudinary:", user.avatar.public_id);
    await deletFilesFromCloudinary([user.avatar.public_id]);
  }

  // Upload new avatar
  const result = await uploadFilesToCloudinary([file]);
  console.log("[Avatar] Cloudinary upload result:", result);
  user.avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };
  await user.save();
  console.log("[Avatar] User avatar updated and saved");

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    avatar: user.avatar,
  });
});

export { updateAvatar };
