import { default as axios } from "axios";

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

export const lambdaHandler = async (event, context) => {
  /**
   * Get resume data for alecwest
   * Prune and sort each category
   * Send to generate-resume-pdf api
   * Collect results and post to S3 bucket (separate function?)
   */
  try {
    const requestConfig = {
      headers: {
        "x-api-key": "XtgNfp5L6EaZJglcvBKlJ8cxZVYoAKt75WYfpQk2",
        "Content-Type": "application/json",
      },
    };
    const response = await axios.get(
      "https://9apc2wzyzb.execute-api.us-east-2.amazonaws.com/production/resume/alecwest", requestConfig
    );

    const entries = response.data.Items;
    const entriesByType = entries
      .map((item) => ({ [item.type]: item }))
      .reduce((prev, curr) => {
        const currentItem = Object.values(curr)[0];
        if (!Object.keys(prev).includes(currentItem.type)) {
          prev[currentItem.type] = [];
        }
        prev[currentItem.type] = [...prev[currentItem.type], currentItem];
        return prev;
      }, {});
    const sortedEntries = Object.keys(entriesByType).reduce((prev, type) => {
      if (type === "skills") {
        prev[type] = entriesByType[type].sort(
          (a, b) => b.details.proficiency - a.details.proficiency
        );
      } else {
        prev[type] = entriesByType[type].sort((a, b) => {
          const aParsed = Date.parse(a.endDate.replace(/[\\/]/g, "-"));
          const bParsed = Date.parse(b.endDate.replace(/[\\/]/g, "-"));
          return a.endDate === "present" ? -1 : bParsed - aParsed;
        });
      }
      return prev;
    }, {});
    /**
     * Take first 9 skills, and remove descriptions after first 2 projects and first 3 of anything else
     */
    const prunedEntries = Object.keys(sortedEntries).reduce((prev, type) => {
      if (type === "skills") {
        prev[type] = sortedEntries[type].slice(0, 9);
      } else {
        prev[type] = sortedEntries[type].map((entry, index) => {
          if (type === 'projects' && index >= 2 || index >= 3) {
            entry.details.description = [];
          }
          return entry;
        });
      }
      return prev;
    }, {});

    // TODO use https library instead to maybe resolve function once api request is sent
    // https://www.sensedeep.com/blog/posts/stories/lambda-fast-http.html
    // await axios.post("https://voseiyv1g4.execute-api.us-east-2.amazonaws.com/Prod/generate", prunedEntries, requestConfig);
    const lambdaResponse = {
      statusCode: 200,
      body: JSON.stringify(prunedEntries),
    }; 
    console.log("returning", JSON.stringify(lambdaResponse));
    return lambdaResponse;
  } catch (err) {
    console.log(err);
    return err;
  }
};
