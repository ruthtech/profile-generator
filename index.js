const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const htmlpdf = require("html-pdf");
//require('./generateHTML');

const colors = {
		  green: {
		    wrapperBackground: "#E6E1C3",
		    headerBackground: "#C1C72C",
		    headerColor: "black",
		    photoBorderColor: "#black"
		  },
		  blue: {
		    wrapperBackground: "#5F64D3",
		    headerBackground: "#26175A",
		    headerColor: "white",
		    photoBorderColor: "#73448C"
		  },
		  pink: {
		    wrapperBackground: "#879CDF",
		    headerBackground: "#FF8374",
		    headerColor: "white",
		    photoBorderColor: "#FEE24C"
		  },
		  red: {
		    wrapperBackground: "#DE9967",
		    headerBackground: "#870603",
		    headerColor: "white",
		    photoBorderColor: "white"
		  }
		};

		function generateHTML(data) {
		  return `<!DOCTYPE html>
		<html lang="en">
		   <head>
		      <meta charset="UTF-8" />
		      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
		      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"/>
		      <link href="https://fonts.googleapis.com/css?family=BioRhyme|Cabin&display=swap" rel="stylesheet">
		      <title>Document</title>
		      <style>
		          @page {
		            margin: 0;
		          }
		         *,
		         *::after,
		         *::before {
		         box-sizing: border-box;
		         }
		         html, body {
		         padding: 0;
		         margin: 0;
		         }
		         html, body, .wrapper {
		         height: 100%;
		         }
		         .wrapper {
		         background-color: ${colors[data.color].wrapperBackground};
		         padding-top: 100px;
		         }
		         body {
		         background-color: white;
		         -webkit-print-color-adjust: exact !important;
		         font-family: 'Cabin', sans-serif;
		         }
		         main {
		         background-color: #E9EDEE;
		         height: auto;
		         padding-top: 30px;
		         }
		         h1, h2, h3, h4, h5, h6 {
		         font-family: 'BioRhyme', serif;
		         margin: 0;
		         }
		         h1 {
		         font-size: 3em;
		         }
		         h2 {
		         font-size: 2.5em;
		         }
		         h3 {
		         font-size: 2em;
		         }
		         h4 {
		         font-size: 1.5em;
		         }
		         h5 {
		         font-size: 1.3em;
		         }
		         h6 {
		         font-size: 1.2em;
		         }
		         .photo-header {
		         position: relative;
		         margin: 0 auto;
		         margin-bottom: -50px;
		         display: flex;
		         justify-content: center;
		         flex-wrap: wrap;
		         background-color: ${colors[data.color].headerBackground};
		         color: ${colors[data.color].headerColor};
		         padding: 10px;
		         width: 95%;
		         border-radius: 6px;
		         }
		         .photo-header img {
		         width: 250px;
		         height: 250px;
		         border-radius: 50%;
		         object-fit: cover;
		         margin-top: -75px;
		         border: 6px solid ${colors[data.color].photoBorderColor};
		         box-shadow: rgba(0, 0, 0, 0.3) 4px 1px 20px 4px;
		         }
		         .photo-header h1, .photo-header h2 {
		         width: 100%;
		         text-align: center;
		         }
		         .photo-header h1 {
		         margin-top: 10px;
		         }
		         .links-nav {
		         width: 100%;
		         text-align: center;
		         padding: 20px 0;
		         font-size: 1.1em;
		         }
		         .nav-link {
		         display: inline-block;
		         margin: 5px 10px;
		         }
		         .workExp-date {
		         font-style: italic;
		         font-size: .7em;
		         text-align: right;
		         margin-top: 10px;
		         }
		         .container {
		         padding: 50px;
		         padding-left: 100px;
		         padding-right: 100px;
		         }

		         .row {
		           display: flex;
		           flex-wrap: wrap;
		           justify-content: space-between;
		           margin-top: 20px;
		           margin-bottom: 20px;
		         }

		         .card {
		           padding: 20px;
		           border-radius: 6px;
		           background-color: ${colors[data.color].headerBackground};
		           color: ${colors[data.color].headerColor};
		           margin: 20px;
		         }
		         
		         .col {
		         flex: 1;
		         text-align: center;
		         }

		         a, a:hover {
		         text-decoration: none;
		         color: inherit;
		         font-weight: bold;
		         }

		         @media print { 
		          body { 
		            zoom: .75; 
		          } 
		         }
		      </style>`
		        }




class GitHubProfile {
	constructor(username, colour, data) {
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
		this.stars = data.starred_url; // https://api.github.com/users/octocat/starred{/owner}{/repo}
	}
	
	getFileName() {
		return `./github-profile-${this.username}`;
	}
	
	// Return the HTML version of this GitHub profile
	generateContent() {
		// construct the HTML file for the PDF generator to parse.
		let htmlFile = this.getFileName()+".html";
		console.log(`Generating ${htmlFile}...`);
		
		let startHTML = generateHTML(this);
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
					<p>$(this.stars}</p>
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
	const username = 'octocat';
	const usernameUrl = `https://api.github.com/users/${username}`; // returns a JSON object. Then parse that object with the attrib below.
		
	axios.get(usernameUrl)
	.then(function(request) {
			console.log(usernameUrl);
			console.log("REQUEST SUCCESSFUL");
			
			
			generatePDF(new GitHubProfile(username, colour, request.data));

	}).catch(function (res) {
		console.log(res);
		console.log(`${usernameUrl}. AN ERROR OCCURRED. LOOK AT THE RESPONSE ABOVE.`);
	});
});


