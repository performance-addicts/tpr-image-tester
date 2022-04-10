// base url
let imgCode = "https://images.coach.com/is/image/Coach/c8529_b4ta7_a0";
// image paths
const COACH_DOMAIN = "https://images.coach.com/is/image/Coach/";
const SW_DOMAIN =
  "https://images.stuartweitzman.com/is/image/stuartweitzmanonline/";
const KS_DOMAIN = "https://images.katespade.com/is/image/KateSpade/";

// selectors
const $form = document.getElementById("url-check");
const $template = document.querySelector("#product");
const $csv = document.querySelector("#csv");
const $root = document.querySelector("#root");
const $loading = document.querySelector("#loading");

// scene7 presets
const presets = [
  "$mobileThumbnail$",
  "$tabletThumbnail$",
  "$desktopThumbnail$",
  "$mobileSwatch$",
  "$tabletSwatch$",
  "$desktopSwatch$",
  "$desktopSwatchImage$",
  "$quickViewProduct$",
  "$imageRec$",
  "$mobileCloserLook$",
  "$desktopCloserLook$",
  "$mobileProductTile$",
  "$tabletProductTile$",
  "$desktopProductTile$",
  "$mobileProduct$",
  "$tabletProduct$",
  "$desktopProduct$",
  "$mobileProductZoom$",
  "$tabletProductZoom$",
  "$desktopProductZoom$",
  "",
];

// first load
(async () => {
  const data = await postToServer(presets)
    .then(awaitJson)
    .then((response) => response);
  await createAllImgs(data);
  document.querySelector("#loading").textContent = "";
})();
/*
presets = array of presets
loop through presets and create img url
post to serverless function url, user-agent, preset
return array of promises
*/
async function postToServer(presets) {
  const responses = [];
  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];

    const url = `${imgCode}${preset ? "?" + preset : ""}`;
    const ua = navigator.userAgent;
    const response = await fetch("/.netlify/functions/images/images", {
      method: "POST",
      body: JSON.stringify({ url: url, ua: ua, preset: preset }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    responses.push(response);
  }
  return Promise.all(responses);
}

/* 
responses = array of promises
loop through promises to get json

*/
function awaitJson(responses) {
  return Promise.all(
    responses.map((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
  );
}

function formatDataAndImg(response) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = response.url;
    // img.loading = "lazy";

    const clone = $template.content.cloneNode(true);
    width = "";
    height = "";

    const poll = setInterval(function () {
      if (img.naturalWidth) {
        clearInterval(poll);
        width = img.naturalWidth;
        height = img.naturalHeight;
        const responseClone = { ...response, width, height };

        resolve({ responseClone, clone, img, response });
      }
    }, 10);
  });
}
/*
responses = json array
loop through json
create img
set up template
make sure img width is available before writing html
*/
async function createAllImgs(responses) {
  const csvData = [];
  for (const jsonResponse of responses) {
    const { responseClone, clone, img, response } = await formatDataAndImg(
      jsonResponse
    );

    csvData.push(responseClone);
    writeHTML(clone, img, response);
  }
  createCSV(csvData);
}
/*
takes array of json responses
formats data into csv string
creates download link
*/

