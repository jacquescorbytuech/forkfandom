const htmlmin = require('html-minifier')

const { DateTime } = require("luxon");
const now = String(Date.now())
const pluginRss = require("@11ty/eleventy-plugin-rss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");


module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('styles/tailwind.config.js')
  eleventyConfig.addWatchTarget('styles/tailwind.css')
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addWatchTarget("src/images");

  let options = {
    html: true,
    breaks: true,
    linkify: true
  };

  let markdownLibrary = markdownIt(options).use(markdownItFootnote);

  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addShortcode('version', function () {
    return now
  })

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('DDD');
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)


  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })
      return minified
    }

    return content
  })

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    templateFormats: [ "md", "njk", "html", ],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };

}