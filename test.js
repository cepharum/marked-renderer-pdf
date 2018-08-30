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
# Example Document

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

  and with paragraphs put in a list containing lots of special characters. -- äöüÄÖÜßáé€$ôâ§%#

## Long Text with Arbitrary Linebreaks in Markdown
  
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur 
ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa 
quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, 
arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis 
pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend 
tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam 
lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus 
varius laoreet. Quisque rutrum. Aenean imperdiet. 
Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. 
Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, 
sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, 
hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.  
Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget 
eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec 
sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, 

---
  
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur 
ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa 
quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, 
arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis 
pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend 
tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam 
lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus 
varius laoreet. Quisque rutrum. Aenean imperdiet. 
Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. 
Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, 
sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, 
hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.  
Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget 
eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec 
sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, 

\`\`\`html
<div class="important">some html<br>with a linebreak</div>
\`\`\`

## To **dos** and _planned_ features

1. Support headings.
1. ~Support tables.~
2. Support blockquotes.
3. Support fenced blocks.
   1. Check __marked__ for supporting it in parser.
   2. _Optional:_ Contribute to add support for fenced divs in __marked__.
4. Support mermaid for injecting diagrams into PDFs.
4. Add custom code language like mermaid to describe and render printable forms.
4. Showing ellipsis ...

### List of Involved Employees

| name | role | salary |
| --- |:---:| ---:|
| John | reporter | $40.000 |
| Jane | developer | $48.000 |
| Jonah | CTO | **$96.000** |
| Jason | architect | $76.000 |
| Jill | developer | $52.000 |
| Jeremy | developer | $64.000 |
| Janet | reporter<br><br>(external) | $45.000 |
| July | CEO | **$128.000** |
| Joseph | reporter | $48.000 |
| Jennifer | developer | $52.000 |
`;

Me.convertString( md, {
	smartypants: true,
} )
	.then( doc => {
		doc.pipe( File.createWriteStream( "test.pdf" ) );

		return doc.end();
	} )
	.catch( error => console.error( error ) ); // eslint-disable-line no-console
