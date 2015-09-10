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
	it("Should return the relative path to the NFPA label", function () {
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
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
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
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
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
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
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
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
	});

	it("handles no constants correctly", function () {
		var dummyKey = "Lattice Constants";
		var $ = cheerio.load('<td>N/A</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('latticeConstants');
		expect(preprocRtn.value.value).to.be.null;
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
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
		expect(preprocRtn.value.label).to.deep.equal('Lattice Constants');
	});
});

describe('Scientific notation', function () {
	it('is handled correctly by default preprocessor', function () {

	});

	it('is handled correctly by percent preprocessor', function () {

	});
});
