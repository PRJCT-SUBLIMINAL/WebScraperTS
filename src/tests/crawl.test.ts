import { describe, expect, test } from "vitest";
import { normalizeURL, getHeadingFromHTML, getFirstParagraphFromHTML, getURLsFromHTML, getImagesFromHTML, extractPageData } from "../crawl.ts";

describe("normalizeURL tests", () => {

    test("Correct input format (https)", () => {
        const normalizedURL = normalizeURL("https://www.boot.dev");
        expect(normalizedURL).toBe("www.boot.dev");
    });

    test("Correct input format (http)", () => {
        const normalizedURL = normalizeURL("http://www.boot.dev");
        expect(normalizedURL).toBe("www.boot.dev");
    });

    test("Paths return clean", () => {
        const normalizedURL = normalizeURL("https://www.boot.dev/users/baggers/");
        expect(normalizedURL).toBe("www.boot.dev/users/baggers");
    });

    test("URL with query", () => {
        const normalizedURL = normalizeURL("https://www.boot.dev/users/baggers/h?query=string");
        expect(normalizedURL).toBe("www.boot.dev/users/baggers/h");
    })

    test("URL with query and hash", () => {
        const normalizedURL = normalizeURL("https://www.boot.dev/users/baggers/h?query=string#hash");
        expect(normalizedURL).toBe("www.boot.dev/users/baggers/h");
    })
});

describe("first heading from html", () => {
    test("Contains h1 heading", () => {
        const html = getHeadingFromHTML(`
            <html>
                <body>
                    <h1>Test heading</h1>
                    <p>This is a test</p> 
                </body>
            </html>   
        `);
        expect(html).toBe("Test heading");
    });

    test("Contains h2 heading", () => {
        const html = getHeadingFromHTML(`
            <html>
                <body>
                    <h2>Test heading h2</h2>
                    <p>This is a test</p> 
                </body>
            </html>     
        `);
        expect(html).toBe("Test heading h2");
    })

    test("Doesn't contain any heading", () => {
        const html = getHeadingFromHTML(`
            <html>
                <body>
                    <p>This is a test</p>
                    <p>Find the heading?</p>
                </body>
            </html>   
            
        `);
        expect(html).toBe("");
    })
});

describe("first paragraph from html", () => {
    test("Contains paragraph with second paragraph", () => {
        const html = getFirstParagraphFromHTML(`
            <html>
                <body>
                    <h1>Test heading h1</h1>
                    <p>This is a test</p>
                    <p>This is a second paragraph</p>
                </body>
            </html>  
        `);

        expect(html).toBe("This is a test");
    });

    test("Contains paragraph with nested paragraph", () => {
        const html = getFirstParagraphFromHTML(`
            <html>
                <body>
                    <h1>Test heading h1</h1>
                    <p>This is a test</p>
                    <p>This is a second paragraph</p>
                    <div>
                        <p>This is a third paragraph</p>
                    </div> 
                </body>
            </html>  
        `);

        expect(html).toBe("This is a test");
    });

    test("Contains no paragraph", () => {
        const html = getFirstParagraphFromHTML(`
            <html>
                <body>
                    <h1>This is a heading</h1>
                    <h2>This is a second heading</h2>
                    <div>
                        <h3>Third heading</h3>
                    </div>
                </body>
            </html>    
        `);

        expect(html).toBe("");
    });
});

describe("URLs from HTML", () => {
    test("getURLsFromHTML single URL", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = ["https://crawler-test.com/path/one"];

        expect(actual).toEqual(expected);
    });

    test("getURLsFromHTML multiple URLs", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `
            <html>
                <body>
                    <a href="/path/one"><span>Boot.dev</span></a>
                    <a href="/path/two"><span>Boot2.dev</span>></a>
                </body>
            </html>
        `;

        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = [
            "https://crawler-test.com/path/one",
            "https://crawler-test.com/path/two"
        ];

        expect(actual).toEqual(expected);
    })

    test("getImagesFromHTML single image", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = ["https://crawler-test.com/logo.png"];

        expect(actual).toEqual(expected);
    });

    test("getImagesFromHTML multiple images", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `
            <html>
                <body>
                    <img src="/logo.png" alt="Logo">
                    <img src="/logo2.png" alt="Logo 2">
                </body>
            </html>
        `;

        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = [
            "https://crawler-test.com/logo.png",
            "https://crawler-test.com/logo2.png"
        ];

        expect(actual).toEqual(expected);
    });

    test("extractPageData basic", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `
            <html><body>
            <h1>Test Title</h1>
            <p>This is the first paragraph.</p>
            <a href="/link1">Link 1</a>
            <img src="/image1.jpg" alt="Image 1">
            </body></html>
        `;

        const actual = extractPageData(inputBody, inputURL);
        const expected = {
            url: "https://crawler-test.com",
            heading: "Test Title",
            firstParagraph: "This is the first paragraph.",
            outgoingLinks: ["https://crawler-test.com/link1"],
            imageURLs: ["https://crawler-test.com/image1.jpg"],
        };

        expect(actual).toEqual(expected);
    });

    test("extractPageData advanced", () => {
        const inputURL = "https://crawler-test.com";
        const inputBody = `
            <html><body>
            <h1>Test Title 2</h1>
            <p>This is the first paragraph.</p>
            <p>This is the second paragraph</p>
            <a href="/link1">Link 1</a>
            <img src="/image1.jpg" alt="Image 1">
            <a href="/link2">Link2</a>
            <img src="/image2.jpg" alt="Image 2">
            </body></html>
        `;

        const actual = extractPageData(inputBody, inputURL);
        const expected = {
            url: "https://crawler-test.com",
            heading: "Test Title 2",
            firstParagraph: "This is the first paragraph.",
            outgoingLinks: [
                "https://crawler-test.com/link1",
                "https://crawler-test.com/link2"
            ],
            imageURLs: [
                "https://crawler-test.com/image1.jpg",
                "https://crawler-test.com/image2.jpg"
            ],
        };

        expect(actual).toEqual(expected);
    });
});

