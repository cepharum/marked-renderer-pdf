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

const { Renderer } = require( "marked" );

const Open = "\ue000";
const Close = "\ue001";
const Sep = "\ue002";

const createPattern = () => /[\u{e000}\u{e001}\u{e002}]/gu;

const AwaitOpener = "start of node";
const AwaitEOType = "end of type";
const AwaitEOName = "end of name";
const AwaitEOArg = "end of argument";


/**
 * @typedef {object} ASTContext
 * @property {string} code AST DSL sequence to be converted into AST
 * @property {int} index index into provided code of character to be processed next
 * @property {RegExp} pattern regular expression used to find next functional character
 * @property {?[string]} match latest match
 */

/**
 * @typedef {object} ASTNode
 * @property {?boolean} block indicates if node is representing block-level element
 * @property {?string} name provides type name of current node
 * @property {Array<Array<ASTNode>>} args lists arguments of node each consisting of one or more nodes
 */


/**
 * Implements renderer to be integrated with _marked_ for rendering abstract
 * syntax tree using special DSL to be compiled afterwards.
 *
 * @author Thomas Urban
 */
class ASTRenderer extends Renderer {
	/**
	 * Converts description of code block into AST DSL.
	 *
	 * @param {string} code AST DSL sequence describing actual code in block
	 * @param {string} language selected code language
	 * @param {string} escaped escaped version of code
	 * @returns {string} AST DSL sequence
	 */
	code( code, language, escaped ) {
		return Open + "1" + Sep + "code" + Sep + code + Sep + language + Sep + escaped + Close;
	}

	/**
	 * Converts description of quote block into AST DSL.
	 *
	 * @param {string} quote AST DSL sequence describing actual content of quote
	 * @returns {string} AST DSL sequence
	 */
	blockquote( quote ) {
		return Open + "1" + Sep + "blockquote" + Sep + quote + Close;
	}

	/**
	 * Converts block of raw HTML code into AST DSL.
	 *
	 * @param {string} html HTML code
	 * @returns {string} AST DSL sequence
	 */
	html( html ) {
		return Open + "1" + Sep + "html" + Sep + html + Close;
	}

	/**
	 * Converts heading block into AST DSL.
	 *
	 * @param {string} text AST DSL sequence describing content of heading
	 * @param {int} level level of heading, e.g. 1 for "h1"
	 * @param {string} raw unprocessed text content of heading e.g. for deriving IDs
	 * @returns {string} AST DSL sequence
	 */
	heading( text, level, raw ) {
		return Open + "1" + Sep + "heading" + Sep + text + Sep + level + Sep + raw + Close;
	}

	/**
	 * Generates AST DSL sequence describing horizontal ruler.
	 *
	 * @returns {string} AST DSL sequence
	 */
	hr() {
		return Open + "1" + Sep + "hr" + Close;
	}

	/**
	 * Converts provided description of list into AST DSL.
	 *
	 * @param {string} body AST DSL sequence describing body of list
	 * @param {boolean} ordered true if list is ordered/numbered
	 * @param {int} start number of first item in ordered list
	 * @returns {string} AST DSL sequence
	 */
	list( body, ordered, start ) {
		return Open + "1" + Sep + "list" + Sep + body + Sep + ( ordered ? "true" : "false" ) + Sep + String( start || 1 ) + Close;
	}

	/**
	 * Converts provided content of list item into AST DSL.
	 *
	 * @param {string} text AST DSL sequence describing content of list item
	 * @returns {string} AST DSL sequence
	 */
	listitem( text ) {
		return Open + "1" + Sep + "listitem" + Sep + text + Close;
	}

	/**
	 * Converts provided content of a paragraph into AST DSL.
	 *
	 * @param {string} text AST DSL sequence describing content of paragraph
	 * @returns {string} AST DSL sequence
	 */
	paragraph( text ) {
		return Open + "1" + Sep + "paragraph" + Sep + text + Close;
	}

	/**
	 * Converts provided content of a table into AST DSL.
	 *
	 * @param {string} header AST DSL sequence describing header of table
	 * @param {string} body AST DSL sequence describing body of table
	 * @returns {string} AST DSL sequence
	 */
	table( header, body ) {
		return Open + "1" + Sep + "table" + Sep + header + Sep + body + Close;
	}

	/**
	 * Converts provided row of a table into AST DSL.
	 *
	 * @param {string} content AST DSL sequence describing cells in a table row
	 * @returns {string} AST DSL sequence
	 */
	tablerow( content ) {
		return Open + "1" + Sep + "tablerow" + Sep + content + Close;
	}

