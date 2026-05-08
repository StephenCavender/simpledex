module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/llms.txt");

  eleventyConfig.addGlobalData("webAppUrl", () => {
    return process.env.WEB_APP_URL || "http://localhost:3001";
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
