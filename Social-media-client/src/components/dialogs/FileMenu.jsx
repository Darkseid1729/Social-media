import { ListItemText, Menu, MenuItem, MenuList, Tooltip } from "@mui/material";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import {
  AudioFile as AudioFileIcon,
  Image as ImageIcon,
  UploadFile as UploadFileIcon,
  VideoFile as VideoFileIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "../../redux/api/api";

const FileMenu = (props) => {
  const { anchorE1, chatId, onGifClick, onYouTubeClick } = props;
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
    <Menu anchorEl={anchorE1} open={isFileMenu} onClose={closeFileMenu}>
      <div style={{ width: "10rem" }}>
        <MenuList>
          <MenuItem onClick={selectImage}>
            <Tooltip title="Image">
              <ImageIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Image</ListItemText>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Images")}
              ref={imageRef}
            />
          </MenuItem>

          {/* GIF Option */}
          <MenuItem onClick={() => { closeFileMenu(); if (onGifClick) onGifClick(); }}>
            <Tooltip title="GIF">
              <PhotoLibraryIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>GIF</ListItemText>
          </MenuItem>

          {/* YouTube Option */}
          <MenuItem onClick={() => { closeFileMenu(); if (onYouTubeClick) onYouTubeClick(); }}>
            <Tooltip title="YouTube">
              <YouTubeIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>YouTube</ListItemText>
          </MenuItem>

          <MenuItem onClick={selectAudio}>
            <Tooltip title="Audio">
              <AudioFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Audio</ListItemText>
            <input
              type="file"
              multiple
              accept="audio/mpeg, audio/wav"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Audios")}
              ref={audioRef}
            />
          </MenuItem>

          <MenuItem onClick={selectVideo}>
            <Tooltip title="Video">
              <VideoFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>Video</ListItemText>
            <input
              type="file"
              multiple
              accept="video/mp4, video/webm, video/ogg"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Videos")}
              ref={videoRef}
            />
          </MenuItem>

          <MenuItem onClick={selectFile}>
            <Tooltip title="File">
              <UploadFileIcon />
            </Tooltip>
            <ListItemText style={{ marginLeft: "0.5rem" }}>File</ListItemText>
            <input
              type="file"
              multiple
              accept="*"
              style={{ display: "none" }}
              onChange={(e) => fileChangeHandler(e, "Files")}
              ref={fileRef}
            />
          </MenuItem>
        </MenuList>
      </div>
    </Menu>
  );
};

export default FileMenu;
