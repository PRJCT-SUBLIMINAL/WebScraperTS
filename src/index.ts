import { argv } from "node:process";
import { crawlPage } from "./crawl.ts";

async function main() {
    while (true) {
        if (argv.length < 3) {
            console.error("No arguments given. Exiting.");
            process.exit(1);
        } else if (argv.length > 3) {
            console.error("Too many arguments given. Exiting.");
            process.exit(1);
        };

        const baseURL = argv[2];

        console.log(`Starting at ${baseURL}`);

        const pages = await crawlPage(baseURL);

        console.log(pages);

        process.exit(0);
    }
}

main();