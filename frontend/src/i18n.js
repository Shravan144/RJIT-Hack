import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";
import pb from "./locales/pb.json";

// get saved language from localStorage
const savedLang = localStorage.getItem("lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      pa: { translation: pb }
    },

    // use saved language
    lng: savedLang,

    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;