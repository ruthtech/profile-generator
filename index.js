const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const htmlpdf = require("html-pdf");
const generateHTML = require('./generateHTML');

class GitHubProfile {
	constructor(username, colour, data, count) {
		this.username = username; // could be prompted for the user. For now it's hard coded.
		this.color = colour; // prompted from the user. Named in the way that generateHTML expects it.
		
		this.public_repos = data.public_repos; // 8
		this.following = data.following; // 9
		this.followers = data.followers; // 2810
		this.name = data.name; // The Octocat
		this.location = data.location; // San Francisco
		this.profileImageUrl = data.avatar_url; // https://avatars3.githubusercontent.com/u/583231?v=4
		this.bio = data.bio; // null (and it is)
		this.blog = data.blog; // http://www.github.com/blog
		this.profileUrl = data.html_url; // https://github.com/octocat
		this.stars = count;
	}
	
	getFileName() {
		return `./github-profile-${this.username}`;
	}
	
	// Return the HTML version of this GitHub profile
	generateContent() {
		// construct the HTML file for the PDF generator to parse.
		let htmlFile = this.getFileName()+".html";
		console.log(`Generating ${htmlFile} as input to the PDF file...`);
		
		let startHTML = "";
		startHTML += generateHTML(this);
		startHTML += `
</style>
</head>
<body>
	<div class="photo-header">
		<img src="${this.profileImageUrl}"></img>
		<h1>Hi!</h1>
		<h1>My name is ${this.name}</h1>
	</div>
	<br/>
	<ul class="links-nav">
		<li class="nav-link"><img src="./assets/images/location-16.png"/>${this.location}</li>
		<li class="nav-link"><a href="${this.profileUrl}"><img src="./assets/images/GitHub-Mark-16px.png"/>GitHub</a></li>
		<li class="nav-link"><a href="${this.blog}"><img src="./assets/images/blog-icon-16.png"/>Blog</a></li>
	</ul>
	<div class="container">
		<div class="row">
			<div class="col">
				<div class="card">
					<h4>Public Repositories</h4>
					<p>${this.public_repos}</p>
				</div>
			</div>
			<div class="col">
				<div class="card">
					<h4>Followers</h4>
					<p>${this.followers}</p>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<div class="card">
					<h4>GitHub Stars</h4>
					<p>${this.stars}</p>
				</div>
			</div>
			<div class="col">
				<div class="card">
					<h4>Following</h4>
					<p>${this.following}</p>
				</div>
			</div>
		</div>
	</div>
</body>		`;
		fs.writeFileSync(htmlFile, startHTML);
		console.log(`Generation of HTML file complete.`);
		return htmlFile;
	}
}

function generatePDF( profile ) {
	console.log(`Generating ${profile.getFileName()}.pdf...`);

	var html = fs.readFileSync(profile.generateContent(), 'utf8');
	var options = { format: 'Letter' };
	 
	htmlpdf.create(html, options).toFile(`./${profile.getFileName()}.pdf`, function(err, res) {
	  if (err) return console.log(err);
	});
	
	console.log("Generation of PDF file successful. ");
}


inquirer
   .prompt([
	{
	   type: "input",
	   message: "Enter your favourite colour (green, blue, pink, or red):",
	   name: "colour"
   },
   {
	   type: "input",
	   message: "Enter the GitHub user name to generate",
	   name: "username"
   }
])
.then(function( response ) { // when this is "colour" instead of "{ colour }" then console.log(colour) prints { colour: 'blue' }
	const username = response.username;
	let colour = response.colour;
	// Since the colour choices are exported from another module, we are not going to change that module.
	// Instead, work to convert to an acceptable default.
	if((colour != 'blue') && (colour != 'green') && (colour != 'pink') && (colour != 'red')) {
		// Change the colour to one of the known colours.
		console.log(`Unknown colour ${colour}. Changing to red.`);
		colour = "red";
	}
	
	const usernameUrl = `https://api.github.com/users/${username}`; // returns a JSON object. Then parse that object with the attrib below.
		
	axios.get(usernameUrl)
	.then(function(request) {
			// Don't need to check if the user is found or not because if they're not then a 404 error is thrown
			console.log(`${usernameUrl} REQUEST SUCCESSFUL`);
			
			let data = request.data;
			let url = data.starred_url.replace('{/owner}{/repo}', '');
			axios.get(url)
			.then(function(request) {
				let count = 0;
				let allStarredRepos = request.data;
				for(const repo of allStarredRepos) {
					count += repo.stargazers_count;
				}
				generatePDF(new GitHubProfile(username, colour, data, count));

			}).catch(function (res) {
				console.log(res);
				console.log(`${url}. AN ERROR OCCURRED. LOOK AT THE RESPONSE ABOVE.`);
			});
	}).catch(function (res) {
		console.log(res.err);
		console.log(`${usernameUrl}. AN ERROR OCCURRED. Check user name spelling and try again.`);
	});
});


