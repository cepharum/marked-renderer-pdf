/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

"use strict";


const File = require( "fs" );
const Me = require( "." );

const md = `
This is _some_ **simple _test_** text.

* An outer list
* which is unordered  
  and has line breaks
  1. might contain a subordinated list
  2. which should be
  3. properly \`rendered\` even _though **containing ~some~**_ **extra ~styled~** text
     * and show line  
       breaks as well
  4. and has to deal with continuation in
* superordinated lists

  and with paragraphs put in a list.
  
---

# Todos

1. Support headings.
1. Support tables.
2. Support blockquotes.
3. Support fenced blocks.
   1. Check __marked__ for supporting it in parser.
   2. _Optional:_ Contribute to add support for fenced divs in __marked__.
4. Support mermaid for injecting diagrams into PDFs.
  
| name | description |
| --- | --- |
| Thomas | CEO |
| Simon | CCO |
`;

Me.convertString( md )
	.then( doc => {
		doc.pipe( File.createWriteStream( "test.pdf" ) );

		return doc.end();
	} )
	.catch( error => console.error( error ) ); // eslint-disable-line no-console
