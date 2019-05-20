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
    function triggerReady() {
      window.parent.postMessage('pixel:ready:${appId}', '*');
    }
    function listener(message) {
      if (
        message.data &&
        message.data.event === 'pixel:listening' &&
        message.data.pixel === '${appId}'
      ) {
        triggerReady();
        window.removeEventListener('message', listener);
      }
    }

    window.addEventListener('message', listener, false);
    window.addEventListener('load', triggerReady)
  })()
</script>
</body>
</html>`
