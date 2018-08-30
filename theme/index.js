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
const merge = require( "../lib/merge" );

const defaultOptions = {
	borders: {
		top: 2.5,
		left: 2.5,
		right: 2.5,
		bottom: 2.5,
	},
	style: {
		font: {
			size: 11,
			regular: require( "pdfjs/font/Helvetica" ),
			bold: require( "pdfjs/font/Helvetica-Bold" ),
			italic: require( "pdfjs/font/Helvetica-Oblique" ),
			boldItalic: require( "pdfjs/font/Helvetica-BoldOblique" ),
			mono: require( "pdfjs/font/Courier" ),
			monoBold: require( "pdfjs/font/Courier-Bold" ),
			monoItalic: require( "pdfjs/font/Courier-Oblique" ),
			monoBoldItalic: require( "pdfjs/font/Courier-BoldOblique" ),
			symbol: require( "pdfjs/font/ZapfDingbats" ),
		},
		ruler: {
			width: 0.1,
			color: "black",
			indent: 2 * PDF.cm,
			paddingTop: 0,
			paddingBottom: 0.3 * PDF.cm,
		},
		paragraph: {
			paddingBottom: 0.3 * PDF.cm,
		},
		list: {
			item: {
				indent: 0.8 * PDF.cm,
				bulletPadding: 0.2 * PDF.cm,
				bulletAlign: "right",
				bulletFont: require( "pdfjs/font/Helvetica" ),
				bullet: ( ordered, level ) => ( level > 1 ? "\u2013" : "\u2022\u25e6"[level] ),
				index: ( ordered, level, index ) => ( level > 1 ? "%d)" : level > 0 ? "abcdefghijklmnopqrstuvwxyz"[index - 1] + "." : "%d." ),
			},
			paddingBottom: 0.3 * PDF.cm,
		},
	},
};


/**
 * Implements default theme on generating PDF.
 *
 * @author Thomas Urban
 */
class DefaultTheme {
	/**
	 * @param {PDF.Document} document document to be populated by theme
	 * @param {object} options theme customizations
	 */
	constructor( document, options = {} ) {
		if ( !document || !( document instanceof PDF.Document ) ) {
			throw new TypeError( "invalid PDF document" );
		}

		options = merge( {}, defaultOptions, options );

		const context = [];
		const containers = [];

		Object.defineProperties( this, {
			/**
			 * Refers to currently generated PDF document.
			 *
			 * @name DefaultTheme#document
			 * @property {PDF.Document}
			 * @readonly
			 */
			document: { value: document },

			/**
			 * Exposes customizations provided on constructing theme.
			 *
			 * @name DefaultTheme#options
			 * @property {object}
			 * @readonly
			 */
			options: { value: Object.freeze( options ) },

			/**
			 * Provides storage for contextual information to be used by theme
			 * on demand.
			 *
			 * @name DefaultTheme#data
			 * @property {object}
			 * @readonly
			 */
			data: { value: {} },

			/**
			 * Refers to container in generated document content is being
			 * appended to.
			 *
			 * @name DefaultTheme#context
			 * @property {object|PDF.Document}
			 * @readonly
			 */
			context: { get: () => context[context.length - 1] || document, },

			/**
			 * Enters context e.g. on creating new fragment of generated PDF.
			 *
			 * @name DefaultTheme#enterContext
			 * @property {function(object):DefaultTheme}
			 * @readonly
			 */
			enterContext: { value: newContext => {
				context.push( newContext );

				return this;
			} },

			/**
			 * Leaves most recently entered context.
			 *
			 * @name DefaultTheme#leaveContext
			 * @property {function():DefaultTheme}
			 * @readonly
			 */
			leaveContext: { value: () => {
				context.pop();

				return this;
			} },

			/**
			 * Lists semantic containers in markdown of current context.
			 *
			 * @name DefaultTheme#containers
			 * @property {string[]}
			 * @readonly
			 */
			containers: { get: () => containers, },

			/**
			 * Detects if context is marked to be part of a semantic container
			 * in a hierarchy of nested containers.
			 *
			 * @name DefaultTheme#isInContainer
			 * @property {function(container:string):boolean}
			 * @readonly
			 */
			isInContainer: { value: container => containers.indexOf( container ) > -1 },

			/**
			 * Counts number of containers matching provided name of container
			 * wrapping current context.
			 *
			 * @name DefaultTheme#isInContainer
			 * @property {function(container:string=):int}
			 * @readonly
			 */
			numOfContaining: { value: ( container = null ) => containers.filter( n => ( !container || n === container ) ).length },

			/**
			 * Marks entering another container in a hierarchy of nested
			 * containers.
			 *
			 * @name DefaultTheme#enterContainer
			 * @property {function(container:string):DefaultTheme}
			 * @readonly
			 */
			enterContainer: { value: container => containers.push( container ), },

			/**
			 * Marks leaving previously entered container in a hierarchy of
			 * nested containers.
			 *
			 * @name DefaultTheme#leaveContainer
			 * @property {function():DefaultTheme}
			 * @readonly
			 */
			leaveContainer: { value: () => containers.pop(), },
		} );

		this.onCreate();
	}

