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
 * Implements API for exposing styling configuration as object for use with
 * content generators of `pdfjs`.
 */
class BoxModel {
	/**
	 * @param {object} configuration styling configuration to be provided in a normalized API
	 * @param {object} thisRef some object passed as `this` when invoking code generating values of configuration
	 * @param {...*} args lists arguments to pass on invoking code generating values of configuration
	 */
	constructor( configuration, thisRef = null, ...args ) {
		if ( typeof configuration === "function" ) {
			configuration = thisRef ? configuration.apply( thisRef, args ) : configuration( ...args );
		}

		Object.defineProperties( this, {
			/**
			 * Exposes width of padding inside box at its top edge.
			 *
			 * @name BoxModel#paddingTop
			 * @property {number}
			 * @readonly
			 */
			paddingTop: {
				get: () => {
					const source = configuration.paddingTopWidth || configuration.paddingTop || configuration.paddingWidth || configuration.padding || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of padding inside box at its right edge.
			 *
			 * @name BoxModel#paddingRight
			 * @property {number}
			 * @readonly
			 */
			paddingRight: {
				get: () => {
					const source = configuration.paddingRightWidth || configuration.paddingRight || configuration.paddingWidth || configuration.padding || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of padding inside box at its bottom edge.
			 *
			 * @name BoxModel#paddingBottom
			 * @property {number}
			 * @readonly
			 */
			paddingBottom: {
				get: () => {
					const source = configuration.paddingBottomWidth || configuration.paddingBottom || configuration.paddingWidth || configuration.padding || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of padding inside box at its left edge.
			 *
			 * @name BoxModel#paddingLeft
			 * @property {number}
			 * @readonly
			 */
			paddingLeft: {
				get: () => {
					const source = configuration.paddingLeftWidth || configuration.paddingLeft || configuration.paddingWidth || configuration.padding || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of margin inside box at its top edge.
			 *
			 * @name BoxModel#marginTop
			 * @property {number}
			 * @readonly
			 */
			marginTop: {
				get: () => {
					const source = configuration.marginTopWidth || configuration.marginTop || configuration.marginWidth || configuration.margin || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of margin inside box at its right edge.
			 *
			 * @name BoxModel#marginRight
			 * @property {number}
			 * @readonly
			 */
			marginRight: {
				get: () => {
					const source = configuration.marginRightWidth || configuration.marginRight || configuration.marginWidth || configuration.margin || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of margin inside box at its bottom edge.
			 *
			 * @name BoxModel#marginBottom
			 * @property {number}
			 * @readonly
			 */
			marginBottom: {
				get: () => {
					const source = configuration.marginBottomWidth || configuration.marginBottom || configuration.marginWidth || configuration.margin || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of margin inside box at its left edge.
			 *
			 * @name BoxModel#marginLeft
			 * @property {number}
			 * @readonly
			 */
			marginLeft: {
				get: () => {
					const source = configuration.marginLeftWidth || configuration.marginLeft || configuration.marginWidth || configuration.margin || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of border at top edge of box.
			 *
			 * @name BoxModel#borderTopWidth
			 * @property {number}
			 * @readonly
			 */
			borderTopWidth: {
				get: () => {
					const source = configuration.borderTopWidth || configuration.borderTop || configuration.borderWidth || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of border at right edge of box.
			 *
			 * @name BoxModel#borderRightWidth
			 * @property {number}
			 * @readonly
			 */
			borderRightWidth: {
				get: () => {
					const source = configuration.borderRightWidth || configuration.borderRight || configuration.borderWidth || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of border at bottom edge of box.
			 *
			 * @name BoxModel#borderBottomWidth
			 * @property {number}
			 * @readonly
			 */
			borderBottomWidth: {
				get: () => {
					const source = configuration.borderBottomWidth || configuration.borderBottom || configuration.borderWidth || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes width of border at left edge of box.
			 *
			 * @name BoxModel#borderLeftWidth
			 * @property {number}
			 * @readonly
			 */
			borderLeftWidth: {
				get: () => {
					const source = configuration.borderLeftWidth || configuration.borderLeft || configuration.borderWidth || 0;
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes color of border at top edge of box.
			 *
			 * @name BoxModel#borderTopColor
			 * @property {number}
			 * @readonly
			 */
			borderTopColor: {
				get: () => {
					const source = configuration.borderTopColor || configuration.borderColor || "#000000";
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes color of border at right edge of box.
			 *
			 * @name BoxModel#borderRightColor
			 * @property {number}
			 * @readonly
			 */
			borderRightColor: {
				get: () => {
					const source = configuration.borderRightColor || configuration.borderColor || "#000000";
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes color of border at bottom edge of box.
			 *
			 * @name BoxModel#borderBottomColor
			 * @property {number}
			 * @readonly
			 */
			borderBottomColor: {
				get: () => {
					const source = configuration.borderBottomColor || configuration.borderColor || "#000000";
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},

			/**
			 * Exposes color of border at left edge of box.
			 *
			 * @name BoxModel#borderLeftColor
			 * @property {number}
			 * @readonly
			 */
			borderLeftColor: {
				get: () => {
					const source = configuration.borderLeftColor || configuration.borderColor || "#000000";
					return typeof source === "function" ? thisRef ? source.apply( thisRef, args ) : source( ...args ) : source;
				},
				enumerable: true,
			},
		} );
	}
}

module.exports = BoxModel;