function createCSV(responses) {
  const header = [
    "url",
    "preset",
    "contentType",
    "contentLength",
    "width",
    "height",
    "ua",
    "server",
    "encodingQuality",
    "staging",
    "fileName",
    "originalFormat",
    "originalSize",
    "originalWidth",
    "resultWidth",
    "pixelDensity",
  ];

  const csvString = [
    header,
    ...responses.map((response) => [
      response.url,
      response.preset,
      response.contentType,
      response.contentLength,
      response.width,
      response.height,
      response.ua.split(",").join("_"),
      response.server,
      response.encodingQuality,
      response.staging,
      response.fileName,
      response.originalFormat,
      response.originalSize,
      response.originalWidth,
      response.resultWidth,
      response.pixelDensity,
    ]),
  ]
    .map((e) => {
      return e.join(",");
    })
    .join("\n");

  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvString);
  const link = document.createElement("a");
  link.textContent = "DOWNLOAD CSV";
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${imgCode}.csv`);
  $csv.appendChild(link);
}

function writeHTML(clone, img, json) {
  const h2 = clone.querySelector("h2");

  h2.textContent = json.preset || "No Preset";
  const type = clone.querySelector(".type");
  type.textContent = json.contentType;
  const size = clone.querySelector(".size");
  size.textContent = `${(
    parseInt(json.contentLength) / Math.pow(1024, 1)
  ).toFixed(2)} kb`;
  const dimensions = clone.querySelector(".dimensions");
  dimensions.textContent = `width: ${img.naturalWidth} height: ${img.naturalHeight}`;
  const a = clone.querySelector("a");
  a.href = json.url;
  a.textContent = json.url;
  a.target = "_blank";

  const sizeChange = clone.querySelector(".size-change");
  sizeChange.textContent =
    json.server === "Akamai Image Manager"
      ? `${calcDiff(
          json.originalSize,
          json.contentLength
        )} in size vs original image`
      : "Realtime Optimization - more data will be available after offline optimization";

  // <p class="staging"></p>
  // <p class="server"></p>
  // <p class="filename"></p>

  // <p class="og-format"></p>
  // <p class="og-size"></p>
  // <p class="og-width"></p>
  // <p class="result-width"></p>
  console.log(json.originalSize, json.contentLength);
  console.log(json.originalSize - json.contentLength);

  console.log(calcDiff(json.originalSize, json.contentLength));
  const ua = clone.querySelector(".user-agent");
  ua.textContent = `User Agent: ${json.ua}`;
  const staging = clone.querySelector(".staging");
  staging.textContent = `Staging: ${json.staging}`;
  const server = clone.querySelector(".server");
  server.textContent = `Server: ${json.server}`;
  const fileName = clone.querySelector(".filename");
  fileName.textContent = `fileName: ${json.fileName}`;
  const encodingQuality = clone.querySelector(".encoding-quality");
  encodingQuality.textContent = `encodingQuality: ${json.encodingQuality}`;
  const originalFormat = clone.querySelector(".og-format");
  originalFormat.textContent = `originalFormat: ${json.originalFormat}`;
  const originalSize = clone.querySelector(".og-size");
  originalSize.textContent = `originalSize: ${json.originalSize}`;
  const originalWidth = clone.querySelector(".og-width");
  originalWidth.textContent = `originalWidth: ${json.originalWidth}`;
  const resultWidth = clone.querySelector(".result-width");
  resultWidth.textContent = `resultWidth: ${json.resultWidth}`;
  const div = clone.querySelector(".img-wrap");

  div.appendChild(img);
  $root.appendChild(clone);
  $loading.textContent = "";
}

function calcDiff(before, after) {
  before = parseInt(before);
  after = parseInt(after);
  if (before > after) {
    const diff = before - after;
    const decimal = (diff / before).toFixed(4);
    return `${(decimal * 100).toFixed(2)}% decrease`;
  }

  const diff = before - after;
  const decimal = (diff / before).toFixed(2);

  return `${(decimal * 100).toFixed(2)}% increase`;
}

// form handler
$form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const value = document.getElementById("url").value.trim();
  if (
    !value.includes(COACH_DOMAIN) &&
    !value.includes(SW_DOMAIN) &&
    !value.includes(KS_DOMAIN)
  ) {
    document.getElementById("url").value = "";
    return alert("URL is not from a supported domain");
  }

  imgCode = value.split("?")[0];
  $csv.innerHTML = "";
  $root.innerHTML = "";
  $loading.textContent = "LOADING...";
  const data = await postToServer(presets)
    .then(awaitJson)
    .then((response) => response);
  await createAllImgs(data);
});
