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
        width={"100px"}
        height={"75px"}
        style={{ objectFit: "contain", display: "block", margin: 0, padding: 0 }}
      />
    );
  }
  switch (file) {
    case "video":
      return <video src={url} preload="none" width={"100px"} controls style={{ display: "block", margin: 0, padding: 0 }} />;
    case "image":
      return (
        <img
          src={transformImage(url, 200)}
          alt="Attachement"
          width={"100px"}
          height={"75px"}
          style={{ objectFit: "contain", display: "block", margin: 0, padding: 0 }}
        />
      );
    case "audio":
      return <audio src={url} preload="none" controls style={{ display: "block", margin: 0, padding: 0 }} />;
    default:
      return <FileOpenIcon />;
  }
};

export default RenderAttachment;
