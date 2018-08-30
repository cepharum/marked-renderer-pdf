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

const PDF = require( "pdfjs" );
const DefaultTheme = require( "../theme" );
const merge = require( "./merge" );

const defaultOptions = {
	theme: DefaultTheme,
};


/**
 * Implements marked parser generating PDF.
 *
 * @note Marked parser work recursively which is sufficient text-based
 *       generation of HTML, but fails to cope with APIs like the one provided
 *       by pdfjs.
 *
 * @author Thomas Urban
 */
class PdfGenerator {
	/**
	 * @param {object} options generator customizations
	 */
	constructor( options = {} ) {
		options = merge( {}, defaultOptions, options );

		if ( !options.theme ) {
			throw new TypeError( "missing theme" );
		}

		let { document } = options;
		if ( !document || !( document instanceof PDF.Document ) ) {
			document = new PDF.Document( options );
		}

		const theme = new options.theme( document, options ); // eslint-disable-line new-cap
		if ( !( theme instanceof DefaultTheme ) ) {
			throw new TypeError( "invalid theme" );
		}

		Object.defineProperties( this, {
			/**
			 * Exposes instance of generated PDF document.
			 *
			 * @name PdfGenerator#document
			 * @property {PDF.Document}
			 * @readonly
			 */
			document: { value: document },

			/**
			 * Exposes instance of theme to be applied on generated PDF.
			 *
			 * @name PdfGenerator#theme
			 * @property {DefaultTheme}
			 * @readonly
			 */
			theme: { value: theme },

			/**
			 * Exposes customizations provided on constructing PDF generator.
			 *
			 * @name PdfGenerator#options
			 * @property {object}
			 * @readonly
			 */
			options: { value: Object.freeze( options ) },
		} );
	}

	/**
	 * Generates PDF from provided list of markdown tokens.
	 *
	 * @param {ASTNode} ast AST describing structure of document
	 * @param {object} options generator customizations
	 * @returns {PDF.Document} generated PDF document
	 */
	static generate( ast, options ) {
		return new PdfGenerator( options ).generate( ast );
	}

	/**
	 * Generates PDF from provided list of markdown tokens.
	 *
	 * @param {ASTNode} ast AST describing structure of document
	 * @returns {PDF.Document} generated PDF document
	 */
	generate( ast ) {
		if ( !ast || !ast.name === "#root" ) {
			throw new TypeError( "invalid AST for generating PDF" );
		}

		const subs = ast.subs;
		const numSubs = subs.length;

		for ( let i = 0; i < numSubs; i++ ) {
			const sub = subs[i];

			for ( let j = 0, numSubItems = sub.length; j < numSubItems; j++ ) {
				this.generateNode( sub[j], {}, j, numSubItems );
			}
		}

		this.theme.onFinish();

		return this.document;
	}

	/**
	 * Generates fragment of PDF document representing provided AST node, only.
	 *
	 * @param {ASTNode} node node to be rendered in PDF
	 * @param {object} context data object providing contextual information on node
	 * @param {int} indexInLevel 0-based index of node to be generated into list of nodes in same hierarchical level as the node itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as node to be generated
	 * @returns {void}
	 */
	generateNode( node, context, indexInLevel, numItemsInLevel ) {
		const myContext = Object.assign( {}, context );
		const nodeName = node.name;

		switch ( nodeName ) {
			case "paragraph" : {
				this.theme.enterParagraph( indexInLevel, numItemsInLevel );

				for ( let i = 0, numNodes = node.text.length; i < numNodes; i++ ) {
					this.generateNode( node.text[i], myContext, i, numNodes );
				}

				this.theme.leaveParagraph();
				break;
			}

			case "list" : {
				const items = node.items;
				const numItems = items.length;

				myContext.list = {
					ordered: node.ordered,
					start: node.start,
					index: 0,
					numItems,
					depth: ( myContext.list && myContext.list.depth + 1 ) || 0,
				};

				this.theme.enterList( node.ordered, myContext.list.depth, node.start, myContext.numItems, indexInLevel, numItemsInLevel );

				for ( let i = 0; i < numItems; i++ ) {
					this.generateNode( items[i], myContext, i, numItems );
				}

				this.theme.leaveList();
				break;
			}

			case "listitem" : {
				const ctx = myContext.list;

				this.theme.enterListItem( ctx.ordered, ctx.depth, ctx.start + ctx.index, ctx.index, ctx.numItems );

				const subs = node.text;
				const numSubs = subs.length;

				for ( let i = 0; i < numSubs; i++ ) {
					this.generateNode( subs[i], myContext, i, numSubs );
				}

				ctx.index++;

				this.theme.leaveListItem();
				break;
			}

			case "table" : {
				const { header, body } = node;
				const numHeaderRows = header.length;
				const numBodyRows = body.length;

				this.theme.enterTable( header[0].cells.length, numHeaderRows, numBodyRows, indexInLevel, numItemsInLevel );

				for ( let i = 0; i < numHeaderRows; i++ ) {
					this.generateNode( header[i], myContext, i, numHeaderRows );
				}

				for ( let i = 0; i < numBodyRows; i++ ) {
					this.generateNode( body[i], myContext, i, numBodyRows );
				}

				this.theme.leaveTable();
				break;
			}

			case "tablerow" : {
				const { cells } = node;
				const numCells = cells.length;

				this.theme.enterTableRow( numCells, cells[numCells - 1].header, indexInLevel, numItemsInLevel );

				for ( let i = 0; i < numCells; i++ ) {
					this.generateNode( cells[i], myContext, i, numCells );
				}

				this.theme.leaveTableRow();
				break;
			}

			case "tablecell" : {
				this.theme.enterTableCell( Boolean( node.header ), node.align || "left", indexInLevel, numItemsInLevel );

				const { content } = node;

				for ( let i = 0, numSubs = content.length; i < numSubs; i++ ) {
					this.generateNode( content[i], myContext, i, numSubs );
				}

				this.theme.leaveTableCell();
				break;
			}

			case "heading" : {
				const { level, text } = node;

				this.theme.enterHeading( level, indexInLevel, numItemsInLevel );

				for ( let i = 0, numSubs = text.length; i < numSubs; i++ ) {
					this.generateNode( text[i], myContext, i, numSubs );
				}

				this.theme.leaveHeading();
				break;
			}

			case "br" :
				this.theme.linebreak();
				break;

			case "hr" :
				this.theme.ruler( indexInLevel, numItemsInLevel );
				break;

			case "codespan" :
			case "em" :
			case "strong" :
			case "del" : {
				const styleName = {
					strong: "Bold",
					em: "Italic",
					del: "Strikethrough",
					codespan: "Monospace",
				}[nodeName];

				this.theme["enter" + styleName]( indexInLevel, numItemsInLevel );
				myContext[nodeName] = true;

				const subs = nodeName === "codespan" ? node.code : node.text;
				const numSubs = subs.length;

				for ( let i = 0; i < numSubs; i++ ) {
					this.generateNode( subs[i], myContext, i, numSubs );
				}

				this.theme["leave" + styleName]();
				break;
			}

			case "#text" :
				this.theme.text( node.text, indexInLevel, numItemsInLevel );
				break;
		}
	}
}

module.exports = PdfGenerator;
