import {html, svg} from "../vendor/uhtml.js";
import {lastPart, linkClick} from "../helpers.js";
import {template_content_top} from "../BaseTemplates.js";
import {app} from "../App.js";
import {t} from "../LanguageService.js";
export class Ebook {
  teaser(item, filters) {
    const typeSlug = item.type.toLowerCase();
    let frontCover = item?.covers?.find((cover) => cover.includes("front"));
    if (!frontCover && item?.covers.length)
      frontCover = item?.covers[0];
    return html`
      <a href="${"/" + typeSlug + "/" + lastPart(item.id) + `?item-language=${item.langCode}` + (filters ? "&" + filters : "")}" 
         class="${"teaser " + typeSlug}" 
         onclick="${linkClick}">
        ${frontCover ? html`<img class="cover" src="${frontCover}" />` : ""}
        <h3 class="title">${item.title}</h3>
        <span class="authors">${item.authors.map((author) => author.name)}</span>
      </a>
    `;
  }
  page() {
    const query = new URLSearchParams(location.search);
    if (!app.currentCover)
      app.currentCover = "front";
    const id = location.pathname.split("/")?.[2];
    const item = app.items.find((item2) => lastPart(item2.id) === id && item2.langCode === query.get("item-language"));
    if (!item)
      window.location.pathname = "/";
    const typeSlug = item.type.toLowerCase();
    return html`
      <div class="content-wrapper">
        ${template_content_top()}

        <div class="${"full content " + typeSlug}">
          ${this.covers(item)}

          <div class="content-inner">
            <header class="book-header">
              <h1 class="title">${item.title}</h1>
              <h3 class="authors">${item.authors.map((author) => author.name)}</h3>
              
              ${item.originalTitle ? html`<h5 class="original-title"><label>${t`Original title:`}</label>${item.originalTitle}</h5>` : ""}
              ${this.downloads(item)}
              ${this.languages(item)}
            </header>

            <div class="description">
              <p>${item.description}</p>
              ${this.videos(item)}
              ${item.tags.length ? html`
                <div class="tags">
                  <label class="title">${t`Keywords:`} </label>
                  ${item.tags.map((tag) => html`<a class="tag" onclick="${linkClick}" href="${"/?tags=" + tag}">${tag}</a>`)}
                </div>
              ` : ""}
            </div>

            <div class="right">
              ${this.authors(item)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  covers(item) {
    let frontCover = item?.covers?.find((cover) => cover.includes("front"));
    if (!frontCover && item?.covers?.length)
      frontCover = item?.covers[0];
    const backCover = item?.covers?.find((cover) => cover.includes("back"));
    const coverClick = () => {
      if (frontCover && backCover) {
        app.currentCover = app.currentCover === "front" ? "back" : "front";
        app.render();
      }
    };
    return html`
      <div class="covers left" cover="${app.currentCover}" onclick="${coverClick}">
        ${frontCover ? html`<img class="cover front" alt="${item.title}" src="${frontCover}" />` : ""}
        ${backCover ? html`<img class="cover back" alt="${item.title}" src="${backCover}" />` : ""}
      </div>
    `;
  }
  downloads(item) {
    const pdfFile = item.links.find((file) => file.includes(".pdf"));
    const epubFile = item.links.find((file) => file.includes(".epub"));
    const downloadIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 67 89" xml:space="preserve"><g transform="translate(-16.700001,-5.3999996)"><rect x="16.7" y="83.5" width="66.5" height="10.9"/><polygon points="44.5 5.6 55.5 5.6 55.5 58.3 71.8 41.9 79.6 49.8 53.9 75.5 50 79.2 46.1 75.5 20.4 49.8 28.2 41.9 44.5 58.3 "/></g></svg>`;
    return pdfFile || epubFile ? html`
      <div class="downloads">
        <label class="title">${t`Download`}</label>
        <div class="inner">
          ${pdfFile ? html`<a class="pdf file-download" href="${pdfFile}" target="_blank">${downloadIcon}<span>${t`PDF`}</span></a>` : ""}
          ${epubFile ? html`<a class="epub file-download" href="${epubFile}" target="_blank">${downloadIcon}<span>${t`ePub`}</span></a>` : ""}
        </div>
      </div>
    ` : "";
  }
  languages(item) {
    const typeSlug = item.type.toLowerCase();
    const filters = app.createFilterUrl();
    const otherLanguages = app.items.filter((innerItem) => innerItem.id === item.id && innerItem.language !== item.language).map((item2) => {
      return {
        language: item2.language,
        langCode: item2.langCode
      };
    });
    return html`
      <span class="language">${item.language}</span>
      ${otherLanguages.length ? html`
        <div class="other-languages">
          <label>${t`Also available in:`}</label>  
          ${otherLanguages.map((languageItem) => html`
            <a class="language other" onclick="${linkClick}" href="${"/" + typeSlug + "/" + lastPart(item.id) + `?item-language=${languageItem.langCode}` + (filters ? "&" + filters : "")}">${languageItem.language}</a>
          `)}
        </div>` : ""}
    `;
  }
  videos(item) {
    const youtubeLinks = item.links.filter((file) => file.includes("youtube.com")).map((link) => {
      const youtubeId = link.replace("https://www.youtube.com/watch?v=", "").replace("https://www.youtube.com/embed/", "");
      return `https://www.youtube.com/embed/${youtubeId}`;
    });
    return youtubeLinks.map((link) => html`
      <div class="responsive-youtube">
        <iframe modestbranding="1" rel="0" src="${link}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>              
    `);
  }
  authors(item) {
    return item.authors.map((author) => html`
      <div class="author-info">
        <p>
          ${author.image ? html`<img class="image" src="${author.image}">` : ""}
          ${author.description}
        </p>

        ${author.url ? html`<a class="button" target="_blank" href="${author.url}">${author.url}</a>` : ""}
        
        <a class="button" href="${"/?authors=" + author.name}" onclick="${linkClick}">${t`Other books of ${{author: author.name}}`}</a>
      </div>
    `);
  }
}
