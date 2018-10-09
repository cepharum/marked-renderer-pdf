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
 * Implement helpers used to inspect current state of generated PDF document.
 *
 * @name PdfStateTracker
 */
class PdfStateTracker {
	/**
	 * @param {DefaultTheme} theme refers to theme tracked document is generated with
	 */
	constructor( theme ) {
		Object.defineProperties( this, {
			/**
			 * Refers to theme generating tracked PDF document.
			 *
			 * @name PdfStateTracker#theme
			 * @property {DefaultTheme}
			 * @readonly
			 */
			theme: { value: theme },

			/**
			 * Refers to tracked PDF document.
			 *
			 * @name PdfStateTracker#document
			 * @property {PDF.Document}
			 * @readonly
			 */
			document: { value: theme.document },
		} );
	}

	/**
	 * Indicates if next element will be placed at top of (another) page's
	 * content.
	 *
	 * @returns {boolean} true if next content is placed at top of page
	 */
	get isAtTopOfPage() {
		const cursor = this.theme.context._cursor;

		return cursor.y === this.document.height - this.document.paddingTop;
	}

	/**
	 * Detects whether some cell with provided height fits on rest of current
	 * page or not.
	 *
	 * @param {number} height of some cell to be tested
	 * @returns {boolean} true if some cell with provide height might fit on page
	 */
	heightFitsOnPage( height ) {
		const cursor = this.document._cursor;

		return cursor.doesFit( height );
	}

	/**
	 * Detects if provided fragment does not yet contain any content.
	 *
	 * @param {PDF.Fragment} fragment fragment to be inspected
	 * @returns {boolean} true if fragment does not yet contain any content
	 */
	isEmptyFragment( fragment ) {
		return fragment._pending && fragment._pending.length < 2; // always containing "start of fragment" marker
	}

	/**
	 * Detects if provided fragment is first in its containing fragment.
	 *
	 * @param {PDF.Fragment} fragment fragment to be inspected
	 * @returns {boolean} true if fragment is first one of its containing fragment
	 */
	isFirstFragment( fragment ) {
		const { _parent } = fragment;
		if ( !_parent ) {
			return true;
		}

		const { _pending } = _parent;
		return _pending && _pending.length < 3; // always containing start of fragment and provided fragment
	}
}

module.exports = PdfStateTracker;