	/**
	 * Converts provided cell of a table into AST DSL.
	 *
	 * @param {string} content AST DSL sequence describing cell of a table
	 * @param {boolean} header marks if cell is a header cell
	 * @param {string} align "left", "center" or "right"
	 * @returns {string} AST DSL sequence
	 */
	tablecell( content, { header, align } ) {
		return Open + "1" + Sep + "tablecell" + Sep + content + Sep + header + Sep + align + Close;
	}

	/**
	 * Converts provided inline content with strong emphasis into AST DSL.
	 *
	 * @param {string} text AST DSL describing inline content to be strongly emphasized
	 * @returns {string} AST DSL sequence
	 */
	strong( text ) {
		return Open + "0" + Sep + "strong" + Sep + text + Close;
	}

	/**
	 * Converts provided inline content with emphasis into AST DSL.
	 *
	 * @param {string} text AST DSL describing inline content to be emphasized
	 * @returns {string} AST DSL sequence
	 */
	em( text ) {
		return Open + "0" + Sep + "em" + Sep + text + Close;
	}

	/**
	 * Converts provided inline code into AST DSL.
	 *
	 * @param {string} code AST DSL describing inline code
	 * @returns {string} AST DSL sequence
	 */
	codespan( code ) {
		return Open + "0" + Sep + "codespan" + Sep + code + Close;
	}

	/**
	 * Generates AST DSL sequence describing simple linebreak.
	 *
	 * @returns {string} AST DSL sequence
	 */
	br() {
		return Open + "0" + Sep + "br" + Close;
	}

	/**
	 * Converts provided inline content marked as _deleted_ into AST DSL.
	 *
	 * @param {string} text AST DSL describing inline content marked as _deleted_
	 * @returns {string} AST DSL sequence
	 */
	del( text ) {
		return Open + "0" + Sep + "del" + Sep + text + Close;
	}

	/**
	 * Converts provided description of a link into AST DSL.
	 *
	 * @param {string} href URL of link target
	 * @param {string} title text describing link e.g. in a balloon tip
	 * @param {string} text AST DSL describing link text
	 * @returns {string} AST DSL sequence
	 */
	link( href, title, text ) {
		return Open + "0" + Sep + "link" + Sep + href + Sep + title + Sep + text + Close;
	}

	/**
	 * Converts provided description of an image into AST DSL.
	 *
	 * @param {string} href URL of image
	 * @param {string} title text describing image e.g. as a caption
	 * @param {string} text AST DSL describing link text
	 * @returns {string} AST DSL sequence
	 */
	image( href, title, text ) {
		return Open + "0" + Sep + "image" + Sep + href + Sep + title + Sep + text + Close;
	}

	/**
	 * Generates AST DSL sequence describing raw inline text.
	 *
	 * @param {string} text text to be described
	 * @returns {string} AST DSL sequence
	 */
	text( text ) {
		return text;
	}

	/**
	 * Creates AST node describing simple text.
	 *
	 * @param {ASTContext} context context of conversion
	 * @param {int} endBefore index into code of first item not to be extracted into simple text node
	 * @param {?int} startAt index into code of first item to be extracted instead of using start of provided context
	 * @returns {ASTNode} extracted text wrapped in an AST node structure
	 */
	static createTextASTNode( context, endBefore, startAt = null ) {
		if ( startAt == null ) {
			startAt = context.index;
		}

		return {
			block: false,
			name: "#text",
			text: context.code.substring( startAt, endBefore ),
			indices: {
				start: startAt,
				end: endBefore - 1,
			},
		};
	}

	/**
	 * Converts AST DSL sequence into loggable format replacing functional
	 * characters with ambiguous but printable sequences of characters.
	 *
	 * @param {string} code AST DSL sequence to be dumped
	 * @returns {string} dumpable version of provided sequence
	 */
	static dump( code ) {
		return code.replace( createPattern(), match => {
			switch ( match ) {
				case Open : return "{{";
				case Close : return "}}";
				case Sep : return "::";
				default : return "";
			}
		} );
	}

