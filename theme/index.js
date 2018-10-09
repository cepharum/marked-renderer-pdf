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
const merge = require( "../lib/util/merge" );
const PdfStateTracker = require( "../lib/util/tracker" );
const BoxModel = require( "../lib/util/box" );
const TextStyle = require( "../lib/util/text-style" );


/**
 * Aggregates all implicitly available fonts.
 *
 * @type {InternalFonts}
 */
const Fonts = Object.freeze( {
	serif: Object.freeze( {
		regular: require( "pdfjs/font/Times-Roman" ),
		bold: require( "pdfjs/font/Times-Bold" ),
		italic: require( "pdfjs/font/Times-Italic" ),
		boldItalic: require( "pdfjs/font/Times-BoldItalic" ),
	} ),
	sansSerif: Object.freeze( {
		regular: require( "pdfjs/font/Helvetica" ),
		bold: require( "pdfjs/font/Helvetica-Bold" ),
		italic: require( "pdfjs/font/Helvetica-Oblique" ),
		boldItalic: require( "pdfjs/font/Helvetica-BoldOblique" ),
	} ),
	monospace: Object.freeze( {
		regular: require( "pdfjs/font/Courier" ),
		bold: require( "pdfjs/font/Courier-Bold" ),
		italic: require( "pdfjs/font/Courier-Oblique" ),
		boldItalic: require( "pdfjs/font/Courier-BoldOblique" ),
	} ),
	symbol: require( "pdfjs/font/ZapfDingbats" ),
} );

/**
 * Defines default options.
 *
 * @type {object}
 */
const DefaultOptions = {
	style: {
		font: {
			proportional: Fonts.sansSerif,
			monospace: Fonts.monospace,
			symbol: Fonts.symbol,
		},
		document: {
			padding: 2 * PDF.cm,
		},
		text: {
			fontFamily: {
				proportional: Fonts.sansSerif,
				monospace: Fonts.monospace,
			},
			fontSize: 11,
			lineHeight: 1.3,
			color: "#000000",
		},
		ruler: {
			width: 0.1,
			color: "black",
			indent: 2 * PDF.cm,
			paddingTop: 0,
			paddingBottom: 0.3 * PDF.cm,
		},
		paragraph: {
			marginTop: ( index, num ) => ( index < num - 1 ? 0.3 * PDF.cm : 0 ),
		},
		list: {
			item: {
				indent: 0.8 * PDF.cm,
				bulletPadding: 0.2 * PDF.cm,
				bulletAlign: "right",
				bulletFont: Fonts.sansSerif.regular,
				bullet: ( ordered, level ) => "\u2022\u25e6\u2013"[Math.min( 2, level )],
				index: ( ordered, level, index ) => ( level > 1 ? "%d)" : level > 0 ? "abcdefghijklmnopqrstuvwxyz"[index - 1] + "." : "%d." ),
			},
			paddingBottom: ( level, index, numItems ) => ( level > 0 ? 0 : index === numItems - 1 ? 0.3 * PDF.cm : 0 ),
		},
		table: {
			cellPadding: 5,
			borderHorizontalWidths: () => i => ( i < 2 ? 1 : 0.1 ),
			borderHorizontalColors: () => () => "#000000",
			borderVerticalWidths: numColumns => Array( numColumns + 1 ).fill( 0.5 ),
			borderVerticalColors: numColumns => [...Array( numColumns + 1 )].map( ( _, i ) => ( i % 2 ? "#ff0000" : "#0000ff" ) ),
			fontHeader: Fonts.sansSerif.bold,
			padding: {
				top: 0,
				bottom: ( cols, hRows, bRows, index, num ) => ( index < num - 1 ? 0.3 * PDF.cm : 0 ),
			},
		},
		heading: {
			fontFamily: Fonts.serif,
			fontSize: level => [ 36, 32, 24, 18, 18, 18 ][Math.min( 5, level - 1 )],
			bold: level => [ true, true, true, true, false, false ][Math.min( 5, level - 1 )],
			italic: false,
			lineHeight: 1.3,
			color: level => [ "#c30045", "#c30045", "#c30045", "#c30045", "#c30045", "#000000" ][Math.min( 5, level - 1 )],
			padding: {
				top: level => [ 72, 40, 30 ][Math.min( 2, level - 1 )],
				bottom: level => [ 24, 12, 12, 6 ][Math.min( 3, level - 1 )],
			},
			align: "left",
		},
	},
};



