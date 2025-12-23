# Secure Media Implementation Guide

## Option 2: Private Delivery + Backend Proxy

This approach ensures complete access control over all media (photos/videos) by making Cloudinary resources private and proxying all requests through your backend with authentication checks.

---

## How It Works

```
┌─────────┐      Request Media      ┌─────────┐      Check Access      ┌──────────┐
│ Client  │ ──────────────────────> │ Backend │ ────────────────────> │ Database │
│         │                          │         │                        │          │
│         │ <────── Media Data ───── │         │ <─── Chat Members ──── │          │
└─────────┘                          │         │                        └──────────┘
                                     │         │
                                     │         │   Fetch from Cloudinary
                                     │         │ ──────────────────────> ┌──────────────┐
                                     │         │                         │  Cloudinary  │
                                     │         │ <────── Media ───────── │   (Private)  │
                                     └─────────┘                         └──────────────┘
```

**Flow:**
1. User requests media via backend API with authentication
2. Backend checks if user is member of the chat containing that media
3. If authorized, backend fetches media from Cloudinary (private resource)
4. Backend streams/returns media to user
5. If not authorized, return 403 Forbidden

---

## Implementation Steps

### Step 1: Make Cloudinary Resources Private

**Configure Cloudinary for private uploads:**

```javascript
// server/middlewares/multer.js or upload utility

// Current (Public):
cloudinary.uploader.upload(file.path, {
  resource_type: "auto",
  folder: "chat-media"
});

// New (Private):
cloudinary.uploader.upload(file.path, {
  resource_type: "auto",
  folder: "chat-media",
  type: "private",  // ← Makes resource private
  access_mode: "authenticated"  // ← Requires authentication
});
```

**Or configure globally in config.js:**
```javascript
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  // Default to private uploads
  upload_preset: {
    type: "private",
    access_mode: "authenticated"
  }
};
```

---

### Step 2: Store Media Metadata in Database

**Create Media Model:**

```javascript
// server/models/media.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
    index: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ["image", "video"],
    required: true
  },
  fileSize: Number,
  width: Number,
  height: Number,
  duration: Number, // For videos
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient access checks
mediaSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model("Media", mediaSchema);
```

---

### Step 3: Update Upload Controller

**Modify file upload to save metadata:**

```javascript
// server/controllers/chat.js

import Media from "../models/media.js";

// When uploading attachments with a message:
const sendAttachments = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    const files = req.files || [];

    // Check user is member of chat
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
    
    const members = chat.members.map(m => m.toString());
    if (!members.includes(req.user._id.toString())) {
      return next(new ErrorHandler("Not authorized", 403));
    }

    // Upload files to Cloudinary (private)
    const attachments = await uploadFilesToCloudinary(files);

    // Create message
    const message = await Message.create({
      content: "",
      attachments,
      sender: req.user._id,
      chat: chatId
    });

    // Save media metadata for each attachment
    const mediaRecords = attachments.map(att => ({
      chatId,
      messageId: message._id,
      uploadedBy: req.user._id,
      cloudinaryPublicId: att.public_id,
      cloudinaryUrl: att.url,
      fileType: att.url.includes("video") ? "video" : "image",
      fileSize: att.bytes,
      width: att.width,
      height: att.height,
      duration: att.duration
    }));

    await Media.insertMany(mediaRecords);

    // Emit socket event
    emitEvent(req, NEW_MESSAGE, members, { message });

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
```

---

### Step 4: Create Media Proxy API Endpoint

**New endpoint to serve media with access control:**

```javascript
// server/routes/media.js
import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getSecureMedia } from "../controllers/media.js";

const router = express.Router();

// Get media with access control
router.get("/:mediaId", isAuthenticated, getSecureMedia);

export default router;
```

**Controller implementation:**

```javascript
// server/controllers/media.js
import Media from "../models/media.js";
import Chat from "../models/chat.js";
import { ErrorHandler } from "../utils/utility.js";
import cloudinary from "cloudinary";
import axios from "axios";

export const getSecureMedia = async (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user._id;

    // Find media record
    const media = await Media.findById(mediaId);
    if (!media) {
      return next(new ErrorHandler("Media not found", 404));
    }

    // Check if user is member of the chat
    const chat = await Chat.findById(media.chatId);
    if (!chat) {
      return next(new ErrorHandler("Chat not found", 404));
    }

    const isMember = chat.members.some(
      m => m.toString() === userId.toString()
    );

    if (!isMember) {
      return next(new ErrorHandler("Access denied", 403));
    }

    // Generate authenticated URL from Cloudinary
    const authenticatedUrl = cloudinary.v2.utils.private_download_url(
      media.cloudinaryPublicId,
      media.fileType === "video" ? "video" : "image",
      {
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        attachment: false
      }
    );

    // Option A: Redirect to Cloudinary (simpler but exposes URL)
    // res.redirect(authenticatedUrl);

    // Option B: Stream through backend (more secure)
    const response = await axios({
      method: 'get',
      url: authenticatedUrl,
      responseType: 'stream'
    });

    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    
    // Stream the media
    response.data.pipe(res);

  } catch (error) {
    next(error);
  }
};
```

