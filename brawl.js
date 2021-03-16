const divContainer = document.getElementById('div_container');
const creature_number = 3;
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

const fetchCreatures = () => {
	for (let i = 0; i < creature_number; i++) {
		getCreatures(i);
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

const getCreatures = id => {
    loadJSON(function(response) {
    var creatures = JSON.parse(response);
    createCreatureCard(creatures[id]);
    });
};

function createCreatureCard(creature) {
	const creatureElement = document.createElement('div');
	creatureElement.classList.add('creature');

    	const name = creature.name;
	const stats = creature.stats;

	const creature_types = creature.types.map(type => type.name);
	if(creature_types.length > 1) {
		console.log("MULTIPLE TYPES FOR: " + creature.name);
		console.log("TYPES: " + Object.values(creature_types));
		const colorGradient = getCssValuePrefix() + 'linear-gradient(';
		creatureElement.style.backgroundColor = getCssValuePrefix() + 'linear-gradient(';
		Object.values(creature_types).forEach(type => {
			console.log(colors[type]);
			colorGradient += colors[type] + ', ';
		});
		colorGradient = colorGradient.slice(0, -1);
		colorGradient += ')';
		console.log(colorGradient);
		creatureElement.style.backgroundColor = colorGradient;
// 		dom.style.backgroundImage = getCssValuePrefix() + 'linear-gradient(' + colorOne + ', ' + colorTwo + ')';
	} else {	
		const type = main_types.find(type => creature_types.indexOf(type) > -1);
		creatureElement.style.backgroundColor = colors[type];
	}	

	const innerHTML = `
	<img class="type-symbol" src="./images/types/${type}.png" alt="${type}">
        <div class="img-container">
            <img src="./images/${name}.jpg" alt="${name}" />
        </div>
        <div class="info">
            <span class="number">#${creature.id
							.toString()
							.padStart(3, '0')}</span>
            <h3 class="name">${name}</h3>
            <hr>
            <small class="stats"><span>HP ${stats.health} Atk ${stats.attack} Def ${stats.defense} Spd ${stats.speed}</span>
        </div>
    `;

	creatureElement.innerHTML = innerHTML;
	div_container.appendChild(creatureElement);
}
	
// Detect which browser prefix to use for the specified CSS value
// (e.g., background-image: -moz-linear-gradient(...);
//        background-image:   -o-linear-gradient(...); etc).
//

function getCssValuePrefix()
{
    var rtrnVal = '';//default to standard syntax
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

    // Create a temporary DOM object for testing
    var dom = document.createElement('div');

    for (var i = 0; i < prefixes.length; i++)
    {
        // Attempt to set the style
        dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

        // Detect if the style was successfully set
        if (dom.style.background)
        {
            rtrnVal = prefixes[i];
        }
    }

    dom = null;
    delete dom;

    return rtrnVal;
}

fetchCreatures();
