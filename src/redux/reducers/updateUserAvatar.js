// This action updates the user in Redux after avatar update
import { createAction } from "@reduxjs/toolkit";

export const updateUserAvatar = createAction("auth/updateUserAvatar", (avatarUrl) => ({
  payload: avatarUrl,
}));
