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
		console.log(`Generating ${htmlFile}...`);
		
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
	
	console.log("Generation ended. ");
}


inquirer
.prompt({
	type: "input",
	message: "Enter your favourite colour:",
	name: "colour"
})
.then(function({ colour }) { // when this is "colour" instead of "{ colour }" then console.log(colour) prints { colour: 'blue' }
	const username = 'ruthtech';
	const usernameUrl = `https://api.github.com/users/${username}`; // returns a JSON object. Then parse that object with the attrib below.
		
	axios.get(usernameUrl)
	.then(function(request) {
			console.log(usernameUrl);
			console.log("REQUEST SUCCESSFUL");
			
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
		console.log(res);
		console.log(`${usernameUrl}. AN ERROR OCCURRED. LOOK AT THE RESPONSE ABOVE.`);
	});
});


