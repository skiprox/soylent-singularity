let jetpack = require('fs-jetpack');
let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let Twit = require('twit');
let fs = require('node-fs');
let nodeScraperToText = require('node-scraper-to-text');

class TwitterBot {
	constructor() {
		// Store references
		this.sentences = [];
		this.credentials = {
			consumerKey: null,
			consumerSecret: null,
			accessToken: null,
			accessTokenSecret: null
		};
		this.twitterConnection = null;
		// Call function to store twitter sentences
		this.storeTwitterSentences({
			shouldSplit: true,
			urls: [
				'https://faq.soylent.com/hc/en-us/articles/212831963-How-Soylent-makes-a-difference',
				'https://faq.soylent.com/hc/en-us/articles/212767043-What-is-Soylent-',
				'https://faq.soylent.com/hc/en-us/articles/212769443-Why-Soy-Protein-',
				'https://faq.soylent.com/hc/en-us/articles/212769723-Expiration-and-shelf-life',
				'https://faq.soylent.com/hc/en-us/articles/200332079-Can-I-lose-weight-on-Soylent-',
				'https://faq.soylent.com/hc/en-us/articles/204409635-Preparing-Soylent-Powder-with-the-legacy-measuring-scoop'
			],
			tags: [
				'p',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6'
			],
			save: false
		}).then(() => {
			// When the promise for storing the sentences is complete,
			// we call the rest of the functions
			this.setupPorts();
			this.storeCredentials();
			this.createTwitterConnection();
			this.listenToPort();
			this.setupListener();
			this.onIO();
		});
	}
	setupPorts() {
		app.set('port', (process.env.PORT || 5000));
		app.use(express.static(__dirname + '/'));
	}
	storeTwitterSentences(options) {
		return new nodeScraperToText(options).then((data) => {
			this.sentences = data;
		});
	}
	storeCredentials() {
		const jsonFile = jetpack.read('twitter-credentials.json', 'json');
		this.credentials.consumerKey = jsonFile["consumer_key"];
		this.credentials.consumerSecret = jsonFile["consumer_secret"];
		this.credentials.accessToken = jsonFile["access_token"];
		this.credentials.accessTokenSecret = jsonFile["access_token_secret"];
	}
	createTwitterConnection() {
		this.twitterConnection = new Twit({
			consumer_key: this.credentials.consumerKey,
			consumer_secret: this.credentials.consumerSecret,
			access_token: this.credentials.accessToken,
			access_token_secret: this.credentials.accessTokenSecret
		});
	}
	listenToPort() {
		http.listen(app.get('port'), () => {
			console.log("Node app is running at localhost:" + app.get('port'));
		});
	}
	setupListener() {
		app.get('/', (req, res) => {
			res.sendfile('public/index.html');
		});
	}
	onIO() {
		io.on('connection', socket => {
			socket.on('tweet button clicked', data => {
				try {
					this.postTweet(data);
				}
				catch (e) {
					console.log(e);
				}
			});
			socket.on('check latest tweets', tweetData => {
				try {
					this.searchTweets(tweetData);
				}
				catch(e) {
					console.log(e);
				}
			});
		});
	}
	postTweet(data) {
		const STORED_DATA = data;
		const b64content = fs.readFileSync(STORED_DATA.image_path, { encoding: 'base64' });
		this.twitterConnection.post('media/upload', { media_data: b64content }, (err, data, response) => {
			if (!err) {
				// now we can assign alt text to the media, for use by screen readers and
				// other text-based presentations and interpreters
				var mediaIdStr = data.media_id_string
				var altText = "Alt Text Hello World"
				var meta_params = { status: STORED_DATA.meme_text, media_id: mediaIdStr, alt_text: { text: altText } }

				this.twitterConnection.post('media/metadata/create', meta_params, (err, data, response) => {
					if (!err) {
						// now we can reference the media and post a this.twitterConnection (media will attach to the this.twitterConnection)
						var params = { status: STORED_DATA.meme_text, media_ids: [mediaIdStr] }
						this.twitterConnection.post('statuses/update', params, (err, data, response) => {
							console.log(data);
							io.emit('new tweet', {
								tweet: data
							});
						});
					}
					else {
						console.log('fail at second media/metadata/create', err);
					}
				});
			}
			else {
				console.log('fail at first media/upload', err);
			}
		})
	};
}

new TwitterBot();