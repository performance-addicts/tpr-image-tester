let imgCode = "cd527_b4bk_a0";

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

async function postToServer(presets) {
  const responses = [];
  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];

    const url = `https://images.coach.com/is/image/Coach/${imgCode}${
      preset ? "?" + preset : ""
    }`;
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

// postToServer(presets)
//   .then(awaitJson)
//   .then((response) => console.log("TEST", response));

async function createAllImgs(responses) {
  for (const response of responses) {
    const img = new Image();

    img.src = response.url;
    const template = document.querySelector("#product");

    const clone = template.content.cloneNode(true);
    writeHTML(clone, response.preset, img, response, response.url);
  }
}

(async () => {
  const data = await postToServer(presets)
    .then(awaitJson)
    .then((response) => response);
  await createAllImgs(data);
  document.querySelector("#root h1").innerHTML = "<h1></h1>";
})();

const form = document.getElementById("url-check");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = document.getElementById("url").value.trim();
  if (!value.includes("images.coach.com")) {
    document.getElementById("url").value = "";
    return alert("URL does not contain images.coach.com");
  }
  let split = value.substring(40).split("?");

  imgCode = split[0];
  document.querySelector("#root").innerHTML = "";
  document.querySelector("#loading").textContent = "LOADING...";
  const data = await postToServer(presets)
    .then(awaitJson)
    .then((response) => response);
  await createAllImgs(data);
});

function writeHTML(clone, preset, img, json, url) {
  const h2 = clone.querySelector("h2");

  h2.textContent = preset || "No Preset";
  const type = clone.querySelector(".type");
  type.textContent = json.contentType;
  const size = clone.querySelector(".size");
  size.textContent = `${(
    parseInt(json.contentLength) / Math.pow(1024, 1)
  ).toFixed(2)} kb`;
  const dimensions = clone.querySelector(".dimensions");
  dimensions.textContent = `width: ${img.width} height: ${img.height}`;
  const a = clone.querySelector("a");
  a.href = url;
  a.textContent = url;
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
  document.querySelector("#root").appendChild(clone);
  document.querySelector("#loading").textContent = "";
}

function calcDiff(before, after) {
  before = parseInt(before);
  after = parseInt(after);
  if (before > after) {
    const diff = before - after;
    console.log(diff);
    const decimal = (diff / before).toFixed(4);
    console.log(decimal);
    return `${(decimal * 100).toFixed(2)}% decrease`;
  }

  const diff = before - after;
  const decimal = (diff / before).toFixed(2);

  return `${(decimal * 100).toFixed(2)}% increase`;
}
