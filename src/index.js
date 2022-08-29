// const fs = require('fs-extra');
const visit = require('unist-util-visit');
const utils = require('./utils');

const render = utils.render;
const renderFromFile = utils.renderFromFile;
const getDestinationDir = utils.getDestinationDir;
const createMermaidDiv = utils.createMermaidDiv;

const PLUGIN_NAME = 'remark-mermaid';

/**
 * Is this title `mermaid:`?
 *
 * @param  {string} title
 * @return {boolean}
 */
const isMermaid = title => title === 'mermaid:';

/**
 * Given a node which contains a `url` property (eg. Link or Image), follow
 * the link, generate a graph and then replace the link with the link to the
 * generated graph. Checks to ensure node has a title of `mermaid:` before doing.
 *
 * @param   {object}  node
 * @param   {vFile}   vFile
 * @return {object}
 */
function replaceUrlWithGraph(node, vFile) {
  const { title, url, position } = node;
  const { destinationDir } = vFile.data;

  // If the node isn't mermaid, ignore it.
  if (!isMermaid(title)) {
    return node;
  }

  try {
    // eslint-disable-next-line no-param-reassign
    node.url = renderFromFile(`${vFile.dirname}/${url}`, destinationDir);

    vFile.info('mermaid link replaced with link to graph', position, PLUGIN_NAME);
  } catch (error) {
    vFile.message(error, position, PLUGIN_NAME);
  }

  return node;
}

/**
 * Given a link to a mermaid diagram, grab the contents from the link and put it
 * into a div that Mermaid JS can act upon.
 *
 * @param  {object}   node
 * @param  {integer}  index
 * @param  {object}   parent
 * @param  {vFile}    vFile
 * @return {object}
 */
function replaceLinkWithEmbedded(node, index, parent, vFile) {
  const { title, url, position } = node;
  let newNode;

  // If the node isn't mermaid, ignore it.
  if (!isMermaid(title)) {
    return node;
  }

  // try {
  //   const value = fs.readFileSync(`${vFile.dirname}/${url}`, { encoding: 'utf-8' });

  //   newNode = createMermaidDiv(value);
  //   parent.children.splice(index, 1, newNode);
  //   vFile.info('mermaid link replaced with div', position, PLUGIN_NAME);
  // } catch (error) {
  //   vFile.message(error, position, PLUGIN_NAME);
  //   return node;
  // }

  return node;
}

/**
 * Given the MDAST ast, look for all fenced codeblocks that have a language of
 * `mermaid` and pass that to mermaid.cli to render the image. Replaces the
 * codeblocks with an image of the rendered graph.
 *
 * @param {object}  ast
 * @param {vFile}   vFile
 * @param {boolean} isSimple
 * @return {function}
 */
function visitCodeBlock(ast, vFile, isSimple) {
  return visit(ast, 'code', (node, index, parent) => {
    const { lang, value, position } = node;
    const destinationDir = getDestinationDir(vFile);
    let newNode;

    // If this codeblock is not mermaid, bail.
    if (lang !== 'mermaid') {
      return node;
    }

    // Are we just transforming to a <div>, or replacing with an image?
    if (isSimple) {
      newNode = createMermaidDiv(value);

      vFile.info(`${lang} code block replaced with div`, position, PLUGIN_NAME);

    // Otherwise, let's try and generate a graph!
    } else {
      let graphSvgFilename;
      try {
        graphSvgFilename = render(value, destinationDir);

        vFile.info(`${lang} code block replaced with graph`, position, PLUGIN_NAME);
      } catch (error) {
        vFile.message(error, position, PLUGIN_NAME);
        return node;
      }

      newNode = {
        type: 'image',
        title: '`mermaid` image',
        url: graphSvgFilename,
      };
    }

    parent.children.splice(index, 1, newNode);

    return node;
  });
}

/**
 * If links have a title attribute called `mermaid:`, follow the link and
 * depending on `isSimple`, either generate and link to the graph, or simply
 * wrap the graph contents in a div.
 *
 * @param {object}  ast
 * @param {vFile}   vFile
 * @param {boolean} isSimple
 * @return {function}
 */
function visitLink(ast, vFile, isSimple) {
  if (isSimple) {
    return visit(ast, 'link', (node, index, parent) => replaceLinkWithEmbedded(node, index, parent, vFile));
  }

  return visit(ast, 'link', node => replaceUrlWithGraph(node, vFile));
}

/**
 * If images have a title attribute called `mermaid:`, follow the link and
 * depending on `isSimple`, either generate and link to the graph, or simply
 * wrap the graph contents in a div.
 *
 * @param {object}  ast
 * @param {vFile}   vFile
 * @param {boolean} isSimple
 * @return {function}
 */
function visitImage(ast, vFile, isSimple) {
  if (isSimple) {
    return visit(ast, 'image', (node, index, parent) => replaceLinkWithEmbedded(node, index, parent, vFile));
  }

  return visit(ast, 'image', node => replaceUrlWithGraph(node, vFile));
}

/**
 * Returns the transformer which acts on the MDAST tree and given VFile.
 *
 * If `options.simple` is passed as a truthy value, the plugin will convert
 * to `<div class="mermaid">` rather than a SVG image.
 *
 * @link https://github.com/unifiedjs/unified#function-transformernode-file-next
 * @link https://github.com/syntax-tree/mdast
 * @link https://github.com/vfile/vfile
 *
 * @param {object} options
 * @return {function}
 */
function mermaid(options = {}) {
  const simpleMode = options.simple || false;

  /**
   * @param {object} ast MDAST
   * @param {vFile} vFile
   * @param {function} next
   * @return {object}
   */
  return function transformer(ast, vFile, next) {
    visitCodeBlock(ast, vFile, simpleMode);
    visitLink(ast, vFile, simpleMode);
    visitImage(ast, vFile, simpleMode);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = mermaid;
