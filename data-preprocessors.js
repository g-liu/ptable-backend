var cheerio = require('cheerio');
var _ = require('lodash');

// dummy cheerio wrapper for DOM manipulation
$ = cheerio.load('body');

String.prototype.splitKeep = function (delimiter, n) {
    var parts = this.split(delimiter);
    return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)]);
}

module.exports = {
	/**
	 * call this from external file
	 */
	callPreprocessor: function (key, value) {
		if (typeof preprocessorMappings[key] === 'function') {
			return preprocessorMappings[key](key, value);
		} else {
			return defaultPreprocessor(key, value);
		}
	}
};

var preprocessorMappings = {
	"Atomic Number": integerPreprocessor,
	"Atomic Weight": floatPreprocessor,
	"Density": floatWithUnitPreprocessor,
	"Melting Point": floatWithUnitPreprocessor,
	"Boiling Point": floatWithUnitPreprocessor,

	"Critical Pressure": floatWithUnitPreprocessor,
	"Critical Temperature": floatWithUnitPreprocessor,
	"Absolute Melting Point": floatWithUnitPreprocessor,
	"Absolute Boiling Point": floatWithUnitPreprocessor,
	"Heat of Fusion": floatWithUnitPreprocessor,
	"Heat of Vaporization": floatWithUnitPreprocessor,
	"Heat of Combustion": floatWithUnitPreprocessor,
	"Specific Heat": floatWithUnitPreprocessor,
	"Adiabatic Index": floatPreprocessor,
	"Neel Point": floatWithUnitPreprocessor,
	"Thermal Conductivity": floatWithUnitPreprocessor,
	"Thermal Expansion": floatWithUnitPreprocessor,

	"Density (Liquid)": floatWithUnitPreprocessor,
	"Molar Volume": floatPreprocessor,
	"Brinell Hardness": floatWithUnitPreprocessor,
	"Mohs Hardness": floatWithUnitPreprocessor,
	"Vickers Hardness": floatWithUnitPreprocessor,
	"Bulk Modulus": floatWithUnitPreprocessor,
	"Shear Modulus": floatWithUnitPreprocessor,
	"Young Modulus": floatWithUnitPreprocessor,
	"Poisson Ratio": floatPreprocessor,
	"Refractive Index": floatPreprocessor,
	"Speed of Sound": floatWithUnitPreprocessor,

	"Valence": integerPreprocessor,
	"Electronegativity": floatPreprocessor,
	"ElectronAffinity": floatWithUnitPreprocessor,
	"Ionization Energies": floatCsvWithUnitPreprocessor,

	"Autoignition Point": floatWithUnitPreprocessor,
	"Flashpoint": floatWithUnitPreprocessor,
	"DOT Numbers": integerPreprocessor,
	"NFPA Fire Rating": integerPreprocessor,
	"NFPA Health Rating": integerPreprocessor,
	"NFPA Reactivity Rating": integerPreprocessor,
	"NFPA Label": nfpaLabelPreprocessor,

	"Group": integerPreprocessor,
	"Period": integerPreprocessor,
	"Electron Configuration": electronConfigurationPreprocessor,
	"Discovery": discoveryPreprocessor,

	"Electrical Conductivity": floatWithUnitPreprocessor,
	"Resistivity": floatWithUnitPreprocessor,
	"Superconducting Point": floatPreprocessor,

	"Curie Point": floatWithUnitPreprocessor,
	"Mass Magnetic Susceptibility": floatPreprocessor,
	"Molar Magnetic Susceptibility": floatPreprocessor,
	"Volume Magnetic Susceptibility": floatPreprocessor,

	"% in Universe": percentPreprocessor,
	"% in Sun": percentPreprocessor,
	"% in Meteorites": percentPreprocessor,
	"% in Earth's Crust": percentPreprocessor,
	"% in Oceans": percentPreprocessor,
	"% in Humans": percentPreprocessor,

	"Atomic Radius": floatWithUnitPreprocessor,
	"Covalent Radius": floatWithUnitPreprocessor,
	"Van der Waals Radius": floatWithUnitPreprocessor,
	"Lattice Angles": csvPreprocessor,
	"Lattice Constants": latticeConstantsPreprocessor,
	"Space Group Number": integerPreprocessor,

	"Half-Life": floatWithUnitPreprocessor,
	"Lifetime": floatWithUnitPreprocessor,
	"Quantum Numbers": quantumNumbersPreprocessor,
	"Neutron Cross Section": floatPreprocessor,
	"Neutron Mass Absorption": floatPreprocessor,
	"Known Isotopes": isotopesPreprocessor,
	"Stable Isotopes": isotopesPreprocessor,
	"Isotopic Abundances": isotopicAbundancesPreprocessor
};

/**
 * Default preprocessor
 */
function defaultPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = value.text().trim();
	if (sanitizedValue === "None" || sanitizedValue === "N/A") {
		sanitizedValue = null;
	}
	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

/**
 * NOT secure against overflow or underflow!
 */
function integerPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseInt(parseFloat(value.text().replace('×10', 'e'), 10), 10);

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

/**
 * Use for dimensionless quantities
 */
function floatPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseFloat(value.text().replace('×10', 'e'), 10);

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

/**
 * Use for quantities with unit
 */
function floatWithUnitPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var rawQuantity = value.text().trim().splitKeep(' ', 2);

	var sanitizedValue = parseFloat(rawQuantity[0].replace('×10', 'e'), 10);

	if (isNaN(sanitizedValue)) {
		return {
			key: sanitizedKey,
			value: {
				label: key,
				value: sanitizedValue
			}
		};
	}

	var units = getUnitRepresentation(rawQuantity[1]);

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue,
			units: units
		}
	};
}

/**
 * Processes any percentages
 * Reports as x %
 */
function percentPreprocessor (key, value) {
	var sanitizedKey = _.camelCase('percent ' + key.substring(5).replace("'", ''));
	var sanitizedValue = parseFloat(value.contents().text().replace('×10', 'e'), 10);

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

/**
 * Relative path to the NFPA label image
 */
function nfpaLabelPreprocessor (key, value) {
	return {
		key: _.camelCase(key),
		value: {
			label: key,
			value: value.find('img').first().attr('src') || null
		}
	}
}

function electronConfigurationPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = {
		base: null,
		shells: {}
	};

	var shell;
	var electronCount;

	var firstNode = value.contents().eq(0);
	if (firstNode.text().indexOf(']') > -1) {
		var firstSplit = firstNode.text().split(']');
		sanitizedValue.base = firstSplit[0].substring(1);
		shell = firstSplit[1];
	} else {
		shell = firstNode.text();
	}

	var configuration = value.contents().slice(1);

	configuration.each(function (index, elem) {
		if ($(this).get(0).tagName === 'sup' && $(this).text() != '[note]') {
			electronCount = parseInt($(this).text(), 10);
			sanitizedValue.shells[shell] = electronCount;
		} else {
			shell = $(this).text();
		}
	});

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

/**
 * Returns both the year and country/ies of discovery
 * negative number = BC
 */
function discoveryPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var intermediateValue = value.text().trim();

	var discoveryDetails = intermediateValue.splitKeep(' in ', 2);
	var year = parseInt(discoveryDetails[0], 10);

	if (isNaN(year)) {
		return {
			key: sanitizedKey,
			value: {
				label: key,
				year: year,
				countries: null
			}
		};
	}

	if (_.endsWith(discoveryDetails[0], 'BC')) {
		year = -year;
	}

	var countries;
	if (!discoveryDetails[1].length) {
		countries = null;
	} else {
		countries = discoveryDetails[1].split(' and ');
	}

	return {
		key: sanitizedKey,
		value: {
			label: key,
			year: year,
			countries: countries
		}
	};
}


/**
 * in pm unless otherwise stated
 */
function latticeConstantsPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var rawValues = value.text().trim().replace('[note]', '');

	if (rawValues === 'N/A') {
		return {
			key: sanitizedKey,
			value: {
				label: key,
				value: null
			}
		}
	}

	var sanitizedValue = [];
	rawValues = rawValues.split(', ');
	for (var i = 0, len = rawValues.length; i < len; i++) {
		var parsedValue = parseFloat(rawValues[i], 10);
		sanitizedValue.push(parsedValue);
	}

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

function quantumNumbersPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var components = value.contents();

	// 0: (2S+1)-value
	// 1: J-value
	// 2: L-Value

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: {
				spinMultiplicity: parseInt(components.eq(0).text(), 10),
				angularMomentum: components.eq(1).text().trim(),
				orbital: components.eq(2).text().trim()
			}
		}
	};
}

/**
 * Returns the atomic numbers of all isotopes in question
 */
function isotopesPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = [];
	value.find('sup').each(function (index, el) {
		sanitizedValue.push(parseInt($(this).text(), 10));
	});

	return {
 		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue
		}
	};
}

function isotopicAbundancesPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = {};

	value.find('tr').each(function (index, el) {
		var isotopeData = $(this).find('td')
		var isotopeNumber = parseInt(isotopeData.first().find('sup').text(), 10);
		var isotopeAbundance = parseFloat(isotopeData.last().text(), 10);

		sanitizedValue[isotopeNumber] = isotopeAbundance;
	});

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: Object.keys(sanitizedValue).length ? sanitizedValue : null
		}
	};
}

function csvPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = value.text().replace('[note]', '').trim();

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue === 'N/A' ? null : sanitizedValue.split(', ')
		}
	};
}

function floatCsvWithUnitPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = [];

	var valuesText = value.text().replace('[note]', '').trim();

	if (valuesText === 'N/A') {
		return {
			key: sanitizedKey,
			value: {
				label: key,
				value: null
			}
		};
	}

	var values = valuesText.split(', ');
	for (var i = 0, len = values.length; i < len; i++) {
		var value = parseFloat(values[i].replace('×10', 'e'), 10);
		sanitizedValue.push(value);
	}

	// extract unit
	var units = getUnitRepresentation(values[values.length - 1].splitKeep(' ', 2)[1]);

	return {
		key: sanitizedKey,
		value: {
			label: key,
			value: sanitizedValue,
			units: units
		}
	};
}

function getUnitRepresentation (rawUnit) {
	rawUnit = rawUnit.trim();
	var units;

	if (rawUnit.indexOf('/') > -1) {
		// unit is a ratio
		units = {
			numerator: rawUnit.split('/')[0].trim(),
			denominator: /((\w+\s?)+)/.exec(rawUnit.split('/')[1])[0].trim()
		};
	} else {
		units = rawUnit.replace('[note]', '').replace(/\(.+\)/, '').trim();
	}

	return units;
}
