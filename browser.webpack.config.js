"use strict";

const Path = require( "path" );
const WebPack = require( "webpack" );
const HtmlWebPackPlugin = require( "html-webpack-plugin" );

module.exports = {
	mode: "production",
	context: Path.resolve( __dirname ),
	entry: [
		"./lib/index.js",
	],
	output: {
		path: Path.resolve( __dirname, "dist" ),
		library: "MarkdownToPDF",
	},
	plugins: [
		new WebPack.DefinePlugin( {
			"process.env.NODE_ENV": JSON.stringify( "web" ),
		} ),
		new HtmlWebPackPlugin( {
			template: "./browser/example.html",
		} ),
	],
	devServer: {
		contentBase: "./dist",
	},
};
