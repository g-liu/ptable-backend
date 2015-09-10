var cheerio = require('cheerio');
var preproc = require('../data-preprocessors');
var expect = require('chai').expect;

describe("Default preprocessor", function () {
	it("should format key and value correctly", function () {
		var dummyKey = "Default Rules";
		var $ = cheerio.load('<td align="left">Solid</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('defaultRules');
		expect(preprocRtn.value.value).to.equal('Solid');
		expect(preprocRtn.value.label).to.equal('Default Rules');
	});
	
	it("should format value correctly when None", function () {
		var dummyKey = "Default Rules";
		var $ = cheerio.load('<td align="left">None</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Default Rules');
	});

	it("should format value correctly when N/A", function () {
		var dummyKey = "Default Rules";
		var $ = cheerio.load('<td align="left">N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Default Rules');
	});
});

describe("Integer preprocessor", function () {
	it("should format key and value correctly", function () {
		var dummyKey = "Atomic Number";
		var $ = cheerio.load('<td align="left">29</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicNumber');
		expect(preprocRtn.value.value).to.equal(29);
		expect(preprocRtn.value.label).to.equal('Atomic Number');
	});

	it("should format value correctly when not a number", function () {
		var dummyKey = "Atomic Number";
		var $ = cheerio.load('<td align="left">N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicNumber');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.label).to.equal('Atomic Number');
	});
});

describe("Float preprocessor", function () {
	it("should format key and value correctly", function () {
		var dummyKey = "Electronegativity";
		var $ = cheerio.load('<td align="left">2.151</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronegativity');
		expect(preprocRtn.value.value).to.equal(2.151);
		expect(preprocRtn.value.label).to.equal('Electronegativity');
	});

	it("should format key and value correctly when not a number", function () {
		var dummyKey = "Electronegativity";
		var $ = cheerio.load('<td align="left">N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronegativity');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.label).to.equal('Electronegativity');
	});
});