	/**
	 * Returns rendered AST with indented nodes.
	 *
	 * @param {ASTNode} ast root node of AST to be dumped on stdout
	 * @param {int} depth controls indentation, omit on initial invocation
	 * @returns {string} string rendered dump
	 */
	static dumpAST( ast, depth = [] ) {
		const keys = Object.keys( ast );
		const nameIndex = keys.indexOf( "name" );
		if ( nameIndex > 0 ) {
			keys.splice( nameIndex, 1 );
			keys.unshift( "name" );
		}

		let dump = "";
		const indent = depth.join( "" );

		for ( let i = 0, numKeys = keys.length; i < numKeys; i++ ) {
			const key = keys[i];
			if ( !ast.hasOwnProperty( key ) || key === "block" || key === "indices" ) {
				continue;
			}

			let value = ast[key];

			if ( key === "name" ) {
				dump += `${indent}name = "${value}" -> ${ast.block ? "block" : "inline"}\n`;
				continue;
			}

			switch ( typeof value ) {
				case "string" :
					value = `"${value}"`;

					// falls through
				case "number" :
					dump += `${indent}${key} = ${value}\n`;
					break;

				case "boolean" :
					dump += `${indent}${key} = ${value ? "true" : "false"}\n`;
					break;

				case "object" :
					if ( Array.isArray( value ) ) {
						dump += `${indent}${key} = [\n`;

						for ( let j = 0, numOuter = value.length; j < numOuter; j++ ) {
							const outer = value[j];

							if ( Array.isArray( outer ) ) {
								dump += `${indent}\t[\n`;
								for ( let k = 0, numInner = outer.length; k < numInner; k++ ) {
									dump += this.dumpAST( outer[k], depth.concat( [ "\t", "\t" ] ) );
								}
								dump += `${indent}\t],\n`;
							} else {
								dump += `${indent}\t{\n`;
								dump += this.dumpAST( outer, depth.concat( [ "\t", "\t" ] ) );
								dump += `${indent}\t},\n`;
							}
						}
						dump += `${indent}]\n`;
					} else if ( value ) {
						dump += `${indent}${key} = {\n`;
						dump += this.dumpAST( value, depth.concat( ["\t"] ) );
						dump += `${indent}}\n`;
					}
			}
		}

		return dump;
	}

	/**
	 * Converts AST from provided AST DSL sequence.
	 *
	 * @param {string|ASTContext} context AST DSL sequence to be converted, or conversion context passed on recursive invocation
	 * @returns {ASTNode} AST thread
	 */
	static generateAST( context ) {
		const isRoot = typeof context === "string";
		if ( isRoot ) {
			context = {
				code: context,
				index: 0,
				pattern: createPattern(),
			};
		}

		const nodes = [];

		let waitingFor = AwaitOpener;
		let node = null;
		let args = null;
		let keepSearching = true;

		while ( keepSearching ) {
			context.index = context.pattern.lastIndex;

			const match = context.match = context.pattern.exec( context.code );
			if ( match ) {
				switch ( match[0] ) {
					case Open :
						switch ( waitingFor ) {
							case AwaitOpener :
								if ( match.index > context.index ) {
									nodes.push( this.createTextASTNode( context, match.index ) );
								}

								node = {
									indices: {
										start: match.index,
									},
								};
								args = [];

								waitingFor = AwaitEOType;
								break;

							case AwaitEOType :
							case AwaitEOName :
								throw new TypeError( "AST: invalid sub-node in type or name" );

							case AwaitEOArg :
								throw new TypeError( "AST: unexpected beginning of a nested AST sequence" );
						}
						break;

					case Sep :
						switch ( waitingFor ) {
							case AwaitOpener :
								if ( isRoot ) {
									throw new TypeError( `AST: unexpected separator at ${match.index}` );
								}

								if ( match.index > context.index ) {
									nodes.push( this.createTextASTNode( context, match.index ) );
								}

								keepSearching = false;
								break;

							case AwaitEOType :
								node.block = Boolean( parseInt( context.code.substring( context.index, match.index ) ) );
								waitingFor = AwaitEOName;
								break;

							case AwaitEOName :
								node.name = context.code.substring( context.index, match.index ).trim();

								waitingFor = AwaitEOArg;
								while ( waitingFor === AwaitEOArg ) {
									const subs = this.generateAST( context );
									const subMatch = context.match;

									if ( Array.isArray( subs ) && subs.length ) {
										args.push( subs );

										switch ( subMatch[0] ) { // eslint-disable-line max-depth
											case Open :
												throw new TypeError( `AST: unexpected start of another node at #${subMatch.index}` );

											case Close :
												waitingFor = AwaitOpener;
										}
									} else {
										throw new TypeError( `AST: unexpected functional character at #${subMatch.index}` );
									}
								}

								nodes.push( this.normalizeNode( node, args ) );

								node = args = null;
								break;

							case AwaitEOArg :
								throw new TypeError( `AST: invalid state of AST converter at #${match.index}` );
						}
						break;

					case Close :
						switch ( waitingFor ) {
							case AwaitOpener :
								if ( match.index > context.index ) {
									nodes.push( this.createTextASTNode( context, match.index ) );
								}

								keepSearching = false;
								break;

							case AwaitEOType :
								throw new TypeError( `AST: sequence at #${node.indices.open} prematurely ends w/o type at #${match.index}` );

							case AwaitEOName :
								node.name = context.code.substring( context.index, match.index ).trim();

								nodes.push( this.normalizeNode( node ) );

								node = args = null;
								waitingFor = AwaitOpener;
								break;

							case AwaitEOArg :
								break;
						}
						break;
				}
			} else {
				// met end of code ...
				keepSearching = false;

				const endOfCode = context.code.length;

				switch ( waitingFor ) {
					case AwaitOpener :
						if ( isRoot ) {
							if ( endOfCode > context.index ) {
								nodes.push( this.createTextASTNode( context, endOfCode ) );
							}

							break;
						}

						throw new TypeError( `AST: unexpected end of code at #${endOfCode}` );

					case AwaitEOType :
						throw new TypeError( `AST: unexpected end of code at #${endOfCode} on extracting type of node` );

					case AwaitEOName :
						throw new TypeError( `AST: unexpected end of code at #${endOfCode} on extracting name of node` );

					case AwaitEOArg :
						throw new TypeError( `AST: unexpected end of code at #${endOfCode} on extracting optional arguments of node` );
				}
			}
		}

		return isRoot ? {
			block: true,
			name: "#root",
			subs: nodes.length ? [nodes] : [],
		} : nodes;
	}

