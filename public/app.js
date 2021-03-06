'use strict';

// Requires and needs
var socket = io();
var Soylent = require('./soylent-faq');

// The mo' f'in hearbeat
socket.heartbeatTimeout = 20000;

var App = (function() {

	var socketID,
		ajax,
		imgPath = 'public/stock_screaming/',
		memesArrayLen = 42,
		memesTextArray,
		memesTextArrayLen,
		memeTextElem,
		memeImageElem,
		waitingScreen,
		notificationScreen,
		generateButton,
		tweetButton,
		tweetAtSoylentButton,
		MEME_IMAGE_PATH,
		MEME_TEXT,
		MEME_TEXT_COMPOSED;

	var initialize = function() {
		generateButton = document.getElementById('generate-button');
		tweetButton = document.getElementById('tweet-button');
		tweetAtSoylentButton = document.getElementById('tweet-at-soylent-button');
		memeTextElem = document.getElementById('meme-text');
		memeImageElem = document.getElementById('meme-image');
		waitingScreen = document.getElementById('waiting-screen');
		notificationScreen = document.getElementById('notification-screen');
		memesTextArray = Soylent.sentences;
		memesTextArrayLen = memesTextArray.length;
		composeTweet();
		addListeners();
	};

	var addListeners = function() {
		generateButton.addEventListener('click', onGenerateButtonClicked);
		tweetButton.addEventListener('click', onTweetButtonClicked);
		tweetAtSoylentButton.addEventListener('click', onTweetAtSoylentButtonClicked);
		socket.on('new tweet', onNewTweet);
		socket.on('new connection', storeSocketID);
		socket.on('already tweeted at this user', onAlreadyTweetedAtUser);
	};

	var storeSocketID = function(e) {
		socketID = e.id;
	}

	var onNewTweet = function(e) {
		var postedTweet = e.tweet;
		console.log(e);
		if (e.id == socketID) {
			if (postedTweet.errors) {
				// The tweet had errors
				stopWaiting(false, postedTweet.errors[0].message);
			}
			else {
				// The tweet was successful
				stopWaiting(true, 'You just tweeted.');
			}
		}
	};

	var onAlreadyTweetedAtUser = function() {
		stopWaiting(false, 'You have already tweeted at this user.');
	};

	var onGenerateButtonClicked = function(e) {
		e.preventDefault();
		composeTweet();
	};

	var onTweetButtonClicked = function(e) {
		e.preventDefault();
		tweetIt();
	};

	var onTweetAtSoylentButtonClicked = function(e) {
		e.preventDefault();
		MEME_TEXT = '.@soylent ' + MEME_TEXT;
		tweetIt();
	};

	var composeTweet = function() {
		setMemeText();
		setMemeImage();
	};

	var setMemeText = function() {
		memeTextElem.classList.add('hidden');
		var randomInt = Math.floor(Math.random() * memesTextArrayLen);
		MEME_TEXT = memesTextArray[randomInt];
		memeTextElem.innerText = MEME_TEXT;
		setTimeout(() => {
			memeTextElem.classList.remove('hidden');
		}, 300);
	};

	var setMemeImage = function() {
		var randomInt = Math.floor(Math.random() * memesArrayLen);
		MEME_IMAGE_PATH = imgPath + randomInt + '.jpg';
		// memeImageElem.setAttribute('src', MEME_IMAGE_PATH);
		memeImageElem.style.backgroundImage = `url("${MEME_IMAGE_PATH}")`;
	};

	var tweetIt = function() {
		socket.emit('tweet button clicked', {
			image_path: MEME_IMAGE_PATH,
			meme_text: MEME_TEXT
		});
		runWaiting();
	};

	var checkLatestTweets = function() {
		socket.emit('check latest tweets', {
			image_path: MEME_IMAGE_PATH,
			meme_text: MEME_TEXT
		});
		runWaiting();
	};

	var runWaiting = function() {
		waitingScreen.style.visibility = 'visible';
	};

	var stopWaiting = function(didPublish, text) {
		var p = notificationScreen.querySelector('p');
		p.innerText = text;
		waitingScreen.style.visibility = 'hidden';
		notificationScreen.style.visibility = 'visible';
		setTimeout(function() {
			notificationScreen.style.visibility = 'hidden';
		}, 3000);
	};

	return {
		init: function() {
			initialize();
		}
	}

}());

App.init();