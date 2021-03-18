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
var sortField = '';

function populateDex() 
{
	getCreatures();
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
	creatureElementArray = JSON.parse(response);
	sortByValue('id');
	sortField = 'id';
    });
};

function addElementsToDiv() {
  	div_container.textContent = '';
	creatureElementArray.forEach(creature => createCreatureCard(creature));
	creatureElementArray.forEach(creature => console.log(creature.id + ': ' + creature.name + ', health ' + creature.stats.health));
}	

document.getElementById('sort-drop-down').childNodes.forEach(child => {
	child.addEventListener("click",
	    function sort() {
		var btnText = child.id.includes('.') ? child.id.split(".",2)[1] : child.id;
		console.log("Changing " + document.getElementById('drop-down-button').textContent + " to " + btnText);
		document.getElementById('drop-down-button').textContent = btnText;
		var sortOrder = document.getElementById('arrow').className === "arrow up" ? "desc" : "asc";
		sortByValue(child.id, sortOrder);
		sortField = child.id;
	});
});	

function sortByValue(key, order = 'asc') {
	creatureElementArray.sort(compareValues(key, order));
	addElementsToDiv();
}

function compareValues(key, order = 'asc') {
  console.log("SORTING by " + key + " " + order);
  key = key.toLowerCase();	
  return function innerSort(a, b) {
    var keyArr = new Array();
    var aVal = a[key];
    var bVal = b[key];
    if(key.includes('.')) {
        keyArr = key.split(".",2);
        aVal = a[keyArr[0]][keyArr[1]];
        bVal = b[keyArr[0]][keyArr[1]];
    }
    const varA = (typeof aVal === 'string')
      ? aVal.toUpperCase() : aVal;
    const varB = (typeof bVal === 'string')
      ? bVal.toUpperCase() : bVal;

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}	

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
            <img src="./images/${name}.png" alt="${name}" style='width:100px; height:auto;margin:0px auto;'/>
        </div>
        <div class="info">
            <span class="number">#${creature.id
							.toString()
							.padStart(3, '0')}</span>
            <h3 class="name">${name}</h3>
            <hr>
            <small class="stats"><span>H ${stats.health} A ${stats.attack} D ${stats.defense} S ${stats.speed}</span>
        </div>
    `;
	creatureElement.innerHTML = innerHTML;
	div_container.appendChild(creatureElement);
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

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function showDropDown() {
  document.getElementById("sort-drop-down").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

document.getElementById('arrow').addEventListener("click",
    function flipArrow() {
        var arrow = document.getElementById('arrow');
	var sortOrder = arrow.className.includes("up") ? "asc" : "desc";
        console.log("Flipping arrow from " + arrow.className);

        if(arrow.className === "arrow down"){
          arrow.className = "arrow up";
        } else {
          arrow.className = "arrow down";
        }
	sortByValue(sortField, sortOrder);
});

populateDex();
