var cheerio = require('cheerio');
var _ = require('lodash');

// dummy cheerio wrapper for DOM manipulation
$ = cheerio.load('body');

String.prototype.splitKeep = function (delimiter, n) {
    var parts = this.split(delimiter);
    return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)]);
}

/**
 * Contains the necessary accessors to perform data preprocessing.
 * @module data-preprocessors
 */	
module.exports = {
	/**
	 * Call this method with a key and value to call the appropriate preprocessor function.
	 * If no appropriate preprocessor function can be found for the given <code>key</code>,
	 * uses the default preprocessor.
	 *
	 * @function callPreprocessor
	 * @param {string} key a string description that will be used to call the appropriate
	 *  preprocessor function
	 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
	 *  into the preprocessor function
	 * @return {object} the result from the prepocessor function that was called
	 */
	callPreprocessor: function (key, value) {
		if (typeof preprocessorMappings[key] === 'function') {
			return preprocessorMappings[key](key, value);
		} else {
			return defaultPreprocessor(key, value);
		}
	}
};

/**
 * Maps between strings and their appropriate preprocessors
 * @member {Object}
 */
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
	"Lattice Constants": floatCsvWithUnitPreprocessor,
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
 * Takes a key and value and does minimal processing on both, including the handling of
 * "N/A" and "None" in the given value
 *
 * @function defaultPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: the textual representation of the given <code>value</code>,
 *  				or <code>null</code> if the value's text is "None" or "N/A"
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for its integer representation.
 * <br />
 * Note that this function does <strong>not</strong> check for integer overflow or underflow.
 * Care must be taken when passing in values that contain integer representations too big to
 * fit the standard JavaScript integer type.
 *
 * @function integerPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: the integer representation of the given <code>value</code>,
 *  				or NaN if the given <code>value</code> cannot be parsed as an integer.
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for its floating point representation.
 * <br />
 * Note that this function does <strong>not</strong> check for overflow or underflow.
 * Care must be taken when passing in values that contain float representations too big to
 * fit the standard JavaScript float type.
 *
 * @function floatPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: the floating point representation of the given
 *  				<code>value</code>, or NaN if the given <code>value</code> cannot be
 *  				parsed as a floating point value
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for its floating point representation, along
 * with its units.
 * <br />
 * Note that this function does <strong>not</strong> check for overflow or underflow.
 * Care must be taken when passing in values that contain float representations too big to
 * fit the standard JavaScript float type.
 *
 * @function floatWithUnitPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: the floating point representation of the given
 *  				<code>value</code>, or NaN if the given <code>value</code> cannot be
 *  				parsed as a floating point value
 *  			</li>
 *  			<li><code>units</code>: If the preprocessor detects the unit is a ratio
 *  				of two simpler units (e.g. m/s), is set to an object with the
 *  				<code>numerator</code> and <code>demoninator</code> keys set to the
 *  				respective units. Otherwise, is set to the string containing the unit.<br />
 *  				
 *  				If <code>value</code> cannot be parsed as a float, this property is omitted.
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for its floating point representation
 * (without the percent sign).
 * <br />
 * Note that this function does <strong>not</strong> check for overflow or underflow.
 * Care must be taken when passing in values that contain float representations too big to
 * fit the standard JavaScript float type.
 *
 * @function percentPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code>, with the
 *  		"% in " prefix stripped</li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: the parsed value (see description)</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for a relative path to the NFPA label image.
 *
 * @todo in a later version, this will return an absolute path
 * 
 * @function nfpaLabelPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: a string containing the relative path to the NFPA
 *  				label image, or <code>null</code> if such path cannot be determined
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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