/**
 * Creates copy of provided object containing all properties but those with
 * value `null` or `undefined`.
 *
 * @param {object} source object to be filtered
 * @param {string[]} exclude lists names of properties to exclude explicitly
 * @returns {object} filtered object
 */
function filterObject( source, exclude = [] ) {
	const dest = {};
	const keys = Object.keys( source );
	const numKeys = keys.length;

	for ( let i = 0; i < numKeys; i++ ) {
		const key = keys[i];

		if ( key !== "__proto__" || exclude.indexOf( key ) > -1 ) {
			const value = source[key];
			if ( value != null ) {
				dest[key] = value;
			}
		}
	}

	return dest;
}



/**
 * @typedef {object} ContainerContext
 * @property {string} name type name of container
 * @property {object} info contextual information provided by container
 */

/**
 * @typedef {object} FontVariants
 * @property {object} regular
 * @property {object} bold
 * @property {object} italic
 * @property {object} boldItalic
 */

/**
 * @typedef {object} InternalFonts
 * @property {FontVariants} serif
 * @property {FontVariants} sansSerif
 * @property {FontVariants} monospace
 * @property {object} symbol
 */



/**
 * Implements default theme on generating PDF.
 *
 * @author Thomas Urban
 */
class DefaultTheme {
	/**
	 * @param {object} options theme customizations
	 */
	constructor( options = {} ) {
		options = merge( {}, DefaultOptions, options );


		let { document } = options;
		if ( !document || !( document instanceof PDF.Document ) ) {
			document = new PDF.Document( new BoxModel( options.style.document ) );
		}

		Object.defineProperties( this, {
			/**
			 * Refers to currently generated PDF document.
			 *
			 * @name DefaultTheme#document
			 * @property {PDF.Document}
			 * @readonly
			 */
			document: { value: document },
		} );


		const tracker = new PdfStateTracker( this );

		/**
		 * Manages LIFO of contextual PDF generation fragments.
		 *
		 * @type {Array<PDF.Fragment>}
		 */
		const context = [];


		const basicTextStyle = this._V( options.style.text );

		/**
		 * Manages LIFO of container contexts.
		 *
		 * @type {Array<ContainerContext>}
		 */
		const containers = [{
			name: "#root",
			info: {
				textStyle: new TextStyle( basicTextStyle.fontFamily, basicTextStyle ),
			},
		}];


		Object.defineProperties( this, {
			/**
			 * Exposes customizations provided on constructing theme.
			 *
			 * @name DefaultTheme#options
			 * @property {object}
			 * @readonly
			 */
			options: { value: Object.freeze( options ) },

			/**
			 * Exposes manager instance tracking state of generated PDF
			 * document.
			 *
			 * @name DefaultTheme#tracker
			 * @property {PdfStateTracker}
			 * @readonly
			 */
			tracker: { value: tracker },

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
			 * @property {PDF.Fragment|PDF.Document}
			 * @readonly
			 */
			context: { get: () => context[context.length - 1] || document },

			/**
			 * Enters context e.g. on creating new fragment of generated PDF.
			 *
			 * @name DefaultTheme#enterContext
			 * @property {function(PDF.Fragment):DefaultTheme}
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
			 * @property {ContainerContext[]}
			 * @readonly
			 */
			containers: { get: () => containers },

			/**
			 * Provides reference on information specific in context of current
			 * container.
			 *
			 * @name DefaultTheme#containerContext
			 * @property {object}
			 * @readonly
			 */
			containerContext: { get: () => containers[containers.length - 1].info },

			/**
			 * Detects if context is marked to be part of a semantic container
			 * in a hierarchy of nested containers.
			 *
			 * @name DefaultTheme#isInContainer
			 * @property {function(container:string):boolean}
			 * @readonly
			 */
			isInContainer: { value: container => containers.findIndex( c => c.name === container ) > -1 },

			/**
			 * Fetches type name of closest container of current PDF generation
			 * context.
			 *
			 * @name DefaultTheme#closestContainer
			 * @property {string}
			 * @readonly
			 */
			closestContainer: { get: () => containers[containers.length - 1].name },

			/**
			 * Counts number of containers matching provided name of container
			 * wrapping current context.
			 *
			 * @name DefaultTheme#isInContainer
			 * @property {function(container:string=):int}
			 * @readonly
			 */
			numOfContaining: { value: ( container = null ) => containers.filter( c => !container || c.name === container ).length },

			/**
			 * Marks entering another container in a hierarchy of nested
			 * containers.
			 *
			 * @name DefaultTheme#enterContainer
			 * @property {function(container:string):DefaultTheme}
			 * @readonly
			 */
			enterContainer: { value: container => {
				const srcContext = containers[containers.length - 1].info;

				containers.push( {
					name: container,
					info: merge( {}, srcContext ),
				} );
			} },

			/**
			 * Marks leaving previously entered container in a hierarchy of
			 * nested containers.
			 *
			 * @name DefaultTheme#leaveContainer
			 * @property {function():DefaultTheme}
			 * @readonly
			 */
			leaveContainer: { value: () => {
				if ( containers.length > 1 ) {
					containers.pop();
				}
			}, },
		} );

		this.onCreate();
	}

