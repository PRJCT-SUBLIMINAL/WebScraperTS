import { JSDOM } from "jsdom";
import pLimit, {type LimitFunction} from "p-limit";

export type ExtractedPageData = {
    url: string;
    heading: string;
    firstParagraph: string;
    outgoingLinks: string[];
    imageURLs: string[];
};

export class ConcurrentCrawler {
    baseURL: string;
    pages: Record<string, ExtractedPageData>;
    limit: LimitFunction;
    maxPages: number;
    shouldStop: boolean;
    allTasks: Set<Promise<void>>;

    constructor(baseURL: string, pages: Record<string, ExtractedPageData>, limit: LimitFunction, maxPages: number) {
        this.baseURL = baseURL;
        this.pages = pages;
        this.limit = limit;
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
    }

    addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) return false;

        if (this.pages[normalizedURL]) return false;

        if (Object.keys(this.pages).length >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.")
            return false;
        }

        return true;
    }

    private async getHTML(url: string): Promise<string> {
        return await this.limit(async () => {
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "WebScraperTS"
                }
            });

            if (res.status >= 400) throw new Error(`HTTP error: [${res.status}] ${res.statusText}`);

            const header = res.headers.get("content-type");
            if (!header?.includes("text/html")) throw new Error(`Wrong content type in header [content-type] ${header}`);

            const html = await res.text();
            return html;
        });
    };

    // Needs updating to class methods.
    async crawlPage(currentURL: string): Promise<void> {
        if (new URL(this.baseURL).hostname !== new URL(currentURL).hostname) return;
        if (this.shouldStop) return;

        const normalizedCurrentURL = normalizeURL(currentURL);

        const isNewPage = this.addPageVisit(normalizedCurrentURL);

        if (!isNewPage) return;

        console.log(`crawling ${currentURL}`);

        try {
            const currentHTML = await this.getHTML(currentURL);

            const promises: Promise<void>[] = [];

            const data = extractPageData(currentHTML, currentURL);
            this.pages[normalizedCurrentURL] = data;

            for (const url of data.outgoingLinks) {
                const task = this.crawlPage(url);
                this.allTasks.add(task);
                task.finally(() => this.allTasks.delete(task));
                promises.push(task);
            }

            await Promise.all(promises);
            return;

        } catch (err) {
            console.error(err);
            return;
        }
    }

    async crawl() {
        await this.crawlPage(this.baseURL)
        return this.pages;
    }
}

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

export async function crawlSiteAsync(baseURL: string, maxConcurrency: number, maxPages: number) {
    const crawler = new ConcurrentCrawler(baseURL, {}, pLimit(maxConcurrency), maxPages);
    return await crawler.crawl();
}