import { JSDOM } from "jsdom";

export function normalizeURL(urlString: string): string {
    const urlObj = new URL(urlString);

    const hostPath = urlObj.hostname + urlObj.pathname;

    if (hostPath.endsWith("/") && hostPath !== "/") {
        return hostPath.slice(0, -1);
    };

    return hostPath;
};

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const heading = dom.window.document.querySelector("h1") ?? dom.window.document.querySelector("h2");

    return heading?.textContent?.trim() ?? "";
};

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const paragraph = dom.window.document.querySelector("p");

    return paragraph?.textContent?.trim() ?? "";
};

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const links = dom.window.document.querySelectorAll("a");
    const urls: string[] = [];

    for (const link of links) {
        const href = link.getAttribute("href");

        if (!href) continue;

        urls.push(new URL(href, baseURL).href);
    };

    return urls;
};

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const imageElements = dom.window.document.querySelectorAll("img");
    const images: string[] = [];

    for (const imageElement of imageElements) {
        const src = imageElement.getAttribute("src");

        if (!src) continue;

        images.push(new URL(src, baseURL).href);
    };

    return images;
};

export type ExtractedPageData = {
    url: string;
    heading: string;
    firstParagraph: string;
    outgoingLinks: string[];
    imageURLs: string[];
};

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    const url = pageURL;
    const heading = getHeadingFromHTML(html);
    const firstParagraph = getFirstParagraphFromHTML(html);
    const outgoingLinks = getURLsFromHTML(html, pageURL);
    const imageURLs = getImagesFromHTML(html, pageURL);

    return {
        url,
        heading,
        firstParagraph,
        outgoingLinks,
        imageURLs
    };
}