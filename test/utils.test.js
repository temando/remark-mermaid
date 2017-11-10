const fs = require('fs');
const path = require('path');
const toVFile = require('to-vfile');
const { render, renderFromFile, getDestinationDir } = require('../src/utils');

const fixturesDir = path.join(__dirname, '/fixtures');
const runtimeDir = path.join(__dirname, '/runtime');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

// Utility function to add metdata to a vFile.
function addMetadata(vFile, destinationFilePath) {
  vFile.data = {
    destinationFilePath,
    destinationDir: path.dirname(destinationFilePath),
  };
}

describe('remark-mermaid utils', () => {
  it('renders a mermaid graph', () => {
    const mermaidExample = fs.readFileSync(`${fixturesDir}/example.mmd`, 'utf8');
    let renderedGraphFile;

    try {
      renderedGraphFile = render(mermaidExample, runtimeDir);
    } catch (err) {
      console.error(err.message);
    }

    expect(renderedGraphFile).not.toBeUndefined();
  });

  it('renders from a file a mermaid graph', () => {
    let renderedGraphFile;

    try {
      renderedGraphFile = renderFromFile(`${fixturesDir}/example.mmd`, runtimeDir);
    } catch (err) {
      console.error(err.message);
    }

    expect(renderedGraphFile).not.toBeUndefined();
  });

  it('handles explicity set destination', () => {
    const srcFile = `${fixturesDir}/code-block.md`;
    const destFile = `${runtimeDir}/code-block.md`;
    const vfile = toVFile.readSync(srcFile);
    addMetadata(vfile, destFile);

    expect(getDestinationDir(vfile)).toEqual(runtimeDir);
  });

  it('handles fallback destination', () => {
    const srcFile = `${fixturesDir}/code-block.md`;
    const vfile = toVFile.readSync(srcFile);

    expect(getDestinationDir(vfile)).toEqual(fixturesDir);
  });
});
