const cardContainer = document.getElementById('collection-container');

function addElementsToCollectionDiv(user) {
    console.log("ADDING CARDS TO COLLECTION DIV");
    cardContainer.textContent = '';
    const collectionIds = getCollectionIds(user);
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

function getCollectionIds(user) {
    console.log("Returning collection ids: " + user.user_metadata.creature_collection);
    return user.user_metadata.creature_collection;
}