/**
 * Given a key and value, processes the value for a representation of the given 
 * electron configuration.
 * 
 * @function electronConfigurationPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>:
 *  				<ul>
 *  					<li><code>base</code>: the element upon which the remainder of the
 *  						electron configuration is based. This property is set to
 *  						<code>null</code> if no base is present in the given <code>value</code>
 *  					</li>
 *  					<li><code>shells</code>: an object, with the keys being the shells and
 *  						the values being the corresponding number of electrons in the shell
 *  					</li>
 *  				</ul>
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
 */
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
 * Given a key and value, processes the value for its discovery year and countries
 * of discovery.
 * 
 * @function discoveryPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>year</code>: the integer containing the year of discovery. If the
 *  				discovery was made before 0 A.D., this will be negative. If the discovery
 *  				year is not available ("N/A") or cannot be represented by an integer, this
 *  				value will be NaN
 *  			</li>
 *  			<li><code>countries</code>: an array of strings of the countries involved in the
 *  				discovery. This value is <code>null</code> if the discovery year is
 *  				not available ("N/A") or cannot be represented by an integer
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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
 * Given a key and value, processes the value for its quantum number as a term symbol.
 *
 * @function quantumNumbersPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>:
 *  				<ul>
 *  					<li><code>spinMultiplicity</code>: the spin multiplicity number,
 *  						2S + 1</li>
 *  					<li><code>angularMomentum</code>: the angular momentum quantum
 *  						number</li>
 *  					<li><code>orbital</code>: the orbital quantum number</li>
 *  				</ul>
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
 */
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
 * Given a key and value, processes the value for its isotope atomic numbers.
 *
 * @function isotopesPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: an array of integers representing the atomic numbers of
 *  				all isotopes in the given <code>value</code>
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
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

/**
 * Given a key and value, processes the value for its isotopic abundances.
 *
 * @function latticeConstantsPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: an object, with the keys being the isotope numbers,
 *  				values being the percent abundance of the corresponding isotopes
 *  				as represented by a floating-point value. This value is <code>null</code>
 *  				if there is no data about the isotopic abundances available
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
 */
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

/**
 * Given a key and value, processes the value for individual values, separated by a comma
 * and a space (", ").
 *
 * @function csvPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: an array of strings containing the individual values.
 *  				This value is <code>null</code> if the given <code>value</code>
 *  				is not available (e.g. "N/A")
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
 */
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

/**
 * Given a key and value, processes the value for individual values, separated by a comma
 * and a space (", "); as well as their unit.
 *
 * @function floatCsvWithUnitPreprocessor
 * @param {string} key a human-readable description of the value being passed
 * @param {object} value a Cheerio.js DOM object containing the raw contents to be passed
 *  into the preprocessor function
 * @return {object} an Object with the following structure:
 *  <ul>
 *  	<li><code>key</code>: camel-cased version of the passed-in <code>key</code></li>
 *  	<li><code>value</code>:
 *  		<ul>
 *  			<li><code>label</code>: the verbatim <code>key</code> passed in to the function</li>
 *  			<li><code>value</code>: an array of floats representations of the individual values.
 *  				This value is <code>null</code> if the given <code>value</code> is not
 *  				available (e.g. "N/A")
 *  			</li>
 *  			<li><code>units</code>: If the preprocessor detects the unit is a ratio of two
 *  				simpler units (e.g. m/s), is set to an object with the <code>numerator</code>
 *  				and <code>demoninator</code> keys set to the respective units. Otherwise,
 *  				is set to the string containing the unit.<br />
 *
 *  				If value cannot be parsed as a float, this property is omitted.
 *  			</li>
 *  		</ul>
 *  	</li>
 *  </ul>
 */
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

/**
 * Parses a string representation of a unit into an object representation of the same.
 *
 * @private
 * @function getUnitRepresentation
 * @param {string} rawUnit the string representation of the unit to be parsed
 * @return {object|String} if the unit is a ratio, returns an object with the
 *  <code>numerator</code> property set to the unit's numerator, and the
 *  <code>denominator</code> property set to the unit's denominator.
 * Otherwise, returns the string representation of the unit.
 */
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