---

### Step 5: Update Frontend to Use Proxy

**Change how media URLs are generated:**

```javascript
// client/src/lib/features.js

// OLD: Direct Cloudinary URL
const getMediaUrl = (cloudinaryUrl) => {
  return transformImage(cloudinaryUrl, 400);
};

// NEW: Proxy through backend
const getMediaUrl = (mediaId) => {
  return `${server}/api/v1/media/${mediaId}`;
};
```

**Update components to use mediaId instead of URL:**

```jsx
// client/src/components/shared/MessageComponent.jsx

// OLD:
{attachments.map((attachment) => (
  <img src={transformImage(attachment.url, 400)} />
))}

// NEW:
{attachments.map((attachment) => (
  <img src={`${server}/api/v1/media/${attachment.mediaId}`} />
))}
```

**Update message data structure:**

Backend should now return messages with `mediaId` instead of direct URLs:

```javascript
// server/controllers/chat.js - getMessages

const messages = await Message.find({ chat: chatId })
  .populate("sender", "name avatar")
  .lean();

// Transform attachments to include mediaId
const transformedMessages = await Promise.all(
  messages.map(async (msg) => {
    if (msg.attachments?.length > 0) {
      // Find media records for these attachments
      const mediaRecords = await Media.find({ messageId: msg._id });
      
      msg.attachments = msg.attachments.map((att, index) => ({
        ...att,
        mediaId: mediaRecords[index]?._id,
        // Remove direct URL from response
        url: undefined
      }));
    }
    return msg;
  })
);
```

---

### Step 6: Update Media Gallery

**Gallery should fetch media list, not direct URLs:**

```javascript
// server/controllers/chat.js

const getChatMedia = async (req, res, next) => {
  try {
    const { id: chatId } = req.params;
    const { type } = req.query; // 'photos', 'videos', or 'all'

    // Check user access
    const chat = await Chat.findById(chatId);
    const isMember = chat.members.some(
      m => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return next(new ErrorHandler("Access denied", 403));
    }

    // Build query
    const query = { chatId };
    if (type === 'photos') query.fileType = 'image';
    if (type === 'videos') query.fileType = 'video';

    // Return media metadata only (no URLs)
    const media = await Media.find(query)
      .select('_id fileType width height duration createdAt uploadedBy')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    next(error);
  }
};
```

**Frontend displays using mediaId:**

```jsx
// client/src/components/dialogs/MediaGallery.jsx

const MediaGallery = ({ chatId }) => {
  const { data } = useGetChatMediaQuery(chatId);
  
  return (
    <div>
      {data?.media.map((item) => (
        <img 
          key={item._id}
          src={`${server}/api/v1/media/${item._id}`}
          alt="Media"
        />
      ))}
    </div>
  );
};
```

---

## Migration Strategy

**For existing media:**

```javascript
// server/scripts/migrateExistingMedia.js

import Message from "../models/message.js";
import Media from "../models/media.js";

const migrateExistingMedia = async () => {
  const messages = await Message.find({
    attachments: { $exists: true, $ne: [] }
  }).lean();

  for (const message of messages) {
    for (const attachment of message.attachments) {
      // Extract public_id from URL
      const publicId = extractPublicIdFromUrl(attachment.url);
      
      // Create media record
      await Media.create({
        chatId: message.chat,
        messageId: message._id,
        uploadedBy: message.sender,
        cloudinaryPublicId: publicId,
        cloudinaryUrl: attachment.url,
        fileType: attachment.url.includes("video") ? "video" : "image"
      });

      // Update Cloudinary resource to private
      await cloudinary.v2.uploader.update(publicId, {
        type: "private",
        access_mode: "authenticated"
      });
    }
  }
  
  console.log("Migration complete!");
};

function extractPublicIdFromUrl(url) {
  // Extract public_id from Cloudinary URL
  const match = url.match(/upload\/(?:v\d+\/)?(.+)\./);
  return match ? match[1] : null;
}

migrateExistingMedia();
```

---

## Performance Optimization

### 1. Caching

Add caching to reduce backend load:

```javascript
// Use Redis or in-memory cache
import NodeCache from "node-cache";
const mediaCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

export const getSecureMedia = async (req, res, next) => {
  const cacheKey = `media:${mediaId}:${userId}`;
  
  // Check cache
  const cached = mediaCache.get(cacheKey);
  if (cached) {
    return res.redirect(cached.url);
  }
  
  // ... access check logic ...
  
  // Cache the result
  mediaCache.set(cacheKey, { url: authenticatedUrl });
  
  // ... serve media ...
};
```

### 2. CDN for Authorized URLs

Generate short-lived authenticated URLs and let CDN cache them:

