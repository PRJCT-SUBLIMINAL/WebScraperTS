import { JSDOM } from "jsdom";
import {type LimitFunction} from "p-limit";

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
};

export class ConcurrentCrawler {
    baseURL: string;
    pages: Record<string, number>;
    limit: LimitFunction;

    constructor(baseURL: string, pages: Record<string, number>, limit: LimitFunction) {
        this.baseURL = baseURL;
        this.pages = pages;
        this.limit = limit;
    }

    addPageVisit(normalizedURL: string): boolean {
        if (this.pages[normalizedURL] > 0) {
            this.pages[normalizedURL]++;
            return false;
        }
        this.pages[normalizedURL] = 1;
        return true;
    }

    private async getHTML(url: string): Promise<string> {
        return await this.limit(async () => {
            try {
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "WebScraperTS"
                    }
                });

                if (res.status >= 400) {
                    throw new Error(`HTTP error: [${res.status}] ${res.statusText}`);
                    return;
                };

                const header = res.headers.get("content-type");
                if (!header?.includes("text/html")) {
                    throw new Error(`Wrong content type in header [content-type] ${header}`);
                    return;
                };

                const html = await res.text();
                console.log(html);
                return html;
            }
            
            catch(err) {
                console.error(err);
                return html;
            }
        });
    };

    // Needs updating to class methods.
    async crawlPage(currentURL: string): Promise<void> {
        if (new URL(this.baseURL).hostname !== new URL(currentURL).hostname) return this.pages;

        const normalizedCurrentURL = normalizeURL(currentURL);

        if (this.pages[normalizedCurrentURL] > 0) {
            pages[normalizedCurrentURL]++;
            return pages;
        };

        pages[normalizedCurrentURL] = 1;

        try {
            const currentHTML = await getHTML(currentURL);
            console.log(currentHTML);

            const urls = getURLsFromHTML(currentHTML, baseURL);

            for (const url of urls) {
                pages = await crawlPage(baseURL, url, pages);
            }

            return pages;

        } catch (err) {
            console.error(err);
            return pages;
        }
    }
}