	/**
	 * Handles initial preparation of freshly created document.
	 *
	 * @returns {void}
	 */
	onCreate() {
		this.document
			.header()
			.cell().text( new Date().toDateString(), { textAlign: "right" } );

		this.document
			.footer()
			.pageNumber(
				( curr, total ) => curr + " / " + total,
				{ textAlign: "center" }
			);
	}

	/**
	 * Handles final processing of document.
	 *
	 * @returns {void}
	 */
	onFinish() {} // eslint-disable-line no-empty-function

	/**
	 * Marks entering context of single paragraph on rendering fragment of PDF
	 * document.
	 *
	 * @param {int} index 0-based index of paragraph into list of items on same hierarchical level as the paragraph itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as paragraph to be entered
	 * @returns {void}
	 */
	enterParagraph( index, numItemsInLevel ) {
		this.enterContainer( "paragraph" );
		this.enterContext( this.context.cell( {
			paddingBottom: index < numItemsInLevel - 1 ? this.options.style.paragraph.paddingBottom : 0,
		} ).text() );
	}

	/**
	 * Marks leaving previously entered context of single paragraph on rendering
	 * fragment of PDF document.
	 *
	 * @returns {void}
	 */
	leaveParagraph() {
		this.leaveContainer();
		this.leaveContext();
	}

	/**
	 * Renders homogenically styled fragment of run text.
	 *
	 * @param {string} text text to be rendered
	 * @param {boolean} italic true if text should be rendered italic/oblique
	 * @param {boolean} bold true if text should be rendered using bold face
	 * @param {boolean} strikethrough true if text should be rendered stricken through
	 * @param {boolean} underline true if text should be rendered with underline
	 * @param {boolean} monospace true if text should be rendered with monospace font face
	 * @returns {void}
	 */
	text( text, { italic = false, bold = false, strikethrough = false, underline = false, monospace = false } = {} ) {
		const fonts = this.options.style.font;
		let font;

		if ( monospace ) {
			font = italic ? bold ? fonts.monoBoldItalic : fonts.monoItalic : bold ? fonts.monoBold : fonts.mono;
		} else {
			font = italic ? bold ? fonts.boldItalic : fonts.italic : bold ? fonts.bold : fonts.regular;
		}

		this.context.add( text, {
			font,
			fontSize: fonts.size,
			strikethrough: Boolean( strikethrough ),
			underline: Boolean( underline ),
		} );
	}

