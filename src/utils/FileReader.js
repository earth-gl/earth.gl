const isNode = require("./isNode");

const FileReader2  = isNode?require("filereader"):FileReader;

module.exports = FileReader2;