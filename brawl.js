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

const fetchCreatures = async () => {
	for (let i = 0; i < creature_number; i++) {
		await getCreatures(i);
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
    var creature = JSON.parse(response);
    createCreatureCard(creature[id]);
    });
};

function createCreatureCard(creature) {
	const creatureElement = document.createElement('div');
	creatureElement.classList.add('creature');

    const name = creature.name;

	const creature_types = creature.types(type => type.name);
	const type = main_types.find(type => creature_types.indexOf(type) > -1);

	const color = colors[type];
	creatureElement.style.backgroundColor = color;

	const innerHTML = `
        <div class="img-container">
            <img src="./images/${
                            name
                            }.jpg" alt="${name}" />
        </div>
        <div class="info">
            <span class="number">#${creature.id
							.toString()
							.padStart(3, '0')}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: <span>${type}</span></small>
        </div>
    `;

	creatureElement.innerHTML = innerHTML;
	poke_container.appendChild(creatureElement);
}

fetchCreatures();