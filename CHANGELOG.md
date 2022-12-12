# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.5.0](https://github.com/rokucommunity/brighterscript/compare/0.4.4...v0.5.0) - 2022-12-12
### Fixed
 - npm audit iddues around `latest-version`



## [0.4.5](https://github.com/rokucommunity/brighterscript/compare/0.4.4...v0.4.5) - 2022-05-19
### Fixed
 - made `fs-extra` a `dependency` instead of `devDependency`



## [0.4.4](https://github.com/rokucommunity/brighterscript/compare/0.4.3...v0.4.4) - 2022-05-13
### Changed
 - upgrade to ejs@3.1.8 and ejs-lint@1.2.2 to mitigate npm security issues



## [0.4.3](https://github.com/rokucommunity/brighterscript/compare/0.4.2...v0.4.3) - 2022-04-13
### Changed
 - locked to exactly ejs-lint@1.1.0 to eliminate npm audit issues



## [0.4.2](https://github.com/rokucommunity/brighterscript/compare/0.4.1...v0.4.2) - 2022-04-13
### Changed
 - locked to exactly ejs@3.0.2 to eliminate npm audit issues



## [0.4.1](https://github.com/rokucommunity/brighterscript/compare/0.4.0...v0.4.1) - 2022-04-13
### Changed
 - rolled-back to ejs@3.0.2 to eliminate npm audit issues



## [0.4.0](https://github.com/rokucommunity/brighterscript/compare/0.3.2...v0.4.0) - 2022-04-12
### Added
 - `parentTitle` frontmatter to help rename parent folders



## [0.3.2](https://github.com/rokucommunity/brighterscript/compare/0.3.1...v0.3.2) - 2022-04-07
### Fixed
 - infinite deploy bug in the watcher related to absolute paths



## [0.3.1](https://github.com/rokucommunity/brighterscript/compare/0.3.0...v0.3.1) - 2022-03-29
### Fixed
 - broken file system watcher for dev mode (switched to @parcel/watcher and away from chokidar).
 - npm audit issues



## [0.3.0](https://github.com/rokucommunity/brighterscript/compare/0.2.2...v0.3.0) - 2021-04-30
### Added
 - `url` function for ejs templates to resolve URLs relative to the current file's outPath, based on the template file's outPath
### Changed
 - default tree priority to 1000 so pages can be intentionally pushed lower
### Fixed
 - Improved scrolling in default template



## [0.2.2](https://github.com/rokucommunity/brighterscript/compare/0.2.1...v0.2.2) - 2021-04-30
### Fixed
 - incorrect tree folder path



## [0.2.1](https://github.com/rokucommunity/brighterscript/compare/0.2.0...v0.2.1) - 2021-04-30
### Fixed
 - remove javascript console logging in markdown file



## [0.2.0](https://github.com/rokucommunity/brighterscript/compare/0.1.0...v0.2.0) - 2021-04-29
### Added
 - hyperlink wrappers around all markdown headers
 - auto-calculate the name of a markdown page based on a h1 at the top of the file
### Fixed
 - wrong cli name. Now it's `statigen`



## [0.1.0](https://github.com/rokucommunity/brighterscript/compare/f9cf20f9251513278d39e0353d6682a28af6f26c...v0.1.0) - 2021-04-29
initial project add
