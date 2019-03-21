# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added `pageComponentInteraction` metric handling

## [0.5.0] - 2019-03-18
### Changed
- Added `gocommerce.google-analytics` to sandbox whitelist.

## [0.4.0] - 2019-03-13
### Changed
- Filter apps by `pixel` policy.

## [0.3.1] - 2019-03-12
### Changed
- Renamed app `request-capture-app` to `request-capture`.

## [0.3.0] - 2019-02-13
### Added
- Add `usePixel` hook.

## [0.2.1] - 2019-01-24
### Fixed
- Fixes some parse errors and typos.

## [0.2.0] - 2019-01-23
### Changed
- Added iframe sandbox whitelist.
- Added `vtex.store-components` to pixel whitelist.

## [0.1.1] - 2019-01-19
### Changed
- Update React builder to 3.x.
### Fixed
- Fix typescript issues.

## [0.1.0] - 2019-01-16
### Added
- Initial implementation of pixel manager:
  * Added graphql server.
  * Added `PixelManager` component.
  * Added server to handle iframe content.
