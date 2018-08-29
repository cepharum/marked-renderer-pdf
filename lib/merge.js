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
 * Deeply merges one or more objects into a provided destination.
 *
 * @param {object} dest successively modified target object
 * @param {object[]} sources sources to be merged into target object
 * @returns {object} reference on object provided in `dest`
 */
function _merge( dest, ...sources ) {
	return _submerge( dest, sources, [] );

	/**
	 * Deeply merges one or more objects into a provided destination.
	 *
	 * @param {object} dst successively modified target object
	 * @param {object[]} srcList sources to be merged into target object
	 * @param {Array} path path of superordinated source values (used for detecting circular references)
	 * @returns {object} reference on object provided in `dest`
	 */
	function _submerge( dst, srcList, path ) {
		for ( let sourceIndex = 0, numSources = srcList.length; sourceIndex < numSources; sourceIndex++ ) {
			const source = srcList[sourceIndex];

			const keys = Object.keys( source );
			for ( let keyIndex = 0, numKeys = keys.length; keyIndex < numKeys; keyIndex++ ) {
				const key = keys[keyIndex];

				if ( key !== "__proto__" ) {
					const value = source[key];

					switch ( typeof value ) {
						case "object" :
							if ( value && !Array.isArray( value ) ) {
								if ( !dst.hasOwnProperty( key ) ) {
									dst[key] = {};
								}

								if ( path.indexOf( value ) < 0 ) {
									_submerge( dst[key], value, [].concat( path, value ) );
								}

								break;
							}

						// falls through
						default :
							dst[key] = value;
					}
				}
			}
		}

		return dst;
	}
}

module.exports = _merge;