	/**
	 * Injects sequential list of extracted arguments of node using properties
	 * named according to either found node.
	 *
	 * @param {ASTNode} node node to be qualified/normalized
	 * @param {Array<ASTNode[]>} args sequential list of arguments to node
	 * @returns {ASTNode} qualified/normalized AST node, reference on same object as provided in `node`
	 */
	static normalizeNode( node, args = [] ) {
		switch ( node.name ) {
			case "hr" :
			case "br" :
				break;

			case "blockquote" : {
				const [quote] = args;
				node.quote = quote;
				break;
			}

			case "html" : {
				const [html] = args;
				node.html = html;
				break;
			}

			case "codespan" : {
				const [code] = args;
				node.code = code;
				break;
			}

			case "listitem" :
			case "paragraph" :
			case "strong" :
			case "em" :
			case "del" : {
				const [text] = args;
				node.text = text;
				break;
			}

			case "code" : {
				const [ code, language, escaped ] = args;
				node.code = code;
				node.language = language;
				node.escaped = escaped;
				break;
			}

			case "heading" : {
				const [ text, level, raw ] = args;
				node.text = text;
				node.level = level;
				node.raw = raw;
				break;
			}

			case "list" : {
				const [ items, ordered, start ] = args;
				const reduced = reduceText( ordered );
				node.items = items;
				node.ordered = reduced && reduced !== "false";
				node.start = parseInt( reduceText( start ) );
				break;
			}

			case "table" : {
				const [ header, body ] = args;
				node.header = header;
				node.body = body;
				break;
			}

			case "tablerow" : {
				const [content] = args;
				node.content = content;
				break;
			}

			case "tablecell" : {
				const [ content, header, align ] = args;
				const reduced = reduceText( header );
				node.content = content;
				node.header = reduced && reduced !== "false";
				node.align = detectNull( reduceText( align ) );
				break;
			}

			case "link" :
			case "image" : {
				const [ href, title, text ] = args;
				node.href = reduceText( href );
				node.title = reduceText( title );
				node.text = text;
				break;
			}
		}

		return node;

		/**
		 * Detects and normalizes string representing `null` value.
		 *
		 * @param {*} value value optionally containing "null"
		 * @returns {*|null} null if value is null or "null", provided value otherwise
		 */
		function detectNull( value ) {
			return value === "null" ? null : value;
		}

		/**
		 * Reduces (sequence of) AST node(s) describing inline `#text` values
		 * into regular string providing concatenated content of all processed
		 * node(s).
		 *
		 * @param {ASTNode|ASTNode[]} ast node(s) to be processed
		 * @param {boolean} force set true to force reduction even though there are non-`#text` nodes in provided sequence of node
		 * @returns {string|ASTNode|ASTNode[]} reduced content of provided node(s) or provided node(s) if reduction wasn't applicable
		 */
		function reduceText( ast, force = false ) {
			if ( Array.isArray( ast ) ) {
				if ( force || ast.every( n => n.name === "#text" ) ) {
					return ast.map( n => n.text || "" ).join( "" );
				}

				return ast;
			}

			return ast && ast.name === "#text" ? ast.text || null : ast;
		}
	}
}

module.exports = ASTRenderer;
