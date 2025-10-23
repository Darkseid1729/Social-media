import moment from "moment";

const fileFormat = (url = "") => {
  const fileExt = url.split(".").pop();

  if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg")
    return "video";

  if (fileExt === "mp3" || fileExt === "wav") return "audio";
  if (
    fileExt === "png" ||
    fileExt === "jpg" ||
    fileExt === "jpeg" ||
    fileExt === "gif"
  )
    return "image";

  return "file";
};

// https://res.cloudinary.com/dj5q966nb/image/upload/dpr_auto/w_200/v1710344436/fafceddc-2845-4ae7-a25a-632f01922b4d.png

// Safe Cloudinary transformer:
// - Only transforms Cloudinary URLs
// - Skips GIFs to preserve animation
// - Replaces existing first transform segment instead of stacking
// - Uses f_auto,q_auto,dpr_auto with requested width
const transformImage = (url = "", width = 100) => {
  try {
    if (!url || typeof url !== "string") return url;
    const lower = url.toLowerCase();
    if (!lower.includes("res.cloudinary.com")) return url;
    if (lower.endsWith(".gif")) return url; // don't transform GIFs

    const marker = "upload/";
    const idx = url.indexOf(marker);
    if (idx === -1) return url;

    const start = idx + marker.length;
    const slash = url.indexOf("/", start);
    if (slash === -1) {
      // No further segments; just append transforms after upload/
      return url.replace(
        marker,
        `${marker}f_auto,q_auto,dpr_auto,w_${width}/`
      );
    }

    const firstSeg = url.slice(start, slash);
    const hasVersionFirst = /^v\d+$/.test(firstSeg);

    if (hasVersionFirst) {
      // No existing transforms
      return url.replace(
        marker,
        `${marker}f_auto,q_auto,dpr_auto,w_${width}/`
      );
    }

    // Replace existing first transform segment
    const toReplace = `${marker}${firstSeg}/`;
    return url.replace(
      toReplace,
      `${marker}f_auto,q_auto,dpr_auto,w_${width}/`
    );
  } catch (e) {
    // On any unexpected format, return original URL
    return url;
  }
};

const getLast7Days = () => {
  const currentDate = moment();

  const last7Days = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = currentDate.clone().subtract(i, "days");
    const dayName = dayDate.format("dddd");

    last7Days.unshift(dayName);
  }

  return last7Days;
};

const getOrSaveFromStorage = ({ key, value, get }) => {
  if (get)
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : null;
  else localStorage.setItem(key, JSON.stringify(value));
};

export { fileFormat, transformImage, getLast7Days, getOrSaveFromStorage };
