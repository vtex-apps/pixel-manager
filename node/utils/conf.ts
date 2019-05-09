export function getAppMajor() {
  return parseInt(process.env.VTEX_APP_VERSION!.split('.')[0], 10)
}
