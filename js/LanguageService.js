import {I18n} from "./i18n.js";
let current = "en";
let fallback = "en";
let uiLanguages = {en: "English"};
class LanguageService extends EventTarget {
  constructor() {
    super(...arguments);
    this.baseUrl = "";
  }
  get current() {
    return current;
  }
  get fallback() {
    return fallback;
  }
  set fallback(languageCode) {
    fallback = languageCode;
  }
  async setCurrent(languageCode) {
    current = languageCode;
    const paths = [
      `/js/Translations/ChannelViewer.${languageCode}.js`,
      `${this.baseUrl}/ChannelViewer/${languageCode}/translations.js`
    ];
    t = await I18n(languageCode, paths, Object.keys(this.uiLanguages));
    this.dispatchEvent(new CustomEvent("language-change"));
  }
  set uiLanguages(languages) {
    uiLanguages = languages;
  }
  get uiLanguages() {
    return uiLanguages;
  }
  setBaseUrl(url) {
    this.baseUrl = url;
  }
}
export const Language = new LanguageService();
export let t;
