function pad(source, length, padding) {
  if (!length || length <= source.length) {
    return source;
  }

  if (!padding) {
    padding = " ";
  }

  var padsLen = length - source.length;
  var padsNum = Math.ceil(padsLen / padding.length);
  var padsFull = padding.repeat(padsNum);
  var padsHalfPos = Math.floor(padsLen / 2);

  return (
    padsFull.slice(0, padsHalfPos) +
    source +
    padsFull.slice(0, padsLen - padsHalfPos)
  );
}

module.exports = function(modules) {
  modules.sort((left, right) => (left.name < right.name ? -1 : 1));

  const modulesMissingLicense = modules.filter(module => !module.licenseText);
  if (modulesMissingLicense.length) {
    // Necessary for the builds distributed by Epic Games, Inc.
    // TODO: add env var to disable this strict requirement.
    console.error(
      "Build aborted because of missing license texts for one or more modules:",
      modulesMissingLicense.map(module => module.name).join(", "),
    );
    process.exit(1);
  }

  var renderedText =
    "This build incorporates components from the npm packages listed below:\n";
  renderedText =
    modules.reduce((result, module, index) => {
      return `${result}\n${index + 1}. ${module.name} ${
        module.packageJson.version
      } (${module.packageJson.homepage ||
        module.packageJson.repository.url}), ${module.licenseId} License`;
    }, renderedText) + "\n\n";
  renderedText = modules.reduce((result, module) => {
    return module.licenseText
      ? `${result}\n${pad(
          ` BEGIN HERE LICENSE FOR ${module.name} `,
          80,
          "=",
        )}\n${module.licenseText +
          (module.licenseText.endsWith("\n") ? "" : "\n")}${pad(
          ` END OF LICENSE FOR ${module.name} `,
          80,
          "=",
        )}\n\n`
      : result;
  }, renderedText);
  return renderedText;
};
