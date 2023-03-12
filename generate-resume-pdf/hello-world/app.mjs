/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

/**
 * How to run this thing in vscode
 * https://blog.gecogeco.com/running-lambda-locally-with-aws-toolkit-for-vs-code-6065323da61b
 */

import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import Handlebars from "handlebars";

const template = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Handlebars Playground</title>

    <style>
      #template-output {
        font-size: small;
        margin: 1em;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .entry {
        margin: 0 0 1em 0;
      }
      .entry-header {
        display: flex;
        justify-content: space-between;
      }
      .horizontal-list {
        columns: 3;
        list-style-position: inside;
      }
      p, ul, h1, h2, h3, h4, h5, h6 {
        margin: 0;
      }
      #title-bar {
        border-top: 3px double #8c8b8b;
      }
    </style>
  </head>

  <body>
    <div id="template-output">
      <div class="header">
        <h1>{{ bio.[0].title }}</h1>
        <h2>{{ bio.[0].details.subtitle }}</h2>
      </div>
      <hr id="title-bar"/>
      <div class="types">
        <h3>Professional Experience</h3>
        <hr/>
        {{#each employment}}
          <div class="entry">
            <div class="entry-header">
              <p><b>{{this.title}}</b> &ndash; {{this.details.position}}</p>
              <p>{{this.startDate}} &ndash; {{this.endDate}}</p>
            </div>
            <ul>
              {{#each this.details.description}}
                <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
        {{/each}}

        <h3>Education</h3>
        <hr/>
        {{#each education}}
          <div class="entry">
            <div class="entry-header">
              <p><b>{{this.title}}</b> &ndash; {{this.details.degree}}</p>
              <p>{{this.startDate}} &ndash; {{this.endDate}}</p>
            </div>
            <p>{{this.details.description.[0]}}</p>
          </div>
        {{/each}}

        <h3>Projects</h3>
        <hr/>
        {{#each projects}}
          <div class="entry">
            <div class="entry-header">
              <p><b>{{this.title}}</b></p>
              <p>{{this.details.projectSource}}</p>
            </div>
            <ul>
              {{#each this.details.description}}
                <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
        {{/each}}

        <h3>Skills</h3>
        <hr/>
        <ul class="horizontal-list">
          {{#each skills}}
            <li class="skill">{{this.title}}</li>
          {{/each}}
        </ul>
        
        <h3>Social</h3>
        <hr/>
        <ul>
          {{#each bio.[0].details.social}}
            <li class="social"><a href="{{this.url}}">{{this.name}} @ {{this.url}}</a></li>
          {{/each}}
        </ul>
      </div>
    </div>
  </body>
</html>
`;

function buildTemplate(template, data) {
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(data);
}

export const lambdaHandler = async (event, context) => {
  let browser = null;
  try {
    // Render html as pdf
    /**
     * Sources:
     * https://medium.com/@keshavkumaresan/generating-pdf-documents-within-aws-lambda-with-nodejs-and-puppeteer-46ac7ca299bf
     * https://medium.com/@fmoessle/use-html-and-puppeteer-to-create-pdfs-in-node-js-566dbaf9d9ca
     */
    console.log("event", JSON.stringify(event));
    console.log("context", JSON.stringify(context));
    const body = event.body || (event.responsePayload && event.responsePayload.body); // If invocation was result of a destination trigger, grab responsePayload
    let parsedBody; 

    try {
      // try to parse stringified JSON
      parsedBody = JSON.parse(body);
    } catch {
      // if that fails, it *should* already be in json format
      parsedBody = body;
    }
    console.log("body", JSON.stringify(parsedBody));

    const html = buildTemplate(template, parsedBody);
    console.log("html", JSON.stringify(html));

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log("browser launched");

    const page = await browser.newPage();
    console.log("new page opened");
    const loaded = page.waitForNavigation({
      waitUntil: "load",
    });

    await page.setContent(html);
    console.log("content set");
    await loaded;
    console.log("page loaded");

    return {
      headers: {
        "Content-type": "application/pdf",
      },
      statusCode: 200,
      body: (await page.pdf()).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.log(err);
    return err;
  } finally {
    if (browser !== null) {
      await browser.close();
      console.log("page closed");
    }
  }

  return response;
};