```javascript
const authenticatedUrl = cloudinary.v2.utils.private_download_url(
  media.cloudinaryPublicId,
  media.fileType,
  {
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    attachment: false,
    sign_url: true
  }
);

// Redirect to authenticated URL (CDN can cache for 1 hour)
res.redirect(authenticatedUrl);
```

### 3. Thumbnail Proxy

Only proxy full-size media, serve thumbnails differently:

```javascript
// For thumbnails in chat list, use smaller images
router.get("/thumbnail/:mediaId", isAuthenticated, getMediaThumbnail);

// Generate smaller, cacheable thumbnails
export const getMediaThumbnail = async (req, res, next) => {
  // ... access check ...
  
  const thumbnailUrl = cloudinary.v2.url(media.cloudinaryPublicId, {
    type: "private",
    sign_url: true,
    width: 200,
    height: 200,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto"
  });
  
  res.redirect(thumbnailUrl);
};
```

---

## Security Considerations

### ✅ What This Protects Against:

1. **Unauthorized Access**: Non-members can't view chat media
2. **URL Guessing**: Public IDs don't expose media directly
3. **Direct Link Sharing**: Shared URLs won't work without authentication
4. **Deleted Chat Access**: If user leaves chat, they lose access

### ⚠️ Limitations:

1. **Screenshot/Download**: Users with access can still save media locally
2. **Performance**: Extra backend hop adds latency
3. **Bandwidth**: Your server streams media (can be expensive)
4. **URL Expiry**: Authenticated URLs expire, may break cached pages

### 🔒 Additional Security Measures:

1. **Rate Limiting**: Prevent media endpoint abuse
2. **Watermarking**: Add user-specific watermarks to sensitive media
3. **Audit Logging**: Track who accessed what media
4. **EXIF Stripping**: Remove metadata from uploaded images

---

## Cost Analysis

### Current (Public URLs):
- ✅ Free media delivery via Cloudinary CDN
- ✅ Fast (direct CDN access)
- ❌ No access control

### New (Private + Proxy):
- ❌ Backend bandwidth costs (media streamed through your server)
- ❌ Slightly slower (extra hop)
- ❌ More complex
- ✅ Complete access control
- ✅ Secure

**Hybrid Approach** (Best of both):
- Use backend proxy for initial authentication
- Generate short-lived authenticated Cloudinary URLs
- Redirect to Cloudinary (reduces your bandwidth)
- URLs expire after 1 hour

---

## Testing Checklist

- [ ] Upload new media → Creates Media record in DB
- [ ] Access media as chat member → Success
- [ ] Access media as non-member → 403 Forbidden
- [ ] Access media without auth → 401 Unauthorized
- [ ] Leave chat → Can no longer access media
- [ ] Media gallery shows only accessible media
- [ ] Thumbnails load quickly
- [ ] Full-size media streams properly
- [ ] Video playback works
- [ ] Mobile performance acceptable

---

## Rollback Plan

If issues arise, you can rollback:

1. Keep Media model but make Cloudinary resources public again
2. Return direct URLs from backend temporarily
3. Fix issues, then re-enable private mode
4. Media records remain useful for analytics/tracking

---

## Alternative: Hybrid Approach

For best balance of security and performance:

```javascript
// Generate time-limited authenticated URLs
export const getSecureMediaUrl = async (req, res, next) => {
  // ... access check ...
  
  // Return authenticated URL (valid for 1 hour)
  const authenticatedUrl = cloudinary.v2.utils.private_download_url(
    media.cloudinaryPublicId,
    media.fileType,
    { expires_at: Math.floor(Date.now() / 1000) + 3600 }
  );
  
  res.json({ 
    success: true, 
    url: authenticatedUrl,
    expiresAt: Date.now() + 3600000
  });
};

// Frontend caches URL until expiry
const getMediaUrl = async (mediaId) => {
  const cached = localStorage.getItem(`media_${mediaId}`);
  if (cached) {
    const { url, expiresAt } = JSON.parse(cached);
    if (Date.now() < expiresAt) return url;
  }
  
  const { url, expiresAt } = await fetchSecureMediaUrl(mediaId);
  localStorage.setItem(`media_${mediaId}`, JSON.stringify({ url, expiresAt }));
  return url;
};
```

This gives you:
- ✅ Access control
- ✅ Fast CDN delivery
- ✅ Lower bandwidth costs
- ⚠️ URLs can be shared (but expire)

---

## Summary

**Recommended Implementation Order:**

1. Create Media model
2. Update upload flow to save metadata
3. Create media proxy endpoint with access checks
4. Test with new uploads
5. Migrate existing media (run script on low-traffic time)
6. Update frontend to use proxy URLs
7. Monitor performance and adjust caching

**Estimated Time:** 2-3 days for full implementation + testing

**Questions to consider:**
- Do you want to stream through your backend or use authenticated redirects?
- What's your expected media traffic volume?
- How strict should access control be?
- Do you need audit logging of media access?
