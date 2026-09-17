const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const p = pages.find(p => p.url.includes('shader.se/#about-us') || p.url.includes('shader.se'));
    if (!p) {
      console.log('No shader.se tab found');
      return;
    }
    const ws = new WebSocket(p.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            // Find the section with "Making Digital"
            const allElements = Array.from(document.querySelectorAll('*'));
            const heading = allElements.find(el => el.textContent && el.textContent.includes('Making Digital Storytelling') && (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'DIV'));
            if (!heading) return { error: 'heading not found' };
            
            const section = heading.closest('section') || heading.parentElement;
            
            const comp = window.getComputedStyle(heading);
            return {
              headingTag: heading.tagName,
              headingText: heading.innerText,
              headingInnerHTML: heading.innerHTML,
              headingStyle: {
                fontSize: comp.fontSize,
                fontWeight: comp.fontWeight,
                lineHeight: comp.lineHeight,
                textAlign: comp.textAlign,
                color: comp.color,
                fontFamily: comp.fontFamily,
                letterSpacing: comp.letterSpacing,
                textShadow: comp.textShadow
              },
              sectionHTML: section.innerHTML.slice(0, 1500)
            };
          })()`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log('Shader.se section info:', JSON.stringify(msg.result.result.value, null, 2));
      process.exit(0);
    };
  });
});
