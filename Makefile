extension.zip: icons/* background.js manifest.json options.html options.js
	rm -f extension.zip
	zip -r extension.zip icons background.js manifest.json options.html options.js
