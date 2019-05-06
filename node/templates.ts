import { map } from 'ramda'

const scriptSrcToTag = (src: string) => `<script src="${src}" defer></script>`

export const ok = ({
  settings = {},
  scripts,
}: TemplateInput) => `<!DOCTYPE html>
<html>
<head>
  ${map(scriptSrcToTag, scripts).join('\n')}
  <script>
    window.__SETTINGS__ = ${JSON.stringify(settings)}
  </script>
</head>
</html>`
