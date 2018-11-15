# marked-renderer-pdf

Converts Markdown to PDF.

This package contains a custom renderer for [marked](https://www.npmjs.com/package/marked) generating AST of parsed markdown document. This AST is then used to generate PDF documents with [pdfjs](https://www.npmjs.com/package/pdfjs).

**This converter does not converting markdown to HTML, first, to be converted to PDF using some headless browser afterwards.** The conversion works offline. Due to either involved dependency working in a client's browser this tool might completely work in a client's browser, too, if this project's code is prepared for running in browser (basically requiring transpiling and some packaging).

# Installation

```bash
npm i P marked-renderer-pdf
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

This converter works in browser without any server-side backend involved. 

You may use a published archive or build one yourself. In either case you might use the converter in an HTML document like this:

```html
<a id="some-link"></a>
<script type="text/javascript" src="path/to/markdown-to-pdf/converter.min.js"></script>
<script type="text/javascript">
MarkdownToPdf
	.convertString( "some **structured _text_** using markdown syntax" )
	.then( function( pdf ) { 
		const link = document.getElementById( "some-link" );

		link.href = URL.createObjectURL( new Blob( [pdf], {
			type: "application/pdf",
		} ) );
	} );
</script>
```

## Build It Yourself

Install the package as described before. Then run

```bash
npm run build-browser
```

This script is creating a folder `/dist` containing an HTML document providing sandbox for testing conversion live in browser. In addition there is a file `main.js` which is equal to the file `converter.min.js` in a deployed version.

# License

MIT
