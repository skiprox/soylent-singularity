'use strict';

const nodeScraperToText = require('node-scraper-to-text');

let urls = [
	'https://faq.soylent.com/hc/en-us/articles/212831963-How-Soylent-makes-a-difference',
	'https://faq.soylent.com/hc/en-us/articles/212767043-What-is-Soylent-',
	'https://faq.soylent.com/hc/en-us/articles/212769443-Why-Soy-Protein-',
	'https://faq.soylent.com/hc/en-us/articles/212769723-Expiration-and-shelf-life',
	'https://faq.soylent.com/hc/en-us/articles/200332079-Can-I-lose-weight-on-Soylent-',
	'https://faq.soylent.com/hc/en-us/articles/204409635-Preparing-Soylent-Powder-with-the-legacy-measuring-scoop'
];
let tags = [
	'p',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
];
let save = './public/soylent-faq.js';

class Setup {
	constructor() {
		new nodeScraperToText({
			shouldSplit: true,
			urls: urls,
			tags: tags,
			save: save
		});
	}
}

new Setup();