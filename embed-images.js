/**
 * Reads images from Cursor assets and writes image-data.js with base64 data URLs.
 * Run once: node embed-images.js
 * Requires: images exist at the Cursor project assets path.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-super-OneDrive-Desktop-Celiene-s-bday",
  "assets"
);
const PREFIX =
  "c__Users_super_AppData_Roaming_Cursor_User_workspaceStorage_2b5812122bff0e57b82ecae62361194b_images_image-";

const FILES = [
  { key: "portrait", name: PREFIX + "a6cd4355-70a4-4b1f-91f0-ad3a8a15cdef.png" },
  { key: "scene1", name: PREFIX + "9e26b0d8-37a2-407f-bc11-03c40d2237fe.png" },
  { key: "scene2", name: PREFIX + "f8f3758a-4453-40e6-9cf3-e3a1a838fa39.png" },
  { key: "scene3", name: PREFIX + "013bff71-0fbc-42b6-aa69-7c97e3c1f14d.png" },
  { key: "gallery1", name: PREFIX + "3dffdf29-0a65-4b28-b445-2b6763160e19.png" },
  { key: "gallery2", name: PREFIX + "e654759e-70e2-45c0-a1e3-1b333cb61aa8.png" },
  { key: "gallery3", name: PREFIX + "bf199027-7eaf-4d06-b50a-24b8a3fca9e6.png" },
  { key: "gallery4", name: PREFIX + "c4280d24-9b3e-435f-8fea-3af079152c75.png" },
  { key: "gallery5", name: PREFIX + "b702c283-07c3-4ec7-bfd6-9e12ce6048e5.png" },
  { key: "gallery6", name: PREFIX + "f520d201-3ddb-42d1-b69f-0eb90ac05d18.png" },
  { key: "gallery7", name: PREFIX + "ba7f5d70-21b3-4072-a361-be687d8be611.png" },
  { key: "gallery8", name: PREFIX + "864a2530-10dc-45bc-bf89-a9af872f6bdb.png" },
];

const outPath = path.join(__dirname, "image-data.js");
let body = "window.BIRTHDAY_IMAGES = {\n";

let missing = [];
FILES.forEach(({ key, name }) => {
  const fullPath = path.join(SRC, name);
  if (fs.existsSync(fullPath)) {
    const b64 = fs.readFileSync(fullPath, "base64");
    body += '  ' + JSON.stringify(key) + ': "data:image/png;base64,' + b64 + '",\n';
  } else {
    missing.push(name);
  }
});

body += "};\n";

if (missing.length) {
  console.error("Missing files:", missing);
  process.exit(1);
}

fs.writeFileSync(outPath, body, "utf8");
console.log("Wrote " + outPath);
