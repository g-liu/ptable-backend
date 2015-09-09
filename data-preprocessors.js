var cheerio = require('cheerio');
var _ = require('lodash');
var math = require('mathjs');

$ = cheerio.load('body');

module.exports = {
	"Atomic Number": integerPreprocessor,
	"Atomic Weight": floatPreprocessor,
	"Density": densityPreprocessor,
	"Melting Point": temperaturePreprocessor,
	"Boiling Point": temperaturePreprocessor,

	"Critical Pressure": pressurePreprocessor,
	"Critical Temperature": temperaturePreprocessor,
	"Absolute Melting Point": temperaturePreprocessor,
	"Absolute Boiling Point": temperaturePreprocessor,
	/**
	 * reported as kJ/mol
	 */
	"Heat of Fusion": floatPreprocessor,
	"Heat of Vaporization": floatPreprocessor,
	/**
	 * reported as J/(kg K)
	 */
	"Heat of Combustion": floatPreprocessor,
	"Specific Heat": floatPreprocessor,
	"Adiabatic Index": floatPreprocessor,
	"Neel Point": temperaturePreprocessor,
	"Thermal Conductivity": floatPreprocessor,
	"Thermal Expansion": floatPreprocessor,

	"Density (Liquid)": densityPreprocessor,
	"Molar Volume": floatPreprocessor,
	"Brinell Hardness": pressurePreprocessor,
	"Mohs Hardness": pressurePreprocessor,
	"Vickers Hardness": pressurePreprocessor,
	"Bulk Modulus": pressurePreprocessor,
	"Shear Modulus": pressurePreprocessor,
	"Young Modulus": pressurePreprocessor,
	"Poisson Ratio": floatPreprocessor,
	"Refractive Index": floatPreprocessor,
	"Speed of Sound": floatPreprocessor,

	"Valence": integerPreprocessor,
	"Electronegativity": floatPreprocessor,
	/**
	 * Reported as kJ/mol
	 */
	"ElectronAffinity": floatPreprocessor,
	"Ionization Energies": floatCsvPreprocessor,

	"Autoignition Point": temperaturePreprocessor,
	"Flashpoint": temperaturePreprocessor,
	"DOT Numbers": integerPreprocessor,
	"NFPA Fire Rating": integerPreprocessor,
	"NFPA Health Rating": integerPreprocessor,
	"NFPA Reactivity Rating": integerPreprocessor,
	"NFPA Label": nfpaLabelPreprocessor,

	"Group": integerPreprocessor,
	"Period": integerPreprocessor,
	"Discovery": discoveryPreprocessor,

	"Electrical Conductivity": floatPreprocessor,
	"Resistivity": floatPreprocessor,
	"Superconducting Point": floatPreprocessor,

	"Curie Point": temperaturePreprocessor,
	"Mass Magnetic Susceptibility": floatPreprocessor,
	"Molar Magnetic Susceptibility": floatPreprocessor,
	"Volume Magnetic Susceptibility": floatPreprocessor,

	"% in Universe": percentPreprocessor,
	"% in Sun": percentPreprocessor,
	"% in Meteorites": percentPreprocessor,
	"% in Earth's Crust": percentPreprocessor,
	"% in Oceans": percentPreprocessor,
	"% in Humans": percentPreprocessor,

	/**
	 * reported in pm
	 */
	"Atomic Radius": floatPreprocessor,
	"Covalent Radius": floatPreprocessor,
	"Van der Waals Radius": floatPreprocessor,
	"Lattice Angles": csvPreprocessor,
	"Lattice Constants": csvPreprocessor,
	"Space Group Number": integerPreprocessor,

	"Half-Life": durationPreprocessor,
	"Lifetime": durationPreprocessor,
	"Decay Mode": decayModePreprocessor,
	"Neutron Cross Section": floatPreprocessor,
	"Neutron Mass Absorption": floatPreprocessor,
	"Known Isotopes": isotopesPreprocessor,
	"Stable Isotopes": isotopesPreprocessor,
	"Isotopic Abundances": isotopicAbundancesPreprocessor,

	/**
	 * call this from external file
	 */
	getPreprocessor: function (key, value) {
		if (typeof this[key] === 'function') {
			return this[key];
		} else {
			return defaultPreprocessor;
		}
	}
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
		value: sanitizedValue
	};
}

function integerPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseInt(value.text().replace('×10', 'e'), 10);

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

function pressurePreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseFloat(value.text().replace('×10', 'e'));
	var units = value.text().split(' ')[1];

	if (units === 'GPa') {
		sanitizedValue /= 1e9;
	} else if (units === 'MPa') {
		sanitizedValue /= 1e6;
	} else if (units === 'kPa') {
		sanitizedValue /= 1e3;
	}

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

/**
 * Value is standardized to kelvin, the default SI unit
 */
function temperaturePreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);

	var valueUnit = value.text()[value.text().length - 1];
	var sanitizedValue = parseFloat(value.text().replace('×10', 'e'), 10);

	if (valueUnit === 'C') {
		sanitizedValue += 273.15;
	} else if (valueUnit === 'F') {
		sanitizedValue = (sanitizedValue + 459.67) * 5 / 9;
	}

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}


/**
 * Processes any percentages
 * Reports as x %
 */
function percentPreprocessor (key, value) {
	var sanitizedKey = _.camelCase('percent ' + key.substring(5).replace("'", ''));
	var sanitizedValue = parseFloat(value.text().replace('×10', 'e'), 10);
	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

function floatPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseFloat(value.text().replace('×10', 'e'), 10);
	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

/**
 * Returns density in SI units (kg/m^3)
 */
function densityPreprocessor (key, value) {
	var sanitizedResults = floatPreprocessor(key, value);
	var sanitizedValue = sanitizedResults.value;

	var units = value.text().split(' ')[1].split('/');
	var massUnits = units[0];
	var volumeUnits = units[1];

	if (massUnits === 'g') {
		sanitizedValue /= 1e3;
	} // other units here if necessary

	if (volumeUnits === 'cm3') {
		sanitizedValue *= 1e6;
	}

	return {
		key: sanitizedResults.key,
		value: sanitizedValue
	}
}

/**
 * Returns duration in seconds
 */
function durationPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = parseFloat(value.text().trim().replace('×10', 'e'), 10);

	var unit = value.text()[value.text().length - 1];
	if (unit === 'y') {
		sanitizedValue *= 3.154e7;
	} else if (unit === 'd') {
		sanitizedValue *= 86400;
	} else if (unit === 'h') {
		sanitizedValue *= 3600;
	} else if (unit === 'm') {
		sanitizedValue *= 60;
	}

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

function nfpaLabelPreprocessor (key, value) {
	// for now, ignore this
	return {};
}

/**
 * Returns both the year and country/ies of discovery
 * negative number = BC
 */
function discoveryPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var intermediateValue = value.text().trim();

	if (intermediateValue === 'N/A') {
		return {
			key: sanitizedKey,
			value: null,
			multiple: false
		}
	}

	var discoveryDetails = intermediateValue.split(' in ');

	var year = parseInt(discoveryDetails[0], 10);
	if (_.endsWith(discoveryDetails[0], 'BC')) {
		year = -year;
	}

	var countries;
	if (discoveryDetails.length === 1) {
		countries = null;
	} else {
		countries = discoveryDetails[1].split(' and ');
	}

	return {
		key: ['discoveryYear', 'discoveryCountries'],
		value: [year, countries],
		multiple: true
	};
}

function decayModePreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = value.text() === "N/A" ? null : value.text();

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

/**
 * Returns array: prefix, letter, postfix
 */
function quantumNumbersPreprocessor (key, value) {
	
}

/**
 * Returns the atomic numbers of all isotopes in question
 */
function isotopesPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = [];
	value.find('sup').each(function (index, el) {
		// should be possible to use textContent but no...
		sanitizedValue.push(parseInt($(this).text(), 10));
	});

	return {
		key: sanitizedKey,
		value: sanitizedValue
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
		value: sanitizedValue
	};
}

function csvPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = value.text().trim().split(', ');

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

function floatCsvPreprocessor (key, value) {
	var sanitizedKey = _.camelCase(key);
	var sanitizedValue = [];

	var values = value.text().trim().split(', ');
	for (var i = 0, len = values.length; i < len; i++) {
		var value = parseFloat(values[i].replace('×10', 'e'), 10);
		if (!isNaN(value)) {
			sanitizedValue.push(value);
		}
	}

	return {
		key: sanitizedKey,
		value: sanitizedValue
	};
}

