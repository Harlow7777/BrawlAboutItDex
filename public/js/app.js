let auth0 = null;

const fetchAuthConfig = () => fetch("./auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
};

window.addEventListener ? 
window.addEventListener("load",asyncLoad,false) :
window.attachEvent && window.attachEvent("onload",asyncLoad);

async function asyncLoad() {
    await configureClient();

    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();

    if(isAuthenticated) {
        return;
    }

    const query = window.location.search;
    if(query.includes("code=") && query.includes("state=")) {
        try {
            await auth0.handleRedirectCallback();

            updateUI();

            window.history.replaceState({}, document.title, "/BrawlAboutItDex");
        } catch(err) {
            console.log("Redirect callback failed", err);
        }
    }
}

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;

    if(isAuthenticated) {
        document.getElementById("btn-logout").classList.remove("hidden");
        document.getElementById("btn-login").classList.add("hidden");

        document.getElementById("gated-content").classList.remove("hidden");

	    addElementsToCollectionDiv();
    } else {
        document.getElementById("btn-login").classList.remove("hidden");
        document.getElementById("btn-logout").classList.add("hidden");
        document.getElementById("gated-content").classList.add("hidden");
    }
}

const cardContainer = document.getElementById('collection-container');

async function addElementsToCollectionDiv() {
    cardContainer.textContent = '';
    const response = await getCollectionIds();
    const collectionIds = response.data['user_metadata']['creature_collection'];
    if(collectionIds != null) {
        const cardDetails = await getCardDetails();
        collectionIds.forEach(function(cardId) {
            Object.values(cardDetails.data['Items']).forEach(function(cardDetail) {
                if(parseInt(cardDetail['card_id']) === parseInt(cardId)) {
                    addCardImage(cardDetail['name']);
                }
            });
        });
    } else {
        cardContainer.textContent = 'You currently have 0 cards, visit the shop to buy some!';
    }
}

async function getCollectionIds() {
    var user = await auth0.getUser();
    const authToken = await retrieveAuthAPIToken();
    var options = {
        method: 'GET',
        url: 'https://harlow777.us.auth0.com/api/v2/users/' + user.sub,
        headers: {authorization: 'Bearer ' + authToken,'content-type': 'application/json'},
    };
    return axios.request(options);
}				

async function getCardDetails() {
    var options = {
        method: 'GET',
        url: 'https://slize2id4b.execute-api.us-east-2.amazonaws.com/card-details',
        headers: {'content-type': 'application/json'}
    };
    return axios.request(options);
}

function addCardImage(name) {
    var img = new Image(200,300);
    img.classList.add('card');
    img.src = 'https://harlow7777.github.io/BrawlAboutItDex/images/cards/' + name + '.png';
    cardContainer.appendChild(img);
}

const login = async () => {
    try {
        console.log("Logging in");

        await auth0.loginWithRedirect({
            redirect_uri: window.location.href
        });
    } catch(err) {
        console.log("Log in failed", err);
    }
}

const logout = async () => {
    try {
        console.log("Logging out");
        auth0.logout({
            returnTo: window.location.href
        });
    } catch(err) {
        console.log("Log out failed", err);
    }
    window.history.replaceState({}, document.title, "/BrawlAboutItDex");
}

function loadDex() {
    document.getElementById("home-container").classList.add("hidden");
	document.getElementById("dex-container").classList.remove("hidden");
	document.getElementById("collection-container").classList.add("hidden");
	document.getElementById("collection-link").classList.remove("active");
	document.getElementById("dex-link").classList.add("active");
	document.getElementById("home-link").classList.remove("active");
}

function loadCollection() {
    document.getElementById("home-container").classList.add("hidden");
	document.getElementById("collection-container").classList.remove("hidden");
	document.getElementById("dex-container").classList.add("hidden");
	document.getElementById("dex-link").classList.remove("active");
	document.getElementById("collection-link").classList.add("active");
	document.getElementById("home-link").classList.remove("active");
}

function loadHome() {
    document.getElementById("home-container").classList.remove("hidden");
	document.getElementById("collection-container").classList.add("hidden");
	document.getElementById("dex-container").classList.add("hidden");
	document.getElementById("dex-link").classList.remove("active");
	document.getElementById("collection-link").classList.remove("active");
    document.getElementById("home-link").classList.add("active");
}

document.getElementById("redeem-input").onchange = toggleRedeemButton;

function toggleRedeemButton() {
	const redeemButton = document.getElementById("redeem-button");
	redeemButton.disabled = !this.value;
}

document.getElementById('redeem-button').addEventListener("click",
    async function redeemCode() {
        var code = document.getElementById('redeem-input').value;
        const user = await auth0.getUser();
        console.log("Redemption code: " + code);
	    const validCode = await validateRedemptionCode(code);
        if(validCode) {
            addCardToUserMetadata(user, validCode['card_id']);
        } else {
            console.log("Invalid Redemption code");
        }
});

async function validateRedemptionCode(code) {
   var options = {
        method: 'GET',
        url: 'https://slize2id4b.execute-api.us-east-2.amazonaws.com/redemption-codes',
        headers: {'content-type': 'application/json'}
    };
    axios.request(options).then(function (response) {
        var items = response.data['Items'];
        Object.values(items).forEach(item =>
            Object.keys(item).forEach(itemKey => {
                console.log(itemKey + ": " + item[itemKey]);
                if(item[itemKey].equals(code)) {
                        console.log("VALID REDEMPTION CODE: " + code);
                        return true;
                }
            }));
        return false;
    }).catch(function(error) {
        console.error(error);
        return false;
    }); 
}	

async function addCardToUserMetadata(user, cardId) {
    var cardIdArray = [];
    cardIdArray.push(cardId);
    const response = await getCollectionIds();
    const collectionIds = response.data['user_metadata']['creature_collection'];
	
    if(collectionIds != null) {
      collectionIds.forEach(id => cardIdArray.push(id));
    }	    
    
    const authToken = await retrieveAuthAPIToken();
    var options = {
        method: 'PATCH',
        url: 'https://harlow777.us.auth0.com/api/v2/users/' + user.sub,
        headers: {authorization: 'Bearer ' + authToken,'content-type': 'application/json'},
        data: {
            user_metadata: {
                creature_collection: cardIdArray
            }
        }
    };
    axios.request(options).then(function (response) {
        console.log(response.data);
    }).catch(function(error) {
        console.error(error);
    }); 
}    

async function retrieveAuthAPIToken() {
    var options = {
        method: 'POST',
        url: 'https://harlow777.us.auth0.com/oauth/token',
        headers: {'content-type': 'application/json'},
        data: {
            grant_type: 'client_credentials',
            client_id: 'fiEPVos93440A4u7lROfpUZ3tXTGEP7W',
            client_secret: '4-0MCwufuwx5Ouc-w2lUQ4FtX46YJFh-zMzIg0MdMRLbNV4auZuOvaRh_PmnrYFd',
            audience: 'https://harlow777.us.auth0.com/api/v2/'
        }
    };
    const response = await axios.request(options);
    return response.data['access_token'];
}
