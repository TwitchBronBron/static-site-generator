#!/usr/bin/env node

import { StaticSiteGenerator } from "./StaticSiteGenerator";

var generator = new StaticSiteGenerator({
    watch: process.argv.includes('--watch')
});
generator.run();
