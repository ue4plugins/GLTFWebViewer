const fs = require("fs");
const path = require("path");
const fetch = require("sync-fetch");
const { getInstalledPathSync } = require("get-installed-path");

module.exports = function(moduleLicenses) {
  for (const { module, url } of moduleLicenses) {
    const moduleDir = getInstalledPathSync(module, { local: true });
    const filePath = path.join(moduleDir, path.basename(url));

    if (fs.existsSync(filePath)) {
      continue;
    }

    const licenseText = fetch(url);

    if (!licenseText.ok) {
      throw Error(`Could not download license text for ${module} at ${url}`);
    }

    fs.writeFileSync(filePath, licenseText.text());
  }
};
