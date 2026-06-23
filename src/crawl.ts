import { JSDOM } from "jsdom";

export function normalizeURL(urlString: string): string {
    const urlObj = new URL(urlString);

    const hostPath = urlObj.hostname + urlObj.pathname;

    if (hostPath.endsWith("/") && hostPath !== "/") {
        return hostPath.slice(0, -1);
    }

    return hostPath;
}

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const heading = dom.window.document.querySelector("h1") ?? dom.window.document.querySelector("h2");

    return heading?.textContent?.trim() ?? "";
}

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const paragraph = dom.window.document.querySelector("p");

    return paragraph?.textContent?.trim() ?? "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    // new  
}