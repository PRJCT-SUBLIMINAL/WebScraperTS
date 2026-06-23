import { describe, expect, test } from "vitest";
import { normalizeURL, getHeadingFromHTML, getFirstParagraphFromHTML } from "../crawl.ts";

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