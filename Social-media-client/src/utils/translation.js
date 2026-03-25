import axios from "axios";

export const TRANSLATION_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ur", label: "Urdu" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
];

export const translateText = async ({ text, targetLanguage, sourceLanguage = "auto" }) => {
  const trimmedText = text?.trim();

  if (!trimmedText) {
    throw new Error("Please type some text to translate");
  }

  const { data } = await axios.get("https://translate.googleapis.com/translate_a/single", {
    params: {
      client: "gtx",
      sl: sourceLanguage,
      tl: targetLanguage,
      dt: "t",
      q: trimmedText,
    },
  });

  const translatedText = Array.isArray(data?.[0])
    ? data[0].map((chunk) => chunk?.[0] || "").join("")
    : "";

  if (!translatedText) {
    throw new Error("Unable to translate text right now");
  }

  return translatedText;
};
