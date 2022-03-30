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

async function checkForAkamaiStaging(url) {
  const request = new Request(url);
  // request.headers.append("Pragma", "x-im-piez");
  // request.headers.append("Access-Control-Allow-Origin", "*");
  // request.headers.append(
  //   "Access-Control-Allow-Methods",
  //   "DELETE, POST, GET, OPTIONS"
  // );
  // request.headers.append(
  //   "Access-Control-Allow-Headers",
  //   "Content-Type, Authorization, X-Requested-With"
  // );

  const response = await fetch(request, {
    headers: {
      "x-im-piez": "on",
      "x-akamai-ro-piez": "on",
      Pragma:
        "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-true-cache-key, akamai-x-serial-no, akamai-x-get-request-id, akamai-x-get-client-ip, x-akamai-cpi-trace, x-akamai-a2-trace,akamai-x-im-trace, akamai-x-feo-trace,akamai-x-tapioca-trace,x-akamai-a2-trace,akamai-x-ro-trace, akamai-x-get-brotli-status, akamai-x-im-trace",
    },
  });

  console.log(response.headers.get("x-akamai-staging"));
}

async function createAllImgs(presets) {
  for (const preset of presets) {
    const img = new Image();
    const url = `https://images.coach.com/is/image/Coach/${imgCode}${
      preset ? "?" + preset : ""
    }`;
    img.src = url;
    const template = document.querySelector("#product");
    console.log(url);
    const response = await fetch("http://localhost:3000/api/url", {
      method: "POST",
      body: JSON.stringify(url),
    });

    const json = await response.json();

    let fileImg = await fetch(img.src, {
      "x-im-piez": "on",
      "x-akamai-ro-piez": "on",
      Pragma:
        "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-true-cache-key, akamai-x-serial-no, akamai-x-get-request-id, akamai-x-get-client-ip, x-akamai-cpi-trace, x-akamai-a2-trace,akamai-x-im-trace, akamai-x-feo-trace,akamai-x-tapioca-trace,x-akamai-a2-trace,akamai-x-ro-trace, akamai-x-get-brotli-status, akamai-x-im-trace",
    });

    for (var pair of fileImg.headers.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    fileImg = await fileImg.blob();

    console.log(fileImg);
    console.log(img.width, img.height);

    const clone = template.content.cloneNode(true);
    const h2 = clone.querySelector("h2");

    h2.textContent = preset || "No Preset";
    const type = clone.querySelector(".type");
    type.textContent = fileImg.type;
    const size = clone.querySelector(".size");
    size.textContent = `${(fileImg.size / Math.pow(1024, 1)).toFixed(2)} kb`;
    const dimensions = clone.querySelector(".dimensions");
    dimensions.textContent = `width: ${img.width} height: ${img.height}`;
    const a = clone.querySelector("a");
    a.href = url;
    a.textContent = url;
    const div = clone.querySelector(".img-wrap");
    div.appendChild(img);
    document.querySelector("#root").appendChild(clone);
  }
}

createAllImgs(presets);
// checkForAkamaiStaging(`https://images.coach.com/is/image/Coach/${imgCode}`);

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
  document.getElementById("root").innerHTML = "";
  await createAllImgs(presets);
  // await checkForAkamaiStaging(
  //   `https://images.coach.com/is/image/Coach/${imgCode}`
  // );
});