describe("Float with units preprocessor", function () {
	it("should handle a float with a simple non-ratio unit correctly", function () {
		var dummyKey = "Atomic Radius";
		var $ = cheerio.load('<td align="left">180 pm</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicRadius');
		expect(preprocRtn.value.value).to.equal(180);
		expect(preprocRtn.value.units).to.equal('pm');
		expect(preprocRtn.value.label).to.equal('Atomic Radius');
	});

	it("should handle a float with a simple non-ratio unit correctly with annotation", function () {
		var dummyKey = "Atomic Radius";
		var $ = cheerio.load('<td align="left">180 pm' +
			'<sup><a href="#Helium.AtomicRadius.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicRadius');
		expect(preprocRtn.value.value).to.equal(180);
		expect(preprocRtn.value.units).to.equal('pm');
		expect(preprocRtn.value.label).to.equal('Atomic Radius');
	});

	it("should handle a float with a simple non-ratio unit correctly with secondary quantity", function () {
		var dummyKey = "Atomic Radius";
		var $ = cheerio.load('<td align="left">180 pm (1.8×10<sup>-10</sup> m)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicRadius');
		expect(preprocRtn.value.value).to.equal(180);
		expect(preprocRtn.value.units).to.equal('pm');
		expect(preprocRtn.value.label).to.equal('Atomic Radius');
	});

	it("should handle a float with a compound non-ratio unit correctly", function () {
		var dummyKey = "Resistivity";
		var $ = cheerio.load('<td align="left">250.14 m Ω</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('resistivity');
		expect(preprocRtn.value.value).to.equal(250.14);
		expect(preprocRtn.value.units).to.equal('m Ω');
		expect(preprocRtn.value.label).to.equal('Resistivity');
	});

	it("should handle a float with a compound non-ratio unit correctly with annotation", function () {
		var dummyKey = "Resistivity";
		var $ = cheerio.load('<td align="left">250.14 m Ω' +
			'<sup><a href="#Actinium.Resistivity.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('resistivity');
		expect(preprocRtn.value.value).to.equal(250.14);
		expect(preprocRtn.value.units).to.equal('m Ω');
		expect(preprocRtn.value.label).to.equal('Resistivity');
	});

	it("should handle a float with a compound non-ratio unit correctly with secondary quantity", function () {
		var dummyKey = "Resistivity";
		var $ = cheerio.load('<td align="left">250.14 m Ω (800.14 PSI)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('resistivity');
		expect(preprocRtn.value.value).to.equal(250.14);
		expect(preprocRtn.value.units).to.equal('m Ω');
		expect(preprocRtn.value.label).to.equal('Resistivity');
	});

	it("should handle a float with a simple ratio unit correctly", function () {
		var dummyKey = "Speed of Sound";
		var $ = cheerio.load('<td align="left">444 m/s</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('speedOfSound');
		expect(preprocRtn.value.value).to.equal(444);
		expect(preprocRtn.value.units.numerator).to.equal('m');
		expect(preprocRtn.value.units.denominator).to.equal('s');
		expect(preprocRtn.value.label).to.equal('Speed of Sound');
	});

	it("should handle a float with a simple ratio unit correctly with annotation", function () {
		var dummyKey = "Speed of Sound";
		var $ = cheerio.load('<td align="left">444 m/s' +
			'<sup><a href="#Carbon.SpeedOfSound.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('speedOfSound');
		expect(preprocRtn.value.value).to.equal(444);
		expect(preprocRtn.value.units.numerator).to.equal('m');
		expect(preprocRtn.value.units.denominator).to.equal('s');
		expect(preprocRtn.value.label).to.equal('Speed of Sound');
	});

	it("should handle a float with a simple ratio unit correctly with secondary quantity", function () {
		var dummyKey = "Speed of Sound";
		var $ = cheerio.load('<td align="left">444 m/s (1598.4 km/h)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('speedOfSound');
		expect(preprocRtn.value.value).to.equal(444);
		expect(preprocRtn.value.units.numerator).to.equal('m');
		expect(preprocRtn.value.units.denominator).to.equal('s');
		expect(preprocRtn.value.label).to.equal('Speed of Sound');
	});

	it("should handle a float with a complex ratio unit correctly", function () {
		var dummyKey = "Thermal Conductivity";
		var $ = cheerio.load('<td align="left">0.1514 W/(m K)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('thermalConductivity');
		expect(preprocRtn.value.value).to.equal(0.1514);
		expect(preprocRtn.value.units.numerator).to.equal('W');
		expect(preprocRtn.value.units.denominator).to.equal('m K');
		expect(preprocRtn.value.label).to.equal('Thermal Conductivity');
	});

	it("should handle a float with a complex ratio unit correctly with annotation", function () {
		var dummyKey = "Thermal Conductivity";
		var $ = cheerio.load('<td align="left">0.1514 W/(m K)' +
			'<sup><a href="#Yttrium.ThermalConductivity.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('thermalConductivity');
		expect(preprocRtn.value.value).to.equal(0.1514);
		expect(preprocRtn.value.units.numerator).to.equal('W');
		expect(preprocRtn.value.units.denominator).to.equal('m K');
		expect(preprocRtn.value.label).to.equal('Thermal Conductivity');
	});

	it("should handle a float with a complex ratio unit correctly with secondary unit", function () {
		var dummyKey = "Thermal Conductivity";
		var $ = cheerio.load('<td align="left">0.1514 W/(m K) ' +
			'(3.85×10<sup>-3</sup> W/(in °C))' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('thermalConductivity');
		expect(preprocRtn.value.value).to.equal(0.1514);
		expect(preprocRtn.value.units.numerator).to.equal('W');
		expect(preprocRtn.value.units.denominator).to.equal('m K');
		expect(preprocRtn.value.label).to.equal('Thermal Conductivity');
	});

	it("should handle a quantity that is not available", function () {
		var dummyKey = "Heat of Fusion";
		var $ = cheerio.load('<td>N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('heatOfFusion');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.units).to.be.undefined;
	});

	it("should handle a quantity that is not available with annotation", function () {
		var dummyKey = "Heat of Fusion";
		var $ = cheerio.load('<td>N/A' +
			'<sup><a href="#Helium.HeatOfFusion.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('heatOfFusion');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.units).to.be.undefined;
	});
});

describe("Percent preprocessor", function () {
	it("should format key and value correctly", function () {
		var dummyKey = "% in Universe";
		var $ = cheerio.load('<td>93.114%</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('percentUniverse');
		expect(preprocRtn.value.value).to.equal(93.114);
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('% in Universe');
	});

	it("should format key and value correctly with annotation", function () {
		var dummyKey = "% in Universe";
		var $ = cheerio.load('<td>93.114%' +
			'<sup><a href="#Hydrogen.PercentInUniverse.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('percentUniverse');
		expect(preprocRtn.value.value).to.equal(93.114);
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('% in Universe');
	});

	it("should format key and value correctly when not available", function () {
		var dummyKey = "% in Sun";
		var $ = cheerio.load('<td>N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('percentSun');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('% in Sun');
	});

	it("should format key and value correctly when not available", function () {
		var dummyKey = "% in Sun";
		var $ = cheerio.load('<td>N/A' +
			'<sup><a href="#Helium.PercentInSun.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('percentSun');
		expect(preprocRtn.value.value).to.not.be.ok;
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('% in Sun');
	});
});

describe("NFPA Label preprocessor", function () {
	it("should return the relative path to the NFPA label image", function () {
		var dummyKey = "NFPA Label";
		var $ = cheerio.load('<td align="left">' +
			'<img alt="NFPA Label" width="100" height="100" src="../../Elements/002/NFPALabel.gif">' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('nfpaLabel');
		expect(preprocRtn.value.value).to.equal('../../Elements/002/NFPALabel.gif');
		expect(preprocRtn.value.label).to.equal('NFPA Label');
	});

	it("should return null if no image available", function () {
		var dummyKey = "NFPA Label";
		var $ = cheerio.load('<td align="left">N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('nfpaLabel');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('NFPA Label');
	});
});

describe("Electron configuration preprocessor", function () {
	it("handles configuration with no base and one shell", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>1s<sup>1</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: null,
			shells: {
				"1s": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with no base and one shell with annotation", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>1s<sup>1</sup>' +
			'<sup><a href="#Hydrogen.ElectronConfigurationString.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: null,
			shells: {
				"1s": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with no base and many shells", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>1s<sup>1</sup>2s<sup>2</sup>2p<sup>1</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: null,
			shells: {
				"1s": 1,
				"2s": 2,
				"2p": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with no base and many shells with annotation", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>1s<sup>1</sup>2s<sup>2</sup>2p<sup>1</sup>' +
			'<sup><a href="#Boron.ElectronConfigurationString.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: null,
			shells: {
				"1s": 1,
				"2s": 2,
				"2p": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with base and one shell", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>[Rn]7s<sup>1</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: 'Rn',
			shells: {
				"7s": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with base and one shell with annotation", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>[Rn]7s<sup>1</sup>' +
			'<sup><a href="#Francium.ElectronConfigurationString.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: 'Rn',
			shells: {
				"7s": 1
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with base and many shells", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>[Xe]4f<sup>14</sup>5d<sup>10</sup>6s<sup>2</sup>6p<sup>5</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: 'Xe',
			shells: {
				"4f": 14,
				"5d": 10,
				"6s": 2,
				"6p": 5
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});

	it("handles configuration with base and many shells with annotation", function () {
		var dummyKey = "Electron Configuration";
		var $ = cheerio.load('<td>[Xe]4f<sup>14</sup>5d<sup>10</sup>6s<sup>2</sup>6p<sup>5</sup>' +
			'<sup><a href="#Astatine.ElectronConfigurationString.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('electronConfiguration');
		expect(preprocRtn.value.value).to.deep.equal({
			base: 'Xe',
			shells: {
				"4f": 14,
				"5d": 10,
				"6s": 2,
				"6p": 5
			}
		});
		expect(preprocRtn.value.label).to.equal('Electron Configuration');
	});
});

describe("Discovery preprocessor", function () {
	it("handles discovery year (AD) and single country correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>1759 in Norway</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(1759);
		expect(preprocRtn.value.countries).to.deep.equal(['Norway']);
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles discovery year (BC) and single country correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>1759 BC in Russia</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(-1759);
		expect(preprocRtn.value.countries).to.deep.equal(['Russia']);
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles discovery year (AD) and multiple countries correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>2066 in United States and Democratic Republic of the Congo</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(2066);
		expect(preprocRtn.value.countries).to.deep.equal([
			'United States',
			'Democratic Republic of the Congo'
		]);
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles discovery year (BC) and multiple countries correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>3 BC in United Kingdom and New Zealand</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(-3);
		expect(preprocRtn.value.countries).to.deep.equal([
			'United Kingdom',
			'New Zealand'
		]);
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles discovery year (AD) and no countries correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>1991</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(1991);
		expect(preprocRtn.value.countries).to.be.null;
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles discovery year (BC) and no countries correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>46 BC</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.equal(-46);
		expect(preprocRtn.value.countries).to.be.null;
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles N/A correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.not.be.ok;
		expect(preprocRtn.value.countries).to.be.null;
		expect(preprocRtn.value.label).to.equal('Discovery');
	});

	it("handles N/A with annotation correctly", function () {
		var dummyKey = "Discovery";
		var $ = cheerio.load('<td>N/A' +
			'<sup><a href="#Carbon.DiscoveryString.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('discovery');
		expect(preprocRtn.value.year).to.not.be.ok;
		expect(preprocRtn.value.countries).to.be.null;
		expect(preprocRtn.value.label).to.equal('Discovery');
	});
});

describe("Lattice angles preprocessor", function () {
	it("handles single constant correctly", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>224 pm</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.deep.equal([224]);
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});

	it("handles single constant correctly with annotation", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>224 pm' +
			'<sup><a href="#Carbon.LatticeConstants.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.deep.equal([224]);
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});

	it("handles multiple constants correctly", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>667.4, 611.7, 330.4, 111.1111 pm</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.deep.equal([
			667.4,
			611.7,
			330.4,
			111.1111
		]);
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});

	it("handles multiple constants correctly with annotation", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>667.4, 611.7, 330.4, 111.1111 pm' +
			'<sup><a href="#Fakeium.LatticeConstants.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.deep.equal([
			667.4,
			611.7,
			330.4,
			111.1111
		]);
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});

	it("handles no constants correctly", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});

	it("handles no constants correctly with annotation", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>N/A' +
			'<sup><a href="#Roentgenium.LatticeConstants.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Lattice Constants');
	});
});

describe("Quantum numbers preprocessor", function () {
	it("handles term symbol with integer orbital quantum number", function () {
		var dummyKey = "Quantum Numbers";
		var $ = cheerio.load('<td><sup>5</sup>P<sub>4</sub></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('quantumNumbers');
		expect(preprocRtn.value.value).to.deep.equal({
			spinMultiplicity: 5,
			angularMomentum: 'P',
			orbital: '4'
		});
		expect(preprocRtn.value.label).to.equal('Quantum Numbers');
	});

	it("handles term symbol with integer orbital quantum number with annotation", function () {
		var dummyKey = "Quantum Numbers";
		var $ = cheerio.load('<td><sup>5</sup>P<sub>4</sub>' +
			'<sup><a href="#112.QuantumNumbers.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('quantumNumbers');
		expect(preprocRtn.value.value).to.deep.equal({
			spinMultiplicity: 5,
			angularMomentum: 'P',
			orbital: '4'
		});
		expect(preprocRtn.value.label).to.equal('Quantum Numbers');
	});

	it("handles term symbol with fractional orbital quantum number", function () {
		var dummyKey = "Quantum Numbers";
		var $ = cheerio.load('<td><sup>4</sup>S<sub>11/5</sub></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('quantumNumbers');
		expect(preprocRtn.value.value).to.deep.equal({
			spinMultiplicity: 4,
			angularMomentum: 'S',
			orbital: '11/5'
		});
		expect(preprocRtn.value.label).to.equal('Quantum Numbers');
	});

	it("handles term symbol with integer orbital quantum number with annotation", function () {
		var dummyKey = "Quantum Numbers";
		var $ = cheerio.load('<td><sup>4</sup>D<sub>15/4</sub>' +
			'<sup><a href="#104.QuantumNumbers.note">[note]</a></sup>' +
			'</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('quantumNumbers');
		expect(preprocRtn.value.value).to.deep.equal({
			spinMultiplicity: 4,
			angularMomentum: 'D',
			orbital: '15/4'
		});
		expect(preprocRtn.value.label).to.equal('Quantum Numbers');
	});
});

describe("Isotopes preprocessor", function () {
	it("handles one isotope correctly", function () {
		var dummyKey = "Known Isotopes";
		var $ = cheerio.load('<td>' +
			'<table><tbody><tr>' +
			'<td><a href="../../Isotopes/080.171/index.html"><sup>171</sup>Hg</a></td>' +
			'</tr></tbody></table>' +
			'</td>');
		var dummyValue = $('*');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('knownIsotopes');
		expect(preprocRtn.value.value).to.deep.equal([171]);
		expect(preprocRtn.value.label).to.equal('Known Isotopes');
	});

	it("handles many isotopes correctly", function () {
		var dummyKey = "Known Isotopes";
		var $ = cheerio.load('<td>' +
			'<table><tbody><tr><td>' +
			'<a href="../../Isotopes/080.171/index.html"><sup>171</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.172/index.html"><sup>172</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.173/index.html"><sup>173</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.174/index.html"><sup>174</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.175/index.html"><sup>175</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.176/index.html"><sup>176</sup>Hg</a>, ' +
			'<a href="../../Isotopes/080.180/index.html"><sup>180</sup>Hg</a>' +
			'</td></tr></tbody></table>' +
			'</td>');
		var dummyValue = $('*');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('knownIsotopes');
		expect(preprocRtn.value.value).to.deep.equal([
			171,
			172,
			173,
			174,
			175,
			176,
			180
		]);
		expect(preprocRtn.value.label).to.equal('Known Isotopes');
	});
});

describe("Isotopic abundances preprocessor", function () {
	it("handles single isotope correctly", function () {
		var dummyKey = "Isotopic Abundances";
		var $ = cheerio.load('<td valign="top" align="left">' +
			'<table border="0" cellpadding="2" cellspacing="0">' +
			'<tbody>' +
			'<tr>' +
			'<td><a href="../../Isotopes/033.75/index.html"><sup>75</sup>As</a></td>' +
			'<td>100%</td>' +
			'</tr>' +
			'</tbody>' +
			'</table></td>');

		var dummyValue = $('*');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('isotopicAbundances');
		expect(preprocRtn.value.value).to.deep.equal({
			"75": 100
		});
		expect(preprocRtn.value.label).to.equal('Isotopic Abundances');
	});

	it("handles multiple isotopes correctly", function () {
		var dummyKey = "Isotopic Abundances";
		var $ = cheerio.load('<td valign="top" align="left">' +
			'<table border="0" cellpadding="2" cellspacing="0">' +
			'<tbody><tr>' +
			'<td><a href="../../Isotopes/034.74/index.html"><sup>74</sup>Se</a></td>' +
			'<td>0.89%</td>' +
			'</tr><tr>' +
			'<td><a href="../../Isotopes/034.76/index.html"><sup>76</sup>Se</a></td>' +
			'<td>9.37%</td>' +
			'</tr><tr>' +
			'<td><a href="../../Isotopes/034.77/index.html"><sup>77</sup>Se</a></td>' +
			'<td>7.63%</td>' +
			'</tr><tr>' +
			'<td><a href="../../Isotopes/034.78/index.html"><sup>78</sup>Se</a></td>' +
			'<td>23.77%</td>' +
			'</tr><tr>' +
			'<td><a href="../../Isotopes/034.80/index.html"><sup>80</sup>Se</a></td>' +
			'<td>49.61%</td>' +
			'</tr><tr>' +
			'<td><a href="../../Isotopes/034.82/index.html"><sup>82</sup>Se</a></td>' +
			'<td>8.73%</td>' +
			'</tr></tbody>' +
			'</table></td>');

		var dummyValue = $('*');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('isotopicAbundances');
		expect(preprocRtn.value.value).to.deep.equal({
			"74": 0.89,
            "76": 9.37,
            "77": 7.63,
            "78": 23.77,
            "80": 49.61,
            "82": 8.73
		});
		expect(preprocRtn.value.label).to.equal('Isotopic Abundances');
	});

	it("handles no isotopes correctly", function () {
		var dummyKey = "Isotopic Abundances";
		var $ = cheerio.load('<td valign="top" align="left"></td>');

		var dummyValue = $('*');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('isotopicAbundances');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Isotopic Abundances');
	});
});

describe("CSV preprocessor", function () {
	it("handles a single value correctly", function () {
		var dummyKey = "Lattice Angles";
		var $ = cheerio.load('<td>π/2</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeAngles');
		expect(preprocRtn.value.value).to.deep.equal(['π/2']);
		expect(preprocRtn.value.label).to.equal('Lattice Angles');
	});

	it("handles multiple values correctly", function () {
		var dummyKey = "Lattice Angles";
		var $ = cheerio.load('<td>π/2, 0.014126, π/9.140, 4, donkey</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeAngles');
		expect(preprocRtn.value.value).to.deep.equal([
			'π/2',
			'0.014126',
			'π/9.140',
			'4',
			'donkey'
		]);
		expect(preprocRtn.value.label).to.equal('Lattice Angles');
	});

	it("handles no values correctly", function () {
		var dummyKey = "Lattice Angles";
		var $ = cheerio.load('<td>N/A</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeAngles');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.equal('Lattice Angles');
	})
});

describe("Float CSV with unit preprocessor", function () {
	it("handles a single value correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>2372.3 kJ/mol</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.deep.equal([2372.3]);
		expect(preprocRtn.value.units).to.deep.equal({
			numerator: 'kJ',
			denominator: 'mol'
		});
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});

	it("handles a single value with annotation correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>2372.3 kJ/mol' +
			'<a href="#Helium.IonizationEnergies.note">[note]</a>' +
			'</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.deep.equal([2372.3]);
		expect(preprocRtn.value.units).to.deep.equal({
			numerator: 'kJ',
			denominator: 'mol'
		});
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});

	it("handles multiple values correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>593.4, 1170, 1990, 4250 kJ/mol</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.deep.equal([
			593.4,
			1170,
			1990,
			4250
		]);
		expect(preprocRtn.value.units).to.deep.equal({
			numerator: 'kJ',
			denominator: 'mol'
		});
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});

	it("handles multiple values with annotation correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>593.4, 1170, 1990, 4250 kJ/mol' +
			'<a href="#Gadolinium.IonizationEnergies.note">[note]</a>' +
			'</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.deep.equal([
			593.4,
			1170,
			1990,
			4250
		]);
		expect(preprocRtn.value.units).to.deep.equal({
			numerator: 'kJ',
			denominator: 'mol'
		});
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});

	it("handles no values correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>N/A</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});

	it("handles no values with annotation correctly", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>N/A' +
			'<a href="#Ununoctium.IonizationEnergies.note">[note]</a>' +
			'</td>');

		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('ionizationEnergies');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.units).to.be.undefined;
		expect(preprocRtn.value.label).to.equal('Ionization Energies');
	});
});

describe("Scientific notation", function () {
	it("is handled correctly by default preprocessor", function () {
		var dummyKey = "Some Property";
		var $ = cheerio.load('<td>5.5×10<sup>4</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.equal('5.5×104');
	});

	it("is handled correctly by percent preprocessor", function () {
		var dummyKey = "% in Oceans";
		var $ = cheerio.load('<td>2.5×10<sup>-7</sup>%</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.equal(2.5e-7);
	});

	it("is handled correctly by integer preprocessor", function () {
		var dummyKey = "Valence";
		var $ = cheerio.load('<td>8.845×10<sup>10</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.equal(8.845e10);
	});

	it("is handled correctly by float preprocessor", function () {
		var dummyKey = "Electronegativity";
		var $ = cheerio.load('<td>2.91919×10<sup>-3</sup></td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.equal(2.91919e-3);
	});

	it("is handled correctly by float with unit preprocessor", function () {
		var dummyKey = "ElectronAffinity";
		var $ = cheerio.load('<td>6.241×10<sup>-4</sup> cm/(W K)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.equal(6.241e-4);
	});

	it("is handled correctly by float CSV with unit preprocessor", function () {
		var dummyKey = "Ionization Energies";
		var $ = cheerio.load('<td>6.241×10<sup>-4</sup>, '+
			'5×10<sup>13</sup>, ' +
			'1.234×10<sup>4</sup> ' +
			'in/(Cd Ohm)</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.value.value).to.deep.equal([
			6.241e-4,
			5e13,
			1.234e4
		]);
	});
});
