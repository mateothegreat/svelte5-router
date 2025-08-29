/** @type {import('puppeteer').Configuration} */
module.exports = {
  launch: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
};
