const pkey = "e6c11c9cb36789ec5ba3044578589795"; //API public key
var movieId = 0;
var director = ""; //director name
var actors = []; //actor list in selected movie
var firstFetch = true; //bool value used for initalization
var all_mIds = []; //list of all visited movies
var all_aIds = []; //list of all chosen actors
const main = document.getElementById("main"); //main div that we'll create elements in
var depth = 1; //each successful answer in a row increments this by 1
fetch_movie(firstFetch); //initializes the game
var dirId = 0; //director ID for current movie
var actIds = []; //list of actors for current movie
var person = 0; //actor or director ID guessed
var currentMovie = "";

async function fetch_director(id){ //fetches the director of a movie from a movie's ID
	let dir = "None";
	let query = "https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let staff = await response.json();
		var i;
		for (i = 0; i < staff.crew.length; i++){
			if (JSON.stringify(staff.crew[i].job).replace(/\"/g, "") == "Director"){
				dirId = JSON.stringify(staff.crew[i].id).replace(/\"/g, "");
				return JSON.stringify(staff.crew[i].name).replace(/\"/g, "").toLowerCase();
			}
		}
	}
	return dir;
}

async function fetch_actors(id){ //fetches the actors in a movie from a movie's ID
	acts = [];
	actIds = [];
	let query = "https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let staff = await response.json();
		var i;
		for (i = 0; i < staff.cast.length; i++){
			actIds.push(JSON.stringify(staff.cast[i].id).replace(/\"/g, ""));
			acts.push(JSON.stringify(staff.cast[i].name).replace(/\"/g, "").toLowerCase());
		}
	}
	return acts;
}

function clear_divs(){ //after a wrong answer, the main div is reset
	document.getElementById("main").innerHTML = "";
}

async function fetch_movie(firstLoad){ //fetches information about a movie and appends them to the main div
	if (firstLoad){
		movieId = 744; //default movie ID
		firstFetch = false;
	} else {
		movieId = Math.floor(Math.random() * 100000); //looks up a random movie
	}
	console.log(movieId);
	d1 = document.createElement("div"); //creates the divs
	d1.setAttribute("id", "info"+String(depth));
	main.appendChild(d1);
	d2 = document.createElement("div");
	d2.setAttribute("id", "inputDiv"+String(depth));
	main.appendChild(d2);
	d3 = document.createElement("input");
	d3.setAttribute("id", "inputBar"+String(depth));
	d3.type = "text";
	d3.placeholder = "Guess the director or an actor";
	d3.setAttribute("onchange", "on_answer()");
	d2.appendChild(d3);
	let query = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + pkey;
	let response = await fetch(query); //fetches the movie data
	if (response.status != 404){
		let movie = await response.json();
		if (JSON.stringify(movie.adult) == "false") {
			let title = JSON.stringify(movie.title).replace(/\"/g, ""); //all the data is parsed to remove double quotes
			let release = JSON.stringify(movie.release_date).replace(/\"/g, "");
			let poster = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" + JSON.stringify(movie.poster_path).replace(/\"/g, "");
			director = await fetch_director(movieId);
			actors = await fetch_actors(movieId);
			currentMovie = title.toLowerCase();
			d1.innerHTML = title + "<br>" + release + "<br><br><img src='" + poster + "' onerror='fetch_movie(firstLoad);'/><br>";
			all_mIds.push(currentMovie); //appends the current movie to all_mIds
		} else {
			clear_divs();
			fetch_movie(false);
		}
	} else {
		clear_divs();
		fetch_movie(false);
	}
};

async function fetch_person(personId, isDirector){ //fetches data about a person
	d1 = document.createElement("div");
	d1.setAttribute("id", "info"+String(depth));
	main.appendChild(d1);
	d2 = document.createElement("div");
	d2.setAttribute("id", "inputDiv"+String(depth));
	main.appendChild(d2);
	let query = "https://api.themoviedb.org/3/person/" + personId + "?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let personInfo = await response.json();
		d3 = document.createElement("input");
		d3.setAttribute("id", "inputBar"+String(depth));
		d3.type = "text";
		if (isDirector) {
			d3.placeholder = "Guess a different movie they directed";
		} else {
			d3.placeholder = "Guess a different movie they acted in";
		}
		d3.setAttribute("onchange", "on_person_answer()");
		d2.appendChild(d3);
		let name = JSON.stringify(personInfo.name).replace(/\"/g, "");
		let photo = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" + JSON.stringify(personInfo.profile_path).replace(/\"/g, "");
		if (isDirector){
			d1.innerHTML = name + "<br><br><img src='" + photo + "' alt='No photo available'/><br>";
		} else {
			d1.innerHTML = name + "<br><br><img src='" + photo + "' alt='No photo available'/><br>";
		}
	}
}

async function on_answer() { //triggered when the user makes a guess about an actor or the director of a movie
	d = document.createElement("div"); //creates a div that will say whether the guess is right or wrong
	d.setAttribute("id", "result"+String(depth));
	d.setAttribute("class", "result");
	main.appendChild(d);
	let query = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let movie = await response.json();
		let guess = document.getElementById("inputBar" + String(depth)).value.toLowerCase();
		if (!all_aIds.includes(guess)){ //the user can't guess the same person twice
			if (director == guess){ //if the user successfully guessed the director
				person = dirId;
				all_aIds.push(guess);
				console.log(all_aIds);
				d.innerHTML = "<em>Correct!</em>";
				depth++;
				document.getElementById("errorMessage").innerHTML = "";
				fetch_person(person, true);
			} else if (actors.includes(guess)) { //if the user successfully guessed an actor
				person = actIds[actors.indexOf(guess)];
				all_aIds.push(guess);
				console.log(all_aIds);
				d.innerHTML = "<em>Correct!</em>";
				document.getElementById("errorMessage").innerHTML = "";
				depth++;
				fetch_person(person, false);
			} else {
				document.getElementById("errorMessage").innerHTML = "Wrong! Let's try a different movie!";
				all_aIds = [];
				all_mIds = [];
				clear_divs();
				depth = 1;
				fetch_movie(firstFetch);
			}
		} else {
			document.getElementById("errorMessage").innerHTML = "You can't pick the same person twice!";
			all_aIds = [];
			all_mIds = [];
			clear_divs();
			depth = 1;
			fetch_movie(firstFetch);
		}
	}
}

async function fetch_particular_movie(id) { //similar to fetch_movie, but with a specific movie ID
	movieId = id;
	d1 = document.createElement("div");
	d1.setAttribute("id", "info"+String(depth));
	main.appendChild(d1);
	d2 = document.createElement("div");
	d2.setAttribute("id", "inputDiv"+String(depth));
	main.appendChild(d2);
	d3 = document.createElement("input");
	d3.setAttribute("id", "inputBar"+String(depth));
	d3.type = "text";
	d3.placeholder = "Guess the director or an actor";
	d3.setAttribute("onchange", "on_answer()");
	d2.appendChild(d3);
	let query = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let movie = await response.json();
			let title = JSON.stringify(movie.title).replace(/\"/g, "");
			let release = JSON.stringify(movie.release_date).replace(/\"/g, "");
			let poster = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2" + JSON.stringify(movie.poster_path).replace(/\"/g, "");
			director = await fetch_director(movieId);
			actors = await fetch_actors(movieId);
			currentMovie = title.toLowerCase();
			d1.innerHTML = title + "<br>" + release + "<br><br><img src='" + poster + "' alt='No poster found'/><br>";
			all_mIds.push(currentMovie);
	} else {
		fetch_movie(false);
	}
}

async function on_person_answer() { //triggered when the user guesses a movie the person directed or acted in
	d = document.createElement("div");
	d.setAttribute("id", "result"+depth);
	d.setAttribute("class", "result");
	main.appendChild(d);
	let query = "https://api.themoviedb.org/3/person/" + person + "/movie_credits?api_key=" + pkey;
	let response = await fetch(query);
	if (response.status != 404){
		let guess = document.getElementById("inputBar" + depth).value.toLowerCase();
		let movie_creds = await response.json();
		let movies = [];
		let mIds = [];
		var i;
		for (i = 0; i < movie_creds.crew.length; i++){
			if (JSON.stringify(movie_creds.crew[i].original_title).replace(/\"/g, "").toLowerCase() != currentMovie){
				movies.push(JSON.stringify(movie_creds.crew[i].original_title).replace(/\"/g, "").toLowerCase());
				mIds.push(JSON.stringify(movie_creds.crew[i].id).replace(/\"/g, ""));
			}
		}
		console.log(movies);
		if (movies.includes(guess) && !all_mIds.includes(guess)){ //if the user guesses right and the movie hasn't been chosen already
			d.innerHTML = "<em>Correct!</em>";
			depth++;
			fetch_particular_movie(mIds[movies.indexOf(guess)]);
		} else if (all_mIds.includes(guess)){ //if the user guesses a movie that has been chosen already
			document.getElementById("errorMessage").innerHTML = "You can't choose the same movie twice!";
			all_aIds = [];
			all_mIds = [];
			clear_divs();
			depth = 1;
			fetch_movie(firstFetch);
		} else {
			document.getElementById("errorMessage").innerHTML = "Wrong! Let's try a different movie!";
			all_aIds = [];
			all_mIds = [];
			clear_divs();
			depth = 1;
			fetch_movie(firstFetch);
		}
	}
}