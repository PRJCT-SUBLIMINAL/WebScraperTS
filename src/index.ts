import { argv } from "node:process";
import { crawlSiteAsync } from "./crawl.ts";
import { writeJSONReport } from "./report.ts";

async function main() {
    if (argv.length < 5) {
        console.error("Not enough arguments given. Exiting.");
        process.exit(1);
    } else if (argv.length > 5) {
        console.error("Too many arguments given. Exiting.");
        process.exit(1);
    };

    const baseURL = argv[2];
    const maxConcurrency = Number(argv[3]);
    const maxPages = Number(argv[4]);

    console.log(`Starting at ${baseURL}`);

    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

    console.log("Finished crawling.");

    writeJSONReport(pages, "report.json");

    const firstPage = Object.values(pages)[0];
    if (firstPage) console.log(`First page record: ${firstPage["url"]} - ${firstPage["heading"]}`)

    process.exit(0);
}

main();