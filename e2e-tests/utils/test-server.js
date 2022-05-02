import polka from 'polka';
import _ from 'lodash';
import { TestUtils } from './test-utils.js';
import { By, until } from 'selenium-webdriver';

const PORT = 3005;
let app;

export function startServer() {
  app = polka()
    .get('/api/u/user-details', (req, res) => {
      res.end(
        JSON.stringify({
          emailVerified: true,
          user: {
            email: 'test@modheader.com'
          },
          subscription: {
            plan: 'pro'
          }
        })
      );
    })
    .get('/api/headers', (req, res) => {
      res.setHeader('set-cookie', [
        'test=foobar; Path=/api; Secure',
        'test2=foobar2; Path=/; HttpOnly'
      ]);
      res.end(JSON.stringify(req.headers));
    })
    .get('/headers', (req, res) => {
      const html = `<html>
<head>
    <script>
        async function run() {
            const response = await fetch('/api/headers', { credentials: 'same-origin' });
            if (response.ok) {
                document.getElementById('request-headers').innerHTML = JSON.stringify(await response.json());
                const responseHeaders = {};
                for (const [name, value] of response.headers.entries()) {
                    if (responseHeaders[name]) {
                        if (!Array.isArray(responseHeaders)) {
                            responseHeaders[name] = [responseHeaders[name], value];
                        } else {
                            responseHeaders[name].push(value);
                        }
                    } else {
                        responseHeaders[name] = value;
                    }
                }
                document.getElementById('response-headers').innerHTML = JSON.stringify(responseHeaders);
            }
            const loadedElem = document.createElement("div");
            loadedElem.id = 'loaded';
            document.body.appendChild(loadedElem);
        }
        run();
    </script>
</head>
<body>
    <p id="request-headers" />
    <p id="response-headers" />
    <p id="cookies" />
</body>
</html>`;
      res.end(html);
    })
    .listen(PORT);
}

export function stopServer() {
  if (app) {
    app.server.close();
    app = until;
  }
}

export function getTestServerOrigin() {
  return `http://localhost:${PORT}`;
}

export async function getHeaders(driver) {
  await driver.get(`${getTestServerOrigin()}/headers`);
  const testUtils = new TestUtils(driver);
  await driver.wait(until.elementLocated(By.id('loaded')));
  const requestHeaderElem = await testUtils.findBy(By.id('request-headers'));
  const responseHeaderElem = await testUtils.findBy(By.id('response-headers'));
  const cookies = _.keyBy(await driver.manage().getCookies(), 'name');
  return {
    requestHeaders: JSON.parse(await requestHeaderElem.getText()),
    responseHeaders: JSON.parse(await responseHeaderElem.getText()),
    cookies
  };
}
