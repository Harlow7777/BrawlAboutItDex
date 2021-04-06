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

            window.history.replaceState({}, document.title, "/");
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

        var user = await auth0.getUser();
	    var idToken = await auth0.getIdTokenClaims();
	    addElementsToCollectionDiv(idToken);
    } else {
        document.getElementById("btn-login").classList.remove("hidden");
        document.getElementById("btn-logout").classList.add("hidden");
        document.getElementById("gated-content").classList.add("hidden");
    }
}

const cardContainer = document.getElementById('collection-container');

async function getCollectionIds() {
    var idToken = await auth0.getIdTokenClaims();
    Object.keys(idToken).forEach(key => console.log("idToken key,val: " + key + ", " + idToken[key]));
    auth0.checkSession({
  	nonce: idToken['nonce']
    }, function (err, authResult) {
    	Object.keys(authResult).forEach(key => console.log("checkSession key,val: " + key + ", " + authResult[key]));
    });
    const user_metadata = idToken['https://harlow777.brawlaboutit.com/user_metadata'];
    if(Object.keys(user_metadata).includes('creature_collection')) {
       console.log("Returning " + user_metadata['creature_collection']);
       return user_metadata['creature_collection'];
    }
    return null;
}

function addElementsToCollectionDiv(idToken) {
    const user_metadata = idToken['https://harlow777.brawlaboutit.com/user_metadata'];
    Object.keys(user_metadata).forEach(key => console.log(key + ": " + user_metadata[key]));
    if(Object.keys(user_metadata).includes('creature_collection')) {
       const collectionIds = [user_metadata['creature_collection']];
       console.log("COLLECTION IDS: " + collectionIds);
       cardContainer.textContent = '';
       const cardDetails = getCardDetails();
       collectionIds.forEach(cardId => function() {
           if(Object.keys(cardDetails).includes(cardId)) {
               console.log("FOUND NAME FOR " + cardId + ": " + cardDetails[key]);
               addCardImage(cardDetails[key]);
           } else {
               console.log("NO NAME FOR CARDID: " + cardId);
           }
       });
    } else {
        cardContainer.textContent = 'You currently have 0 cards, visit the shop to buy some!';
    }
}

function getCardDetails() {
    var options = {
        method: 'GET',
        url: 'https://slize2id4b.execute-api.us-east-2.amazonaws.com/card_details',
        headers: {'content-type': 'application/json'}
    };
    axios.request(options).then(function (response) {
        console.log("RETRIEVED CARD NAMES: " + Object.values(response.data));
        return response.data;
    }).catch(function(error) {
        console.error(error);
    });
}

function addCardImage(name) {
    var img = new Image(200,300);
    img.classList.add('card');
    img.src = './images/cards/' + name + '.png';
    cardContainer.appendChild(img);
}

const login = async () => {
    try {
        console.log("Logging in");

        await auth0.loginWithRedirect({
            redirect_uri: window.location.origin + "/BrawlAboutItDex"
        });
    } catch(err) {
        console.log("Log in failed", err);
    }
}

const logout = async () => {
    try {
        console.log("Logging out");
        auth0.logout({
            returnTo: window.location.origin + "/BrawlAboutItDex"
        });
    } catch(err) {
        console.log("Log out failed", err);
    }
}

function loadDex() {
	document.getElementById("dex-container").classList.remove("hidden");
	document.getElementById("collection-container").classList.add("hidden");
	document.getElementById("collection-link").classList.remove("active");
	document.getElementById("dex-link").classList.add("active");
}

function loadCollection() {
	document.getElementById("collection-container").classList.remove("hidden");
	document.getElementById("dex-container").classList.add("hidden");
	document.getElementById("dex-link").classList.remove("active");
	document.getElementById("collection-link").classList.add("active");
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
	await validateRedemptionCode(code);
        addCardToUserMetadata(user, code);
});

async function validateRedemptionCode(code) {
   var options = {
        method: 'GET',
        url: 'https://slize2id4b.execute-api.us-east-2.amazonaws.com/redemption-codes/' + code,
        headers: {'content-type': 'application/json'}
    };
    axios.request(options).then(function (response) {
        console.log("VALID REDEMPTION CODE: " + response.data);
    }).catch(function(error) {
        console.error(error);
    }); 
}	

async function addCardToUserMetadata(user, cardId) {
    var cardIdArray = [];
    await getCollectionIds().then(function(collectionIds) {
	    console.log("EXISTING COLLECTION IDS: " + collectionIds);
	    cardIdArray.push(cardId);
	    if(collectionIds != null) {
	    	collectionIds.forEach(id => cardIdArray.push(id));
	    }	    
    });
    const authToken = await retrieveAuthAPIToken();
    console.log("USING AUTH TOKEN: " + authToken);
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
    console.log("RETURNING AUTH TOKEN: " + response.data['access_token']);
    return response.data['access_token'];
}
