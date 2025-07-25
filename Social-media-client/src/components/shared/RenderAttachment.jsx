import React from "react";
import { transformImage } from "../../lib/features";
import { FileOpen as FileOpenIcon } from "@mui/icons-material";

const RenderAttachment = (file, url) => {
  // If it's a GIF, render without transformation
  if (url.endsWith('.gif')) {
    return (
      <img
        src={url}
        alt="GIF"
        width={"200px"}
        height={"150px"}
        style={{ objectFit: "contain" }}
      />
    );
  }
  switch (file) {
    case "video":
      return <video src={url} preload="none" width={"200px"} controls />;
    case "image":
      return (
        <img
          src={transformImage(url, 200)}
          alt="Attachement"
          width={"200px"}
          height={"150px"}
          style={{ objectFit: "contain" }}
        />
      );
    case "audio":
      return <audio src={url} preload="none" controls />;
    default:
      return <FileOpenIcon />;
  }
};

export default RenderAttachment;
