import { map } from 'ramda'

interface TemplateInput {
  scripts?: string[]
  settings: {
    [varName: string]: any
  }
}

const scriptSrcToTag = (src: string) => `<script src="${src}" defer></script>`

export const html = ({ settings = {}, scripts = [] }: TemplateInput) => `<!DOCTYPE html>
<html>
<head>
  ${map(scriptSrcToTag, scripts).join('\n')}
  <script>
    window.__SETTINGS__ = ${JSON.stringify(settings)};
  </script>
</head>
<body>
</body>
</html>`
