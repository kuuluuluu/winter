import {render, html} from "./vendor/uhtml.js";
import {getEntityType, fetchData} from "./helpers.js";
import {addMatomo, addChatwoot} from "./ThirdPartyScripts.js";
import {template_style, template_header, template_sidebar, template_overview, template_about} from "./BaseTemplates.js";
import {Language} from "./LanguageService.js";
import {env} from "./Env.js";
const channelId = location.hostname.split(".")[0];
const baseUrl = `${env.channelsApi}/${channelId}`;
Language.setBaseUrl(baseUrl);
class App {
  constructor() {
    this.couldNotLoad = false;
    this.search = "";
    this.languages = new Map();
    Language.uiLanguages = {
      en: "English",
      nl: "Nederlands",
      de: "Deutsch"
    };
    fetchData(baseUrl).then(async ([siteInfo, items]) => {
      const query = new URLSearchParams(location.search);
      await Language.setCurrent(query.get("site-language") ?? "en");
      if (!siteInfo.errors) {
        this.siteInfo = siteInfo;
        for (const item of items) {
          item.searchWords = [
            item.description,
            item.title
          ].join(" ").toLowerCase();
        }
        document.title = siteInfo.name;
        if (siteInfo.matomo)
          addMatomo(siteInfo.matomo);
        if (siteInfo.chatwoot)
          addChatwoot(siteInfo.chatwoot);
        this.items = items;
        this.filters = this.createFilters(this.items);
      } else {
        this.couldNotLoad = true;
      }
      this.element = document.querySelector("#app");
      this.render();
    });
    window.addEventListener("popstate", () => this.render());
    window.addEventListener("should-render", () => this.render());
    window.addEventListener("filter-selected", () => {
      this.updateUrl();
      this.render();
    });
  }
  createFilters(items) {
    const query = new URLSearchParams(location.search);
    this.search = query.get("search");
    const selectedSubject = query.get("subject");
    const selectedLangCode = query.get("langCode");
    const selectedAuthors = query.get("authors")?.split(",").map((tag) => tag.replace(/&#x2C;/g, ",")) ?? [];
    const selectedTags = query.get("tags")?.split(",").map((tag) => tag.replace(/&#x2C;/g, ",")) ?? [];
    const filters = {
      tags: new Map(),
      subject: new Map(),
      langCode: new Map(),
      authors: new Map()
    };
    for (const item of items) {
      for (const tag of item.tags) {
        filters.tags.set(tag, selectedTags.includes(tag));
      }
      if (item?.authors) {
        for (const author of item.authors) {
          filters.authors.set(author.name, selectedAuthors.includes(author.name));
        }
      }
      if (item.subject) {
        filters.subject.set(item.subject, item.subject === selectedSubject);
      }
      filters.langCode.set(item.langCode, item.langCode === selectedLangCode);
      this.languages.set(item.langCode, item.language);
    }
    return filters;
  }
  getFilteredItems() {
    let filteredItems = [...this.items];
    for (const [name, filter] of Object.entries(this.filters)) {
      const selectedFilterItems = [...filter.entries()].map(([item, selected]) => selected ? item : null).filter((item) => item);
      if (selectedFilterItems.length && filteredItems[0]) {
        if (Array.isArray(filteredItems[0][name])) {
          filteredItems = filteredItems.filter((item) => item[name].some((filterItem) => {
            return selectedFilterItems.includes(filterItem?.name ?? filterItem);
          }));
        } else {
          filteredItems = filteredItems.filter((item) => selectedFilterItems.includes(item[name]));
        }
      }
    }
    if (this.search) {
      filteredItems = filteredItems.filter((item) => item?.searchWords?.includes(this.search.toLowerCase()));
    }
    filteredItems.sort((a, b) => a.title.localeCompare(b.title));
    return filteredItems;
  }
  render() {
    if (this.couldNotLoad) {
      render(this.element, html`
        <div>
        <h4>Loading the current channel did not work. Are you looking for this?</h1>
          <ul>
            <li><a href="${"http://prophet-stories:" + location.port}">Prophet Stories</a></li>
            <li><a href="${"http://ebookseastomorg:" + location.port}">Ebooks</a></li>
          </ul>
        </div>
      `);
      return;
    }
    let page = "page";
    if (location.pathname === "/")
      page = "overview";
    if (location.pathname.split("/")?.[1] === "about")
      page = "about";
    this.filteredItems = this.getFilteredItems();
    document.body.dataset.page = page;
    const type = location.pathname.split("/")?.[1];
    render(this.element, html`
        ${page === "page" ? [
      template_style(),
      template_header(),
      template_sidebar(),
      getEntityType(type).page()
    ] : ""}

        ${page === "overview" ? [
      template_style(),
      template_header(),
      template_sidebar(),
      template_overview()
    ] : ""}

        ${page === "about" ? [
      template_style(),
      template_header(),
      template_sidebar(),
      template_about()
    ] : ""}

    `);
  }
  updateUrl() {
    const filters = this.createFilterUrl();
    history.pushState(null, null, filters ? "?" + filters : "/");
  }
  createFilterUrl() {
    const urlObject = {};
    for (const [name, filter] of Object.entries(this.filters)) {
      const selection = [...filter.entries()].filter(([, selected]) => selected).map(([tag]) => tag.replace(/,/g, "&#x2C;")).join(",");
      if (selection) {
        urlObject[name] = selection;
      }
    }
    if (this.search) {
      urlObject.search = this.search;
    }
    urlObject["site-language"] = Language.current;
    const previousQuery = new URLSearchParams(location.search);
    if (previousQuery.get("item-language")) {
      urlObject["item-language"] = previousQuery.get("item-language");
    }
    const query = new URLSearchParams(urlObject);
    return query.toString();
  }
}
export const app = new App();
