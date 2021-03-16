const divContainer = document.getElementById('div_container');
const creature_number = 13;
const colors = {
	fire: '#FDDFDF',
	nature: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#DE791E',
	sound: '#FF3AFE',
	air: '#50C9FA',
	muscle: '#E6E0D4',
	mind: '#B268FF',
	space: '#000000',
	ghost: '#ffffff',
	metal: '#B0B0B0' 
};
const main_types = Object.keys(colors);

const fetchCreatures = async () => {
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

const getCreatures = async id => {
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
	var typeSymbol = '';

	const creature_types = creature.types.map(type => type.name);
	if(creature_types.length > 1) {
		var colorGradient = getCssValuePrefix() + 'linear-gradient(';
		Object.values(creature_types).forEach(type => {
			colorGradient += colors[type] + ',';
			typeSymbol += '<img class="type-symbol" src="./images/types/' + type + '.png" alt="' + type + '">';
		});
		colorGradient = colorGradient.slice(0, -1);
		colorGradient += ')';
		creatureElement.style.background = colorGradient;
	} else {	
		const type = main_types.find(type => creature_types.indexOf(type) > -1);
		creatureElement.style.backgroundColor = colors[type];
		typeSymbol += '<img class="type-symbol" src="./images/types/' + type + '.png" alt="' + type + '">';
	}
	if(creature_types.indexOf('space') > -1)
		creatureElement.style.color = '#ffffff';

	const innerHTML = typeSymbol + `
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
	console.log("INNER HTML: " + innerHTML);
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
