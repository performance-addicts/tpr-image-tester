const express = require("express");
const path = require("path");
const app = express();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
app.post("/api/url", async (req, res) => {
  const response = await fetch(req.body.url, {
    headers: {
      "x-im-piez": "on",
      "x-akamai-ro-piez": "on",
    },
  });
  res.header({ "Access-Control-Expose-Headers": "*" });
  console.log(response.headers);
  const staging = response.headers.get("x-akamai-staging") || false;
  const fileName = response.headers.get("x-im-file-name");
  const originalFormat = response.headers.get("x-im-original-format");
  const originalSize = response.headers.get("x-im-original-size");
  const originalWidth = response.headers.get("x-im-original-width");
  const resultWidth = response.headers.get("x-im-result-width");
  const pixelDensity = response.headers.get("x-im-pixel-density");
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const server = response.headers.get("server");

  const data = {
    staging,
    server,
    fileName,
    originalFormat,
    originalSize,
    originalWidth,
    resultWidth,
    pixelDensity,
    contentType,
    contentLength,
  };

  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
