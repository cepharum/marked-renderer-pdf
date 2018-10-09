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

/**
 * Manages current state of text rendering exposing up-to-date definition of
 * style for use with PDF generation API of `pdfjs`.
 *
 * @author Thomas Urban
 */
class TextStyle {
	/**
	 * @param {{proportional:FontVariants, monospace:FontVariants}} fontFamilies provides font families to expose
	 * @param {object} initialStyle initial/default value of style definition exposed by instance
	 * @param {object} initialState initial state of adjustable flags controlling certain aspects of current text styling
	 */
	constructor( fontFamilies, initialStyle = {}, initialState = {} ) {
		const fontMonospace = fontFamilies.monospace;
		let fontProportional = fontFamilies.proportional;

		let {
			fontSize,
			lineHeight,
			color,
			textAlign,
		} = initialStyle;

		let {
			bold,
			italic,
			monospace,
			strikethrough,
			underline
		} = initialState;

		Object.defineProperties( this, {
			/**
			 * Controls whether text is rendered using bold face, currently.
			 *
			 * @name TextStyle#bold
			 * @property {boolean}
			 */
			bold: {
				get: () => Boolean( bold ),
				set: newState => ( bold = newState == null ? initialState.bold : Boolean( newState ) ),
				enumerable: false,
			},

			/**
			 * Controls whether text is rendered using oblique face, currently.
			 *
			 * @name TextStyle#italic
			 * @property {boolean}
			 */
			italic: {
				get: () => Boolean( italic ),
				set: newState => ( italic = newState == null ? initialState.italic : Boolean( newState ) ),
				enumerable: false,
			},

			/**
			 * Controls whether text is rendered using monospace font family,
			 * currently.
			 *
			 * @name TextStyle#monospace
			 * @property {boolean}
			 */
			monospace: {
				get: () => Boolean( monospace ),
				set: newState => ( monospace = newState == null ? initialState.monospace : Boolean( newState ) ),
				enumerable: false,
			},

			/**
			 * Controls whether text is rendered stricken through.
			 *
			 * @name TextStyle#strikethrough
			 * @property {boolean}
			 */
			strikethrough: {
				get: () => Boolean( strikethrough ),
				set: newState => ( strikethrough = newState == null ? initialState.strikethrough : Boolean( newState ) ),
				enumerable: true,
			},

			/**
			 * Controls whether text is rendered with underline.
			 *
			 * @name TextStyle#underline
			 * @property {boolean}
			 */
			underline: {
				get: () => Boolean( underline ),
				set: newState => ( underline = newState == null ? initialState.underline : Boolean( newState ) ),
				enumerable: true,
			},

			/**
			 * Controls size of font in points.
			 *
			 * @name TextStyle#fontSize
			 * @property {number}
			 */
			fontSize: {
				get: () => parseFloat( fontSize ) || 11,
				set: newSize => ( fontSize = newSize == null ? initialStyle.fontSize : newSize ),
				enumerable: true,
			},

			/**
			 * Controls relative line height of text.
			 *
			 * @name TextStyle#lineHeight
			 * @property {number}
			 */
			lineHeight: {
				get: () => parseFloat( lineHeight ) || 1.3,
				set: newSize => ( lineHeight = newSize == null ? initialStyle.lineHeight : newSize ),
				enumerable: true,
			},

			/**
			 * Controls color of text.
			 *
			 * @name TextStyle#color
			 * @property {string}
			 */
			color: {
				get: () => color || "#000000",
				set: newColor => ( color = newColor == null ? initialStyle.color : newColor ),
				enumerable: true,
			},

			/**
			 * Controls alignment of text (working in a block-level context,
			 * only).
			 *
			 * @name TextStyle#textAlign
			 * @property {string}
			 */
			textAlign: {
				get: () => textAlign || "left",
				set: newAlign => ( textAlign = newAlign == null ? initialStyle.textAlign : newAlign ),
				enumerable: true,
			},

			/**
			 * Controls font family used for rendering proportional text.
			 *
			 * @name TextStyle#fontFamily
			 * @property {FontVariants}
			 */
			fontFamily: {
				get: () => fontProportional,
				set: newFamily => ( fontProportional = newFamily == null ? fontFamilies.proportional : newFamily ),
				enumerable: false,
			},

			/**
			 * Selects current font to use for rendering text according to
			 * current text styling.
			 *
			 * @name TextStyle#font
			 * @property {object}
			 * @readonly
			 */
			font: {
				get: () => {
					const family = monospace ? fontMonospace : fontProportional;

					return bold ? italic ? family.boldItalic : family.bold : italic ? family.italic : family.regular;
				},
				enumerable: true,
			},

			/**
			 * Creates clone of current descriptor.
			 *
			 * @name TextStyle#clone
			 * @property {function():TextStyle}
			 * @readonly
			 */
			clone: {
				value: () => {
					return new TextStyle( {
						monospace: fontMonospace,
						proportional: fontProportional,
					}, {
						fontSize,
						lineHeight,
						color,
						textAlign,
					}, {
						bold,
						italic,
						monospace,
						strikethrough,
						underline,
					} );
				},
				enumerable: false,
			},
		} );
	}

	/**
	 * Extracts current style in a regular object merging properties of provided
	 * overlay object in preference over internally managed ones.
	 *
	 * @param {object} overlay set of properties to be merged
	 * @returns {object} extracted style of current instance merged with provided overlay
	 */
	overload( overlay = {} ) {
		const result = {};

		const myKeys = Object.keys( this );
		const numMyKeys = myKeys.length;

		for ( let i = 0; i < numMyKeys; i++ ) {
			const key = myKeys[i];

			if ( !overlay.hasOwnProperty( key ) || overlay[key] == null ) {
				result[key] = this[key];
			}
		}

		const overlayKeys = Object.keys( overlay );
		const numOverlayKeys = overlayKeys.length;

		for ( let i = 0; i < numOverlayKeys; i++ ) {
			const key = overlayKeys[i];

			if ( key !== "__proto__" && overlay[key] != null ) {
				result[key] = overlay[key];
			}
		}

		return result;
	}
}

module.exports = TextStyle;
