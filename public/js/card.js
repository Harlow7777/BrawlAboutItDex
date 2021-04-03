const cardContainer = document.getElementById('collection-container');

async function addElementsToCollectionDiv(user) {
    console.log("ADDING CARDS TO COLLECTION DIV");
    cardContainer.textContent = '';
    const collectionIds = await getCollectionIds(user);
    console.log("Retrieved collection id array: " + Object.values(collectionIds));
	collectionIds.forEach(cardId => getCardImages(cardId));
}

function getCardImages(cardId) {
    //get name associate with cardId
    console.log("Getting image associated with " + cardId);
    const name = "potito"
    const cardElement = "<img src=\"" + name + ".png\" alt=" + name + " width=\"500\" height=\"600\">";
    cardContainer.appendChild(cardElement);
}

async function getCollectionIds(user) {
    await retrieveAuthAPIToken();
    var options = {
        method: 'GET',
        url: 'https://harlow777.us.auth0.com/api/v2/users/' + user.sub,
        headers: {authorization: 'Bearer ' + authToken,'content-type': 'application/json'},
    };
    axios.request(options).then(function (response) {
        console.log("Returning collection ids: " + response.data['user_metadata']['creature_collection']);
        return response.data['user_metadata']['creature_collection'];
    }).catch(function(error) {
        console.error(error);
    });
}
