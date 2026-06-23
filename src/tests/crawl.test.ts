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
        const heading = getHeadingFromHTML(`
            <html>
                <body>
                    <h1>Test heading</h1>
                    <p>This is a test</p> 
                </body>
            </html>   
        `);
        expect(heading).toBe("Test heading");
    });

    test("Contains h2 heading", () => {
        const heading = getHeadingFromHTML(`
            <html>
                <body>
                    <h2>Test heading h2</h2>
                    <p>This is a test</p> 
                </body>
            </html>     
        `);
        expect(heading).toBe("Test heading h2");
    })

    test("Doesn't contain any heading", () => {
        const heading = getHeadingFromHTML(`
            <html>
                <body>
                    <p>This is a test</p>
                    <p>Find the heading?</p>
                </body>
            </html>   
            
        `);
        expect(heading).toBe("");
    })
});

describe("first paragraph from html", () => {
    test("Contains paragraph", () => {
        const paragraph = getFirstParagraphFromHTML(`
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

        expect(paragraph).toBe("This is a test");
    });
});