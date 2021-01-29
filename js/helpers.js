import {Video as Video2} from "./Entities/Video.js";
import {Ebook as Ebook2} from "./Entities/Ebook.js";
export const lastPart = (uri) => {
  if (uri.substr(0, 4) !== "http")
    return uri;
  const split = uri.split(/\/|#/);
  return split.pop();
};
export const fetchData = async (baseUrl) => {
  const settings = {
    fields: {
      "@id": "id",
      "@type": "type",
      "@language": "language",
      "@langcode": "langCode",
      "schema:name": "title",
      "schema:image": "covers",
      "schema:genre": "subject",
      "schema:author": {alias: "authors", plural: true},
      "schema:keywords": {alias: "tags", plural: true},
      "schema:abstract": "description",
      "schema:translationOfWork": "originalTitle",
      "schema:url": "links",
      "schema:author.schema:name": "name",
      "schema:author.schema:abstract": "description",
      "schema:author.foaf:img": "image",
      "schema:author.schema:url": "url"
    }
  };
  const dataPromise = fetch(baseUrl + "/data", {
    method: "POST",
    body: JSON.stringify(settings),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json());
  const infoPromise = fetch(baseUrl + "/info").then((response) => response.json());
  return Promise.all([infoPromise, dataPromise]);
};
export const linkClick = (event) => {
  event.preventDefault();
  history.pushState(null, null, event.currentTarget.getAttribute("href"));
  window.dispatchEvent(new CustomEvent("should-render"));
};
const entityTypes = [new Video2(), new Ebook2()];
export const getEntityType = (type) => {
  for (const entityType of entityTypes) {
    if (entityType.constructor.name.toLowerCase() === type?.toLowerCase()) {
      return entityType;
    }
  }
};
