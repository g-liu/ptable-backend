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

	it("should format key and value correctly", function () {
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
	it("should handle a float with a non-ratio unit correctly", function () {
		var dummyKey = "Atomic Radius";
		var $ = cheerio.load('<td align="left">180 pm</td>');
		var dummyValue = $('td');

		var preprocRtn = preproc.callPreprocessor(dummyKey, dummyValue);

		expect(preprocRtn.key).to.equal('atomicRadius');
		expect(preprocRtn.value.value).to.equal(180);
		expect(preprocRtn.value.units).to.equal('pm');
		expect(preprocRtn.value.label).to.equal('Atomic Radius');
	});
});
