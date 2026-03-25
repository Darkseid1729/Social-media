import { Box, Menu, MenuItem, Tooltip } from "@mui/material";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import {
  AudioFile as AudioFileIcon,
  Image as ImageIcon,
  UploadFile as UploadFileIcon,
  VideoFile as VideoFileIcon,
  YouTube as YouTubeIcon,
  LiveTv as LiveTvIcon,
  AutoAwesome as AutoAwesomeIcon,
  CardGiftcard as GiftCardIcon,
  AutoFixHigh as AiAnimationIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "../../redux/api/api";

const FileMenu = (props) => {
  const {
    anchorE1,
    chatId,
    onGifClick,
    onYouTubeClick,
    onWatchPartyClick,
    onAnimationClick,
    onGiftCardClick,
    onAiAnimationClick,
    onTranslateClick,
  } = props;
  const { isFileMenu } = useSelector((state) => state.misc);

  const dispatch = useDispatch();

  const imageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  const [sendAttachments] = useSendAttachmentsMutation();

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  // Compress image before upload to reduce file size
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1920px width/height)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;
          
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.8 // 80% quality - good balance between quality and size
          );
        };
      };
    });
  };

  const fileChangeHandler = async (e, key) => {
    const files = Array.from(e.target.files);

    if (files.length <= 0) return;

    if (files.length > 10)
      return toast.error(`You can only send 10 ${key} at a time`);

    dispatch(setUploadingLoader(true));

    const toastId = toast.loading(`Preparing ${key}...`);
    closeFileMenu();

    try {
      // Compress images before uploading
      let processedFiles = files;
      if (key === "Images") {
        toast.loading(`Compressing ${files.length} image(s)...`, { id: toastId });
        processedFiles = await Promise.all(
          files.map(file => compressImage(file))
        );
        
        // Show size reduction
        const originalSize = files.reduce((sum, f) => sum + f.size, 0);
        const compressedSize = processedFiles.reduce((sum, f) => sum + f.size, 0);
        const reduction = Math.round((1 - compressedSize / originalSize) * 100);
        console.log(`Compressed images: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`);
      }

      toast.loading(`Uploading ${key}...`, { id: toastId });

      const myForm = new FormData();
      myForm.append("chatId", chatId);
      processedFiles.forEach((file) => myForm.append("files", file));

      const res = await sendAttachments(myForm);

      if (res.data) {
        toast.success(`${key} sent successfully`, { id: toastId });
      } else if (res.error) {
        const errorMessage = res.error?.data?.message || res.error?.message || `Failed to send ${key}`;
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(`Failed to send ${key}`, { id: toastId });
      }

      // Fetching Here
    } catch (error) {
      // Handle specific error cases
      const errorCode = error?.code || error?.name;
      const errorMsg = error?.data?.message || error?.message || '';
      
      let userMessage = `Failed to send ${key}`;
      
      // Check for abort/timeout/network errors
      if (errorCode === 'ERR_CANCELED' || errorCode === 'ECONNABORTED' || 
          errorMsg.toLowerCase().includes('abort') || 
          errorMsg.toLowerCase().includes('timeout')) {
        userMessage = `Upload timed out. Please check your connection and try again.`;
      } else if (errorCode === 'ERR_NETWORK' || errorMsg.toLowerCase().includes('network')) {
        userMessage = `Network error. Please check your connection.`;
      } else if (errorMsg) {
        userMessage = errorMsg;
      }
      
      toast.error(userMessage, { id: toastId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };


  return (
    <Menu
      anchorEl={anchorE1}
      open={isFileMenu}
      onClose={closeFileMenu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      PaperProps={{ sx: { mt: -1, borderRadius: 2 } }}
    >
      <Box
        sx={{
          width: 280,
          p: 1.25,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        <Tooltip title="Image">
          <MenuItem
            aria-label="Image"
            onClick={selectImage}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <ImageIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="GIF">
          <MenuItem
            aria-label="GIF"
            onClick={() => { closeFileMenu(); if (onGifClick) onGifClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <PhotoLibraryIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="YouTube">
          <MenuItem
            aria-label="YouTube"
            onClick={() => { closeFileMenu(); if (onYouTubeClick) onYouTubeClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <YouTubeIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Watch Party">
          <MenuItem
            aria-label="Watch Party"
            onClick={() => { closeFileMenu(); if (onWatchPartyClick) onWatchPartyClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <LiveTvIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Animations">
          <MenuItem
            aria-label="Animations"
            onClick={() => { closeFileMenu(); if (onAnimationClick) onAnimationClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Gift Card">
          <MenuItem
            aria-label="Gift Card"
            onClick={() => { closeFileMenu(); if (onGiftCardClick) onGiftCardClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <GiftCardIcon sx={{ color: "#f7c948", fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="AI Animation">
          <MenuItem
            aria-label="AI Animation"
            onClick={() => { closeFileMenu(); if (onAiAnimationClick) onAiAnimationClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <AiAnimationIcon sx={{ color: "#a855f7", fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Translate Message">
          <MenuItem
            aria-label="Translate"
            onClick={() => { closeFileMenu(); if (onTranslateClick) onTranslateClick(); }}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <TranslateIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Audio">
          <MenuItem
            aria-label="Audio"
            onClick={selectAudio}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <AudioFileIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="Video">
          <MenuItem
            aria-label="Video"
            onClick={selectVideo}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <VideoFileIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <Tooltip title="File">
          <MenuItem
            aria-label="File"
            onClick={selectFile}
            sx={{ justifyContent: "center", borderRadius: 1.5, minHeight: 56 }}
          >
            <UploadFileIcon sx={{ fontSize: 28 }} />
          </MenuItem>
        </Tooltip>

        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/gif"
          style={{ display: "none" }}
          onChange={(e) => fileChangeHandler(e, "Images")}
          ref={imageRef}
        />
        <input
          type="file"
          multiple
          accept="audio/mpeg, audio/wav"
          style={{ display: "none" }}
          onChange={(e) => fileChangeHandler(e, "Audios")}
          ref={audioRef}
        />
        <input
          type="file"
          multiple
          accept="video/mp4, video/webm, video/ogg"
          style={{ display: "none" }}
          onChange={(e) => fileChangeHandler(e, "Videos")}
          ref={videoRef}
        />
        <input
          type="file"
          multiple
          accept="*"
          style={{ display: "none" }}
          onChange={(e) => fileChangeHandler(e, "Files")}
          ref={fileRef}
        />
      </Box>
    </Menu>
  );
};

export default FileMenu;
