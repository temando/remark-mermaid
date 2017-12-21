const path = require('path');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const toVFile = require('to-vfile');
const unified = require('unified');
const mermaid = require('../src/');

const fixturesDir = path.join(__dirname, '/fixtures');
const runtimeDir = path.join(__dirname, '/runtime');
const remark = unified().use(parse).use(stringify).freeze();

// Utility function to add metdata to a vFile.
function addMetadata(vFile, destinationFilePath) {
  vFile.data = {
    destinationFilePath,
    destinationDir: path.dirname(destinationFilePath),
  };
}

describe('remark-mermaid', () => {
  it('it ignores markdown that does not have mermaid references', () => {
    const srcFile = `${fixturesDir}/simple.md`;
    const destFile = `${runtimeDir}/simple.md`;
    const vfile = toVFile.readSync(srcFile);
    addMetadata(vfile, destFile);

    const result = remark().use(mermaid).processSync(vfile).toString();
    expect(result).not.toMatch(/!\[\]\(\.\/\w+\.svg/);
    expect(vfile.messages).toHaveLength(0);
  });

  it('can handle code blocks', () => {
    const srcFile = `${fixturesDir}/code-block.md`;
    const destFile = `${runtimeDir}/code-block.md`;
    const vfile = toVFile.readSync(srcFile);
    addMetadata(vfile, destFile);

    const result = remark().use(mermaid).processSync(vfile).toString();
    expect(result).toMatch(/!\[\]\(\.\/\w+\.svg/);
    expect(vfile.messages[0].message).toBe('mermaid code block replaced with graph');
  });

  it('can handle mermaid images', () => {
    const srcFile = `${fixturesDir}/image-mermaid.md`;
    const destFile = `${runtimeDir}/image-mermaid.md`;
    const vfile = toVFile.readSync(srcFile);
    addMetadata(vfile, destFile);

    const result = remark().use(mermaid).processSync(vfile).toString();
    expect(result).toMatch(/!\[Example\]\(\.\/\w+\.svg/);
    expect(vfile.messages[0].message).toBe('mermaid link replaced with link to graph');
  });

  it('can handle mermaid links', () => {
    const srcFile = `${fixturesDir}/link-mermaid.md`;
    const destFile = `${runtimeDir}/link-mermaid.md`;
    const vfile = toVFile.readSync(srcFile);
    addMetadata(vfile, destFile);

    const result = remark().use(mermaid).processSync(vfile).toString();
    expect(result).toMatch(/\[Example\]\(\.\/\w+\.svg/);
    expect(vfile.messages[0].message).toBe('mermaid link replaced with link to graph');
  });

  describe('simple mode', () => {
    it('can handle code blocks in simple mode', () => {
      const srcFile = `${fixturesDir}/code-block.md`;
      const destFile = `${runtimeDir}/code-block.md`;
      const vfile = toVFile.readSync(srcFile);
      addMetadata(vfile, destFile);

      const result = remark().use(mermaid, { simple: true }).processSync(vfile).toString();
      expect(result).toMatch(/class=\"mermaid\"/);
      expect(vfile.messages[0].message).toBe('mermaid code block replaced with div');
    });

    it('can handle mermaid images in simple mode', () => {
      const srcFile = `${fixturesDir}/image-mermaid.md`;
      const destFile = `${runtimeDir}/image-mermaid.md`;
      const vfile = toVFile.readSync(srcFile);
      addMetadata(vfile, destFile);

      const result = remark().use(mermaid, { simple: true }).processSync(vfile).toString();
      expect(result).toMatch(/class=\"mermaid\"/);
      expect(vfile.messages[0].message).toBe('mermaid link replaced with div');
    });

    it('can handle mermaid links in simple mode', () => {
      const srcFile = `${fixturesDir}/link-mermaid.md`;
      const destFile = `${runtimeDir}/link-mermaid.md`;
      const vfile = toVFile.readSync(srcFile);
      addMetadata(vfile, destFile);

      const result = remark().use(mermaid, { simple: true }).processSync(vfile).toString();
      expect(result).toMatch(/class=\"mermaid\"/);
      expect(vfile.messages[0].message).toBe('mermaid link replaced with div');
    });
  });
});
