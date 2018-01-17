# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][]

### Changed

- Replaced `npm-which` dependency with `which`, which has a smaller footprint.

## [0.2.0][] - 2018-01-08

### Added

- Added `simple` mode, which enables authors to use the plugin simply to create HTML that [mermaidjs](https://mermaidjs.github.io/usage.html) can understand.

### Changed

- `mermaid.cli` has been moved to a peer dependency. For SVG generation, ensure this package is available.

## [0.1.2][] - 2017-11-15

### Fixed

- Made earlier fix available to more code paths.

## [0.1.1][] - 2017-11-14

### Fixed

- Made executing [mermaid CLI](https://github.com/mermaidjs/mermaid.cli) from within plugin more robust.

## [0.1.0][] - 2017-11-10

Initial release of `remark-mermaid` plugin.

[Unreleased]: https://github.com/temando/remark-mermaid/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/temando/remark-mermaid/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/temando/remark-mermaid/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/temando/remark-mermaid/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/temando/remark-mermaid/tree/v0.1.0
