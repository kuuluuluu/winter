import {Hole} from "./vendor/uhtml.js";
class TranslatedText extends Hole {
  constructor(type, template = [], values = []) {
    super(type, template, values);
    const text = type;
    const context = template;
    this.text = text;
    this.template = [text];
    this.values = [];
    this.context = context;
    this.type = "html";
  }
  toString() {
    return this.text;
  }
}
function mixString(a, b, asCodeString = false) {
  let total = Math.max(a.length, b.length);
  let string = "";
  for (let part = 0; part < total; part++) {
    let valueString = "";
    if (typeof b[part] === "object") {
      let keys = Object.keys(b[part]);
      valueString = asCodeString ? "{" + keys[0] + "}" : b[part][keys[0]];
    } else if (typeof b[part] === "string") {
      valueString = b[part];
    }
    string += a[part] + valueString;
  }
  return string;
}
export async function I18n(language, paths, possibleLanguageCodes) {
  let translations = {};
  translations[language] = {};
  if (possibleLanguageCodes.includes(language)) {
    for (const path of paths) {
      try {
        Object.assign(translations[language], (await import(path)).Translations);
      } catch (e) {
      }
    }
  }
  function Translate(context, ...values) {
    if (typeof context === "string") {
      return (strings, ...values2) => {
        let translatedText = Translate(strings, ...values2);
        translatedText.context = context;
        return translatedText;
      };
    } else {
      let stringsToTranslate = context;
      let codeString = mixString(stringsToTranslate, values, true);
      if (typeof translations[language][codeString] === "undefined") {
        return new TranslatedText(mixString(stringsToTranslate, values));
      } else {
        let translatedString = translations[language][codeString];
        let tokens = Object.assign({}, ...values);
        let replacements = translatedString.match(/{[a-zA-Z]*}/g);
        if (replacements) {
          replacements.forEach((replacement) => {
            let variableName = replacement.substr(1).substr(0, replacement.length - 2);
            translatedString = translatedString.replace(replacement, tokens[variableName]);
          });
        }
        return new TranslatedText(translatedString);
      }
    }
  }
  Translate.constructor.prototype.direct = (variable) => {
    if (typeof translations[language][variable] === "undefined") {
      return new TranslatedText(variable).toString();
    } else {
      return new TranslatedText(translations[language][variable]).toString();
    }
  };
  return Translate;
}
