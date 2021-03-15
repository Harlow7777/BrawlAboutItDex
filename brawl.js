const poke_container = document.getElementById('poke_container');
const pokemons_number = 3;
const colors = {
	fire: '#FDDFDF',
	grass: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#f4e7da',
	rock: '#d5d5d4',
	fairy: '#fceaff',
	poison: '#98d7a5',
	bug: '#f8d5a3',
	dragon: '#97b3e6',
	psychic: '#eaeda1',
	flying: '#F5F5F5',
	fighting: '#E6E0D4',
	normal: '#F5F5F5',
	mind: '#E73DFF'
};
const main_types = Object.keys(colors);

const fetchPokemons = async () => {
	for (let i = 0; i < pokemons_number; i++) {
		await getPokemon(i);
	}
};

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'dex.json', true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
            }
        }
        xobj.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xobj.setRequestHeader('Access-Control-Allow-Origin', '*');
        xobj.send();
}

const getPokemon = async id => {
    loadJSON(function(response) {
    var pokemon = JSON.parse(response);
    createPokemonCard(pokemon[id]);
    });
};

function createPokemonCard(pokemon) {
    //pokemon div
	const pokemonEl = document.createElement('div');
	pokemonEl.classList.add('pokemon');

    //get type from pokemon.types
	const poke_types = pokemon.types(type => type.name);
	const type = main_types.find(type => poke_types.indexOf(type) > -1);
	//find type color from const colors
	const color = colors[type];

	//get name from pokemon.name
	const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);

	//set background color
	pokemonEl.style.backgroundColor = color;

	const pokeInnerHTML = `
        <div class="img-container">
            <img src="./images/${
                            pokemon.name
                            }.jpg" alt="${name}" />
        </div>
        <div class="info">
            <span class="number">#${pokemon.id
							.toString()
							.padStart(3, '0')}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: <span>${type}</span></small>
        </div>
    `;

	pokemonEl.innerHTML = pokeInnerHTML;

	poke_container.appendChild(pokemonEl);
}

fetchPokemons();