	/**
	 * Gets invoked prior to rendering whole list of items.
	 *
	 * @param {boolean} ordered true if list is ordered list
	 * @param {int} level depth of current item's list in a hierarchy of nested list
	 * @param {int} start number to show in front of item in an ordered list
	 * @param {int} numListItems number of items in list
	 * @param {int} listIndex 0-based index of this list into list of items on same hierarchical level as this list
	 * @param {int} numItemsInLevel number of items in same hierarchical level as list to be entered
	 * @returns {void}
	 */
	enterList( ordered, level, start, numListItems, listIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const style = this.options.style.list;
		const cell = this.context.cell( {
			paddingBottom: listIndex < numItemsInLevel - 1 ? this.options.style.paragraph.paddingBottom : 0,
		} );

		this.enterContainer( "list" );
		this.enterContext( cell.table( {
			widths: [ style.item.indent - style.item.bulletPadding, style.item.bulletPadding, null ],
		} ) );
	}

	/**
	 * Gets invoked after rendering whole list of items.
	 *
	 * @returns {void}
	 */
	leaveList() {
		this.leaveContext();
		this.leaveContainer();
	}

	/**
	 * Gets invoked prior to every rendering of a list item in a list of items.
	 *
	 * @param {boolean} ordered true if list is ordered list
	 * @param {int} level depth of current item's list in a hierarchy of nested list
	 * @param {int} number number to show in front of item in an ordered list
	 * @param {int} index 0-based index of item into list of items
	 * @param {int} numItems number of items in list
	 * @returns {void}
	 */
	enterListItem( ordered, level, number, index, numItems ) {
		const style = this.options.style.list;

		const row = this.context.row( {
			paddingBottom: level > 0 ? 0 : index === numItems - 1 ? style.paddingBottom : 0,
		} );

		if ( ordered ) {
			const indexSource = style.item.index;
			let indexString;

			if ( typeof indexSource === "function" ) {
				indexString = indexSource( ordered, level, number );
			} else if ( Array.isArray( indexSource ) ) {
				indexString = indexSource[Math.min( level, indexSource.length - 1 )];
			} else if ( typeof indexSource === "string" ) {
				indexString = indexSource;
			} else {
				indexString = String( number + "." );
			}

			row.cell().text( indexString.replace( /%d/g, () => number ), {
				textAlign: style.item.bulletAlign,
			} );
		} else {
			const bulletSource = style.item.bullet;
			let bullet;

			if ( typeof bulletSource === "function" ) {
				bullet = bulletSource( ordered, level, number );
			} else if ( Array.isArray( bulletSource ) ) {
				bullet = bulletSource[Math.min( level, bulletSource.length - 1 )];
			} else if ( typeof bulletSource === "string" ) {
				bullet = bulletSource;
			} else {
				bullet = String.fromCodePoint( 108 );
			}

			row.cell().text( bullet, {
				textAlign: style.item.bulletAlign,
				font: style.item.bulletFont || this.options.style.font.symbol,
			} );
		}

		row.cell();

		this.enterContext( row.cell().text() );
	}

	/**
	 * Gets invoked after rendering of every item in a list of items.
	 *
	 * @returns {void}
	 */
	leaveListItem() {
		this.leaveContext();
	}

	/**
	 * Renders table containing provided set of rows in header and in body.
	 *
	 * @param {object[]} header rows in table's header
	 * @param {object[]} body rows in table's body
	 * @returns {void}
	 */
	table( header, body ) { // eslint-disable-line no-unused-vars
	}

	/**
	 * Generates linebreak in current context of document generation.
	 *
	 * @returns {void}
	 */
	linebreak() {
		this.context.br();
	}

	/**
	 * Renders horizontal ruler.
	 *
	 * @param {int} indexInLevel 0-based index of node to be generated into list of nodes in same hierarchical level as the node itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as node to be generated
	 * @returns {void}
	 */
	ruler( indexInLevel, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const style = this.options.style.ruler;

		this.context.cell( {
			paddingTop: style.paddingTop,
			paddingLeft: style.indent,
			paddingRight: style.indent,
		} )
			.cell( {
				borderTopColor: style.color,
				borderTopWidth: style.width,
				paddingBottom: style.paddingBottom,
			} );
	}
}

module.exports = DefaultTheme;
