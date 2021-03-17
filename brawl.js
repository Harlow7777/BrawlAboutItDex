const divContainer = document.getElementById('div_container');
const creature_number = 13;
const colors = {
	fire: '#FDDFDF',
	nature: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#E1B48C',
	sound: '#FFAFFF',
	air: '#9DE3FF',
	muscle: '#FFEFD6',
	mind: '#B268FF',
	space: '#000000',
	ghost: '#ffffff',
	metal: '#B0B0B0' 
};
const main_types = Object.keys(colors);
var creatureElementArray = new Array();

function fetchCreatures() 
{
// 	for (let i = 0; i < creature_number; i++) {
		getCreatures();
// 	}
};

function loadJSON(callback) 
{
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

function getCreatures() 
{
    loadJSON(function(response) 
    {
	console.log(JSON.parse(response).length);
	creatureElementArray = JSON.parse(response);
	console.log(creatureElementArray.length);
//     createCreatureCard(creatures[id]);
    });
};

function createCreatureCard(creature) 
{
	const creatureElement = document.createElement('div');
	creatureElement.classList.add('creature');

    	const name = creature.name;
	const stats = creature.stats;
	var typeSymbol = '';

	const creature_types = creature.types.map(type => type.name);
	if(creature_types.length > 1) {
		var colorGradient = getCssValuePrefix() + 'linear-gradient(';
		Object.values(creature_types).forEach((type, index) => {
			colorGradient += colors[type] + ',';
			if(index > 0)
				typeSymbol += '<img class="type-symbol" src="./images/types/' + type + '.png" alt="' + type + '" style="margin-left: 0px">'
			else		
				typeSymbol += '<img class="type-symbol" src="./images/types/' + type + '.png" alt="' + type + '" style="margin-left: 100px">';
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

	const innerHTML = `
	<div style='display: flex; justify-content: right; text-align:right; max-width:100%;'>`
	      + typeSymbol + `
	</div>
	<div class="img-container" style='text-align:center;'>
            <img src="./images/${name}.jpg" alt="${name}" style='width:50px; height:100px;margin:0px auto;'/>
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
	creatureElementArray.push(creatureElement);
// 	div_container.appendChild(creatureElement);
}

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

function sortCreaturesById() 
{
	creatureElementArray.sort((a, b) => {
    		return a.id - b.id;
	});					
}	

function addCreaturesToDiv()
{
	creatureElementArray.forEach(creatureElement => 	
		div_container.appendChild(creatureElement));
}

getCreatures();
console.log("CREATURES FETCHED: " + creatureElementArray.length);
creatureElementArray.forEach(creatureElement => console.log(Object.values(creatureElement)));
// sortCreaturesById();
// addCreaturesToDiv();
