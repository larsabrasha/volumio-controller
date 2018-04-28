// credit card: 85.60 × 53.98 mm
// A4:          210 x 297 mm

const pageMargin = 28.34645669291339; // (10 mm / 25.4 mm/inch * 72 px/inch)
const imageWidth = 153.01417322834644; // (53.98 mm / 25.4 mm/inch * 72 px/inch)
const imageMargin = 0.5;
const columnGap = 1;

const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf"
  }
};

const PdfPrinter = require("pdfmake");
const printer = new PdfPrinter(fonts);
const fs = require("fs");
var find = require("find");

if (process.argv.length <= 2) {
  console.error('Directory argument is missing');
  process.exit(1);
}

var directory = process.argv[2];
console.log('Searching for album art in directory: ' + directory);

var outputFile = process.argv.length >= 4 ? process.argv[3] : "albums.pdf";

var files = find.fileSync(/cover.(jpg|png)$/, directory);
if (files) {
  var images = files.map(file => ({
    image: file,
    width: imageWidth,
    margin: imageMargin
  }));

  var numberOfColums = 3;
  var numberOfRows = Math.ceil(images / 3);
}
console.log("Found " + files.length + " number of files.");

function listToMatrix(list, elementsPerSubArray) {
  var matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

var images2d = listToMatrix(images, 3);
var content = images2d.map(row => ({ columns: row }));

var docDefinition = {
  pageSize: "A4",
  pageMargins: pageMargin,
  content: content,
  footer: function(currentPage, pageCount) {
    return {
      text: currentPage.toString() + " of " + pageCount,
      alignment: "center"
    };
  },
  defaultStyle: {
    columnGap: columnGap
  }
};

console.log("Generating " + outputFile);

var pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream(outputFile));
pdfDoc.end();

console.log('Done.');
