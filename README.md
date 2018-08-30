# marked-renderer-pdf

Converts Markdown to PDF.

This package contains a custom renderer for [marked](https://www.npmjs.com/package/marked) generating AST of parsed markdown document. This AST is then used to generate PDF documents with [pdfjs](https://www.npmjs.com/package/pdfjs).

**This converter does not converting markdown to HTML, first, to be converted to PDF using some headless browser afterwards.** The conversion works offline. Due to either involved dependency working in a client's browser this tool might completely work in a client's browser, too, if this project's code is prepared for running in browser (basically requiring transpiling and some packaging).

# Installation

```bash
npm i -S marked-renderer-pdf
```

# Usage

```javascript
const File = require( "fs" );
const Converter = require( "marked-renderer-pdf" );

const md = `
This is _some_ **simple _test_** text.

* Here is an outer list
* which is unordered  
  and has line breaks and
  1. might contain a subordinated list
  2. which should be
  3. properly rendered even _though **containing ~extra~**_ **styled ~text~**
     * and support line  
       breaks as well
  4. and has to deal with continuation in
* superordinated lists  
  with more items.

## List of Employees

| first name | last name |
| --- | --- |
| John | Doe |
| Jane | Foo Bar |
`;


Converter.convertString( md, {
	smartyPants: true,
} )
	.then( doc => {
		doc.pipe( File.createWriteStream( "test.pdf" ) );

		return doc.end();
	} )
	.catch( error => console.error( error ) ); // eslint-disable-line no-console
```

# Features

This library relies on markdown flavours supported by [marked](https://www.npmjs.com/package/marked) and PDF rendering capabilities supported by [pdfjs](https://www.npmjs.com/package/pdfjs). It supports _themes_ implemented in code, thus enabling derived themes to implement a company's corporate design or similar.
 
# Browser Support

This library links [marked](https://www.npmjs.com/package/marked) with [pdfjs](https://www.npmjs.com/package/pdfjs). Either of these tools work in browser. This library is relying on ES6 syntax for simplified coding. Thus, using BabelJS or similar it should be possible to run the whole conversion in a browser.

# License

MIT
