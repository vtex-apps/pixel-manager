import { map } from 'ramda'

interface TemplateInput {
  appId: string
  scripts?: string[]
  settings: {
    [varName: string]: any
  }
}

const scriptSrcToTag = (src: string) => `<script src="${src}" defer></script>`

export const html = ({ appId, settings = {}, scripts = [] }: TemplateInput) => `<!DOCTYPE html>
<html>
<head>
  ${map(scriptSrcToTag, scripts).join('\n  ')}
  <script>
    window.__SETTINGS__ = ${JSON.stringify(settings)};
  </script>
</head>
<body>

<script>
  (function() {
    window.addEventListener('load', function() {
      window.parent.postMessage('pixel:ready:${appId}', '*');
    })
  })()
</script>
</body>
</html>`
