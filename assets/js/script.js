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

async function createAllImgs(presets) {
  for (const preset of presets) {
    const img = new Image();
    const url = `https://images.coach.com/is/image/Coach/${imgCode}${
      preset ? "?" + preset : ""
    }`;
    img.src = url;
    const template = document.querySelector("#product");
    const fileImg = await fetch(img.src).then((r) => r.blob());
    console.log(fileImg);
    console.log(img.width, img.height);

    const clone = template.content.cloneNode(true);
    const h2 = clone.querySelector("h2");

    h2.textContent = preset || "No Preset";
    const type = clone.querySelector(".type");
    type.textContent = fileImg.type;
    const size = clone.querySelector(".size");
    size.textContent = `${(fileImg.size / Math.pow(1024, 1)).toFixed(2)} kb`;
    const a = clone.querySelector("a");
    a.href = url;
    a.textContent = url;
    const div = clone.querySelector(".img-wrap");
    div.appendChild(img);
    document.querySelector("#root").appendChild(clone);
  }
}

createAllImgs(presets);

const form = document.getElementById("url-check");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = document.getElementById("url").value.trim();

  let split = value.substring(40).split("?");

  imgCode = split[0];
  document.getElementById("root").innerHTML = "";
  createAllImgs(presets);
});
