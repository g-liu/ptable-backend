var fs = require('fs');
var _ = require('lodash');
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

/**
 * Retrieves the element by its atomic number
 */
function getElementByAtomicNumber (num) {
	var formattedNum = _.padLeft(num, 3, '000');

	console.log("Requesting data for element", num);
	request('http://periodictable.com/Elements/' + formattedNum + '/data.html', function (err, response, body) {
		console.log("data received for", num);
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

					var sanitizedPair = preproc.callPreprocessor(
						dataCols.first().text(),
						dataCols.last());

					elementProperties[sanitizedPair.key] = sanitizedPair.value;
				});
		}

		fs.writeFile('data/' + formattedNum + '.json',
			JSON.stringify(elementProperties, null, 4),
			function (err) {
				if (err) throw err;
				console.log("Saved result for element", num);
			});	
	});
}

for (var i = 1; i <= 118; i++) {
	getElementByAtomicNumber(i);
}
