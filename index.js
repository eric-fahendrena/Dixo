/**
 * Copyright 2024, Eric Fahendrena
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const compression = require('compression');

function getData(res) {
	console.log('getting data...');

	// object where to stock the words datas
	let wordsDatas = {
		en: [],
		fr: [],
	};

	let saveData = lang => {
		for (let i = 0; i < 26; i++) {
			let filePath;
			let fileContent = '';

			if (lang === 'en') filePath = path.join(__dirname, 'db', `a${i}.txt`);
			if (lang === 'fr') filePath = path.join(__dirname, 'db', `b${i}.txt`);
			
			if (!fs.existsSync(filePath)) {
				continue;
			}

			fs.readFile(filePath, function(err, data){
				console.log(`reading ${filePath}`);

				// is there any error?
				if (err) {
					console.log(`Cannot read ${filePath}, ${err}`);
					return;
				}

				// there is any error, so let's read the file

				let fileContentLines;

				fileContent = "" + data;
				fileContentLines = fileContent.split("\n"); // every line in the files

				// there is always an empty line at the bottom of the content. Let's remove it from the array
				fileContentLines.pop();
				
				fileContentLines.forEach(fContent => {
					let word, ipa1, ipa2, senses;
					let contentSplit = fContent.split('%');
					let heading = contentSplit[0];

					// once first item in contentSplit taken, let's remove it from the array
					contentSplit.shift();

					// get the word from heading

					if (/([\p{L} ]+)/gui.test(heading))
						word = RegExp.$1;

					// get the ipa1 from heading and add some style
					
					if (/\{([^}]+)/i.test(heading))
						ipa1 = `<span class="text-primary">[${RegExp.$1}]</span>`;

					// get the ipa 2 from heading and add some style
					
					if (/\}([^{]+)/i.test(heading))
						ipa2 = `<span class="text-secondary">[${RegExp.$1}]</span>`;
					
					// get the sense
					senses = contentSplit;

					wordsDatas[lang].push({
						word: word,
						ipa1: ipa1 ? ipa1 : '',
						ipa2: ipa2 ? ipa2 : '',
						senses: senses,
					});
				});
			});
		}
	}

	saveData('en');
	saveData('fr');

	console.log('Sending response...');
	setTimeout(function(){
		res.json(wordsDatas);
		console.log('Response is sent!')
	}, 1000);
}

const app = express();

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/api/data', (req, res) => {
	getData(res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Server is running on port 3000');
});
