var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
var request = require('request');

// headers for all the sections whose data is needed
var requiredData = [
	'Overview',
	'Thermal properties',
	'Bulk physical properties',
	'Reactivity',
	'Health and Safety',
	'Classifications',
	'Electrical properties',
	'Magnetic properties',
	'Abundances',
	'Atomic dimensions and structure',
	'Nuclear Properties'
];

var preproc = require('./data-preprocessors.js');

function preprocessData(rawKey, rawValue) {
	var processedKey = rawKey.split(' ').join('');
	var processedValue = rawValue;
	return {key: processedKey, value: processedValue};
}

console.log("Sending request for element data...");
request('http://periodictable.com/Elements/077/data.html', function (err, response, body) {
	console.log("data received");
	if (err || response.statusCode != 200) return;

	var elementProperties = {};

	// read contents
	var $ = cheerio.load(body);

	for (var i = 0; i < requiredData.length; i++) {
		$('b:contains("' + requiredData[i] + '")')
			.last()
			.parents('tr')
			.first()
			.nextAll() // all subsequent rows
			.each(function (index, el) {
				var dataCols = $(el).children('td');
				if (dataCols.length === 1) return false;

				var sanitizationFunction = preproc.getPreprocessor(dataCols.first().text());

				var sanitizedPair = sanitizationFunction(
						dataCols.first().text(),
						dataCols.last()
					);

				if (!sanitizedPair.multiple) {
					elementProperties[sanitizedPair.key] = sanitizedPair.value;
				} else {
					for (var i = 0, len = sanitizedPair.key.length; i < len; i++) {
						elementProperties[sanitizedPair.key[i]] = sanitizedPair.value[i];
					}
				}
			});
	}

	fs.writeFile('data/077.json',
		JSON.stringify(elementProperties, null, 4),
		function (err) {
			if (err) throw err;
			console.log("Saved result");
		});	
});
