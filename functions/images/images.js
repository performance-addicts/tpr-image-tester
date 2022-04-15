// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const handler = async (event) => {
  const json = JSON.parse(event.body);

  try {
    const response = await fetch(json.url, {
      headers: {
        "x-im-piez": "on",
        "x-akamai-ro-piez": "on",
        "user-agent": json.ua,
        Pragma: "akamai-x-cache-on, akamai-x-get-cache-key",
      },
    });

    const data = {
      url: json.url,
      preset: json.preset,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      ua: json.ua,
      server: response.headers.get("server"),
      encodingQuality: response.headers.get("x-im-encoding-quality"),
      staging: response.headers.get("x-akamai-staging") || false,
      fileName: response.headers.get("x-im-file-name"),
      originalFormat: response.headers.get("x-im-original-format"),
      originalSize: response.headers.get("x-im-original-size"),
      originalWidth: response.headers.get("x-im-original-width"),
      resultWidth: response.headers.get("x-im-result-width"),
      pixelDensity: response.headers.get("x-im-pixel-density"),
      cacheKey: response.headers.get("x-cache-key"),
      cacheStatus: response.headers.get("x-cache"),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
