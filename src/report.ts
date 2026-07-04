import {type ExtractedPageData} from "./crawl.ts";
import path from "node:path";
import * as fs from "node:fs";
 
export function writeJSONReport(
    pageData: Record<string, ExtractedPageData>,
    filename: string = "report.json"
): void {

    const sortedURLs = Object.values(pageData).sort((a, b) => a.url.localeCompare(b.url));
    const json = JSON.stringify(sortedURLs, null, 2);
    const resolvedPath = path.resolve(process.cwd(), filename)
    fs.writeFileSync(resolvedPath, json);
    return;
};