	/**
	 * Exposes default set of fonts available with any generated PDF document
	 * implicitly.
	 *
	 * @returns {InternalFonts} implicitly available fonts
	 */
	static get fonts() {
		return Fonts;
	}

	/**
	 * Handles support for optionally providing function instead of a value to be
	 * invoked for generating eventually desired value.
	 *
	 * @template T
	 * @param {T|function|object<string,T>} source some value to be fetched as-is, some set of values or some function generating value to be fetched
	 * @param {*[]} args arguments passed on invoking function in `source`
	 * @returns {T} fetched value
	 * @private
	 */
	_V( source, ...args ) {
		if ( typeof source === "object" && source.constructor.name === "Object" ) {
			const keys = Object.keys( source );
			const numKeys = keys.length;
			const dest = {};

			for ( let i = 0; i < numKeys; i++ ) {
				const key = keys[i];
				if ( key !== "__proto__" ) {
					const value = this._V( source[key], ...args );
					if ( value != null ) {
						dest[key] = value;
					}
				}
			}

			return dest;
		}

		if ( typeof source === "function" ) {
			return source.apply( this, args );
		}

		return source;
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
	 * Renders homogenically styled fragment of run text.
	 *
	 * @param {string} text text to be rendered
	 * @param {int} itemIndex 0-based index of paragraph into list of items on same hierarchical level as the paragraph itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as paragraph to be entered
	 * @returns {void}
	 */
	text( text, itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		if ( this.isInContainer( "table" ) && !this.isInContainer( "code" ) ) {
			text = text.replace( /<br\s*\/?>/ig, "\n" );
		}

		this.context.add( text, this.containerContext.textStyle.overload() );
	}

	/**
	 * Marks entering context of single paragraph on rendering fragment of PDF
	 * document.
	 *
	 * @param {int} itemIndex 0-based index of paragraph into list of items on same hierarchical level as the paragraph itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as paragraph to be entered
	 * @returns {void}
	 */
	enterParagraph( itemIndex, numItemsInLevel ) {
		const boxStyle = new BoxModel( this.options.style.paragraph, this, itemIndex, numItemsInLevel );

		if ( boxStyle.marginTop > 0 && !this.tracker.isAtTopOfPage && !this.tracker.isEmptyFragment( this.context ) ) {
			console.log( this.context.constructor.name, this.context._pending.length );
			this.context.cell( {
				paddingTop: boxStyle.marginTop,
			} );
		}

		const context = this.context.cell( boxStyle ).text();
		context.$boxStyle = boxStyle;

		this.enterContainer( "paragraph" );
		this.enterContext( context );
	}

	/**
	 * Marks leaving previously entered context of single paragraph on rendering
	 * fragment of PDF document.
	 *
	 * @returns {void}
	 */
	leaveParagraph() {
		const boxStyle = this.context.$boxStyle;

		this.leaveContainer();
		this.leaveContext();

		if ( boxStyle.marginBottom > 0 ) {
			if ( this.tracker.heightFitsOnPage( boxStyle.marginBottom ) ) {
				this.context.cell( {
					paddingBottom: boxStyle.marginBottom,
				} );
			} else {
				this.document.pageBreak();
			}
		}
	}

	/**
	 * Gets invoked prior to rendering whole list of items.
	 *
	 * @param {boolean} ordered true if list is ordered list
	 * @param {int} level depth of current item's list in a hierarchy of nested list
	 * @param {int} start number to show in front of item in an ordered list
	 * @param {int} numListItems number of items in list
	 * @param {int} itemIndex 0-based index of this list into list of items on same hierarchical level as this list
	 * @param {int} numItemsInLevel number of items in same hierarchical level as list to be entered
	 * @returns {void}
	 */
	enterList( ordered, level, start, numListItems, itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const listStyle = this.options.style.list;

		const cell = this.context.cell( {
			paddingBottom: this._V( listStyle.paddingBottom, ordered, level, start, numListItems, itemIndex, numItemsInLevel ),
		} );

		const indent = this._V( listStyle.item.indent, ordered, level, start, numListItems, itemIndex, numItemsInLevel );
		const bulletGap = this._V( listStyle.item.bulletPadding, ordered, level, start, numListItems, itemIndex, numItemsInLevel );

		this.enterContainer( "list" );
		this.enterContext( cell.table( {
			widths: [ indent - bulletGap, bulletGap, null ],
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
		const style = this.options.style;
		const listStyle = style.list;

		const row = this.context.row( {
			paddingBottom: this._V( listStyle.paddingBottom, level, index, numItems ),
		} );

		const textAlign = this._V( listStyle.item.bulletAlign, ordered, level, number, index, numItems );

		if ( ordered ) {
			const indexSource = this._V( listStyle.item.index, ordered, level, number, index, numItems );
			let indexString;

			if ( Array.isArray( indexSource ) ) {
				indexString = indexSource[Math.min( level, indexSource.length - 1 )];
			} else if ( typeof indexSource === "string" ) {
				indexString = indexSource;
			} else {
				indexString = String( number + "." );
			}

			row.cell().text( indexString.replace( /%d/g, () => number ), this.containerContext.textStyle.overload( { textAlign } ) );
		} else {
			const bulletSource = this._V( listStyle.item.bullet, ordered, level, number, index, numItems );
			let bullet;

			if ( Array.isArray( bulletSource ) ) {
				bullet = bulletSource[Math.min( level, bulletSource.length - 1 )];
			} else if ( typeof bulletSource === "string" ) {
				bullet = bulletSource;
			} else {
				bullet = String.fromCodePoint( 108 );
			}

			let font = this._V( listStyle.item.bulletFont, ordered, level, number, index, numItems );
			if ( !font ) {
				font = this._V( style.font.symbol, index, numItems );
			}

			row.cell().text( bullet, this.containerContext.textStyle.overload( { textAlign, font } ) );
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
	 * Gets invoked prior to rendering whole table.
	 *
	 * @param {int} numColumns number of columns in table
	 * @param {int} numRowsHeader number of rows in table's header
	 * @param {int} numRowsBody number of rows in table's body
	 * @param {int} itemIndex 0-based index of this table into list of items on same hierarchical level as this table
	 * @param {int} numItemsInLevel number of items in same hierarchical level as table to be entered
	 * @returns {void}
	 */
	enterTable( numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const tableStyle = this.options.style.table;
		const widths = Array( numColumns ).fill( null );
		const cell = this.context.cell( {
			paddingTop: this._V( tableStyle.padding.top ),
			paddingBottom: this._V( tableStyle.padding.bottom ),
		} );

		this.enterContainer( "table" );
		this.enterContext( cell.table( filterObject( {
			widths,
			borderHorizontalWidths: this._V( tableStyle.borderHorizontalWidths, numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ),
			borderVerticalWidths: this._V( tableStyle.borderVerticalWidths, numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ),
			borderHorizontalColors: this._V( tableStyle.borderHorizontalColors, numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ),
			borderVerticalColors: this._V( tableStyle.borderVerticalColors, numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ),
			padding: this._V( tableStyle.cellPadding, numColumns, numRowsHeader, numRowsBody, itemIndex, numItemsInLevel ),
		} ) ) );
	}

	/**
	 * Gets invoked after rendering whole table.
	 *
	 * @returns {void}
	 */
	leaveTable() {
		this.leaveContext();
		this.leaveContainer();
	}

	/**
	 * Gets invoked prior to rendering row of table.
	 *
	 * @param {int} numCells number of columns in table
	 * @param {boolean} header true if row is part of table's header
	 * @param {int} itemIndex 0-based index of this table into list of items on same hierarchical level as this table
	 * @param {int} numItemsInLevel number of items in same hierarchical level as table to be entered
	 * @returns {void}
	 */
	enterTableRow( numCells, header, itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		this.enterContext( header ? this.context.header() : this.context.row() );
		this.containerContext.headerRow = header;
		this.containerContext.rowIndex = itemIndex;
		this.containerContext.rowCount = numItemsInLevel;
	}

	/**
	 * Gets invoked after rendering row of table.
	 *
	 * @returns {void}
	 */
	leaveTableRow() {
		this.leaveContext();
	}

	/**
	 * Gets invoked prior to rendering cell of table.
	 *
	 * @param {boolean} isHeaderCell indicates if cell is a cell of table's header (though might be in table's body as a side header)
	 * @param {string} textAlign indicates desired aligning of cell's content, one out of "left", "right", "center"
	 * @param {int} itemIndex 0-based index of this table into list of items on same hierarchical level as this table
	 * @param {int} numItemsInLevel number of items in same hierarchical level as table to be entered
	 * @returns {void}
	 */
	enterTableCell( isHeaderCell, textAlign, itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const ctx = this.containerContext;
		const style = this.options.style;
		const tableStyle = style.table;
		let font = null;

		if ( isHeaderCell ) {
			font = this._V( tableStyle.fontHeader, textAlign, itemIndex, numItemsInLevel );
			if ( !font ) {
				ctx.textStyle.bold = true;

				ctx.tableCellRevokeBoldFont = true;
			}
		}

		this.enterContext( this.context.cell( {
			backgroundColor: ctx.headerRow ? null : ctx.rowIndex % 2 ? 0xf8f8f8 : 0xf0f0f0,
		} ).text( filterObject( { font, textAlign } ) ) );
	}

	/**
	 * Gets invoked after rendering cell of table.
	 *
	 * @returns {void}
	 */
	leaveTableCell() {
		this.leaveContext();

		const ctx = this.containerContext;

		if ( ctx.tableCellRevokeBoldFont ) {
			ctx.tableCellRevokeBoldFont = false;

			ctx.textStyle.bold = false;
		}
	}

	/**
	 * Gets invoked prior to rendering heading.
	 *
	 * @param {int} level 1-based level of heading
	 * @param {int} itemIndex 0-based index of this table into list of items on same hierarchical level as this table
	 * @param {int} numItemsInLevel number of items in same hierarchical level as table to be entered
	 * @returns {void}
	 */
	enterHeading( level, itemIndex, numItemsInLevel ) {
		const headingStyle = this.options.style.heading;

		this.enterContainer( "heading" );
		this.enterContext( this.context.cell( {
			paddingTop: this._V( headingStyle.padding.top, level, itemIndex, numItemsInLevel ),
			paddingBottom: this._V( headingStyle.padding.bottom, level, itemIndex, numItemsInLevel ),
		} ).text( {
			textAlign: this._V( headingStyle.align, level, itemIndex, numItemsInLevel ),
		} ) );

		const ctxStyle = this.containerContext.textStyle;
		const newStyle = this._V( headingStyle, level, itemIndex, numItemsInLevel );

		ctxStyle.fontFamily = newStyle.fontFamily;
		ctxStyle.bold = newStyle.bold;
		ctxStyle.italic = newStyle.italic;
		ctxStyle.fontSize = newStyle.fontSize;
		ctxStyle.lineHeight = newStyle.lineHeight;
		ctxStyle.color = newStyle.color;

		// replace style with clone adopting adjusted style as its default
		this.containerContext.textStyle = ctxStyle.clone();
	}

	/**
	 * Gets invoked after rendering heading.
	 *
	 * @returns {void}
	 */
	leaveHeading() {
		this.leaveContext();
		this.leaveContainer();
	}

	/**
	 * Gets invoked before rendering inline text using bold face.
	 *
	 * @param {int} indexInLevel index of current fragment into list of fragments on same level of document's hierarchy
	 * @param {int} numItemsInLevel number of fragments on same level of document's hierarchy
	 * @returns {void}
	 */
	enterBold( indexInLevel, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		this.containerContext.textStyle.bold = true;
	}

	/**
	 * Gets invoked after rendering inline text using bold face.
	 *
	 * @returns {void}
	 */
	leaveBold() {
		this.containerContext.textStyle.bold = null;
	}

	/**
	 * Gets invoked before rendering inline text using italic variant.
	 *
	 * @param {int} indexInLevel index of current fragment into list of fragments on same level of document's hierarchy
	 * @param {int} numItemsInLevel number of fragments on same level of document's hierarchy
	 * @returns {void}
	 */
	enterItalic( indexInLevel, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		this.containerContext.textStyle.italic = true;
	}

	/**
	 * Gets invoked after rendering inline text using italic variant.
	 *
	 * @returns {void}
	 */
	leaveItalic() {
		this.containerContext.textStyle.italic = null;
	}

	/**
	 * Gets invoked before rendering inline text using monospace font.
	 *
	 * @param {int} indexInLevel index of current fragment into list of fragments on same level of document's hierarchy
	 * @param {int} numItemsInLevel number of fragments on same level of document's hierarchy
	 * @returns {void}
	 */
	enterMonospace( indexInLevel, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		this.containerContext.textStyle.monospace = true;
	}

	/**
	 * Gets invoked after rendering inline text using monospace font.
	 *
	 * @returns {void}
	 */
	leaveMonospace() {
		this.containerContext.textStyle.monospace = null;
	}

	/**
	 * Gets invoked before rendering inline stricken-through text.
	 *
	 * @param {int} indexInLevel index of current fragment into list of fragments on same level of document's hierarchy
	 * @param {int} numItemsInLevel number of fragments on same level of document's hierarchy
	 * @returns {void}
	 */
	enterStrikethrough( indexInLevel, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		this.containerContext.textStyle.strikethrough = true;
	}

	/**
	 * Gets invoked after rendering inline stricken-through text.
	 *
	 * @returns {void}
	 */
	leaveStrikethrough() {
		this.containerContext.textStyle.strikethrough = null;
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
	 * @param {int} itemIndex 0-based index of node to be generated into list of nodes in same hierarchical level as the node itself
	 * @param {int} numItemsInLevel number of items in same hierarchical level as node to be generated
	 * @returns {void}
	 */
	ruler( itemIndex, numItemsInLevel ) { // eslint-disable-line no-unused-vars
		const style = this.options.style.ruler;

		this.context.cell( {
			paddingTop: this._V( style.paddingTop, itemIndex, numItemsInLevel ),
			paddingLeft: this._V( style.indent, itemIndex, numItemsInLevel ),
			paddingRight: this._V( style.indent, itemIndex, numItemsInLevel ),
		} )
			.cell( {
				borderTopColor: this._V( style.color, itemIndex, numItemsInLevel ),
				borderTopWidth: this._V( style.width, itemIndex, numItemsInLevel ),
				paddingBottom: this._V( style.paddingBottom, itemIndex, numItemsInLevel ),
			} );
	}
}

module.exports = DefaultTheme;
