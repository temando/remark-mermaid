const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const which = require('which');
const execSync = require('child_process').execSync;

const PLUGIN_NAME = 'remark-mermaid';

/**
 * Accepts the `source` of the graph as a string, and render an SVG using
 * mermaid.cli. Returns the path to the rendered SVG.
 *
 * @param  {string} source
 * @param  {string} destination
 * @return {string}
 */
function render(source, destination, asString) {
  const unique = crypto.createHmac('sha1', PLUGIN_NAME).update(source).digest('hex');
  const mmdcExecutable = which.sync('mmdc');
  const mmdPath = path.join(destination, `${unique}.mmd`);
  const svgFilename = `${unique}.svg`;
  const svgPath = path.join(destination, svgFilename);

  // Write temporary file
  fs.outputFileSync(mmdPath, source);

  // Invoke mermaid.cli
  execSync(`${mmdcExecutable} -i ${mmdPath} -o ${svgPath} -b transparent`);

  // Clean up temporary file
  fs.removeSync(mmdPath);

  if (asString) {
    const string = fs.readFileSync(svgPath, { encoding: 'utf-8' });
    fs.removeSync(svgPath);
    return string;
  }

  return `./${svgFilename}`;
}

/**
 * Accepts the path `inputFile` to the graph, and render an SVG using
 * mermaid.cli. Returns the path to the rendered SVG.
 *
 * @param  {string} inputFile
 * @param  {string} destination
 * @return {string}
 */
function renderFromFile(inputFile, destination) {
  const unique = crypto.createHmac('sha1', PLUGIN_NAME).update(inputFile).digest('hex');
  const mmdcExecutable = which.sync('mmdc');
  const svgFilename = `${unique}.svg`;
  const svgPath = path.join(destination, svgFilename);

  // Invoke mermaid.cli
  execSync(`${mmdcExecutable} -i ${inputFile} -o ${svgPath} -b transparent`);

  return `./${svgFilename}`;
}

/**
 * Returns the destination for the SVG to be rendered at, explicity defined
 * using `vFile.data.destinationDir`, or falling back to the file's current
 * directory.
 *
 * @param {vFile} vFile
 * @return {string}
 */
function getDestinationDir(vFile) {
  if (vFile.data.destinationDir) {
    return vFile.data.destinationDir;
  }

  return vFile.dirname;
}

/**
 * Given the contents, returns a MDAST representation of a HTML node.
 *
 * @param  {string} contents
 * @return {object}
 */
function createMermaidDiv(contents) {
  return {
    type: 'html',
    value: `<div class="mermaid">
  ${contents}
</div>`,
  };
}

module.exports = {
  createMermaidDiv,
  getDestinationDir,
  render,
  renderFromFile,
};
