# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Allow pixel iframe to read parent cookies.

## [0.11.3] - 2019-05-14

### Fixed

- First events not adding required properties.

## [0.11.2] - 2019-05-09

## [0.11.2-beta] - 2019-05-09

### Fixed

- Fix another race condition.

## [0.11.1] - 2019-05-09

### Fixed

- Export `usePixel` in `PixelContext`.

## [0.11.0] - 2019-05-09

### Added

- Cache to pixels routes

### Changed

- Update to node@4.x

### Fixed

- Avoid triggering events before pixels are loaded
- Usage of localStorage

## [0.10.0] - 2019-05-07

### Added

- New event type: `orderPlaced`.

## [0.9.0] - 2019-05-06

### Added

- Add account whitelist.

## [0.8.0] - 2019-05-03

### Added

- Added vtex.google-analytics app to whitelist.

## [0.7.0] - 2019-05-02

### Added

- Added new type of event, productClick.

## [0.6.0] - 2019-03-21

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
  - Added graphql server.
  - Added `PixelManager` component.
  - Added server to handle iframe content.
