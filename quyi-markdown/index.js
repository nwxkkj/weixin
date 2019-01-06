const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const chokidar = require("chokidar");
const matter = require("gray-matter");

/**
 * markdown
 */

const hljs = require("highlight.js");

const marked = require("marked");
function getHtml(md) {
  let meta = {};

  let stack = [];

  let renderer = new marked.Renderer();
  renderer.heading = function(text, level) {
    let index = stack.length;
    let anchor = `tocheader-${index}`;

    // stack
    stack.push({
      level: level,
      text: text,
      anchor: anchor
    });

    let header = "";
    if (level == 1) {
      meta.title = text;
    } else {
      header = `
  <h${level} class="title" data-index="${index}">
    <span>${text}</span>
  </h${level}>
  `;
    }

    return header;
  };

  renderer.paragraph = function(text) {
    return `<p>${text}</p>`;
  };

  renderer.blockquote = function(text) {
    return `<blockquote>${text}</blockquote>`;
  };

  renderer.list = function(body, ordered, start) {
    return `<ul>${body}</ul>`;
  };

  renderer.listitem = function(text) {
    return `<li><span><span>${text}</span></span></li>`;
  };

  renderer.link = function(href, title, text) {
    return `<a href="${href}" target="_blank">${text}</a>`;
  };

  // renderer.code = function(code, language, escaped) {
  //   return `<pre class="prettyprint"><code class="prettyprint">${code}</code></pre>`;
  // };

  const options = {
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false, // Sanitize the output. Ignore any HTML that has been input.
    smartLists: true,
    smartypants: true,
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    }
  };
  marked.setOptions(options);

  meta.html = marked(md);
  meta.stack = stack;
  return meta.html;
}

/**
 * template
 */

const nunjucks = require("nunjucks");
const pug = require("pug");
const ejs = require("ejs");

nunjucks.configure(`./template`, {
  autoescape: true
});

/**
 * beautify
 */

const beautify_js = require("js-beautify");
const beautify_css = require("js-beautify").css;
const beautify_html = require("js-beautify").html;

/**
 * watch
 */

const watcher = chokidar.watch("posts", {
  ignored: /(^|[\/\\])\../
});

watcher.on("all", async (event, src) => {
  let src_path_object = path.parse(src);

  switch (src_path_object.ext) {
    case ".md":
      let directory = src_path_object.dir.replace("posts", "dist");
      let dist = path.format({
        root: "",
        dir: directory,
        name: src_path_object.name,
        ext: ".html"
      });
      console.log(dist);

      try {
        await fse.ensureDir(directory);
        console.log("success!");
      } catch (err) {
        console.error(err);
      }

      md2html(src, dist, `./template/weixin.html`);
      break;
    default:
      console.log(src, "is not a markdown file");
  }
});

/**
 * md2html
 */
const md2html = async (src, dist, template) => {
  let env = nunjucks.configure(`./template`, {
    autoescape: false
  });

  let templateStr = await fse.readFile(template, "utf-8");
  let mdStr = await fse.readFile(src, "utf8");
  let file = matter(mdStr);
  let content = getHtml(file.content);
  htmlStr = env.renderString(templateStr, {
    meta: file.data,
    content: content
  });
  htmlStr = beautify_html(htmlStr, {
    indent_size: 2
  });

  fse.writeFile(dist, htmlStr);
};
