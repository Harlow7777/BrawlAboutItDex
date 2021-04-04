let auth0 = null;
let authToken = null;

const fetchAuthConfig = () => fetch("/BrawlAboutItDex/auth_config.json");

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

function addElementsToCollectionDiv(idToken) {
    console.log("ADDING CARDS TO COLLECTION DIV for: " + idToken);
    const user_metadata = idToken['https://harlow777.brawlaboutit.com/user_metadata'];
    Object.keys(user_metadata).forEach(key => console.log(key + ": " + user_metadata[key]));
    const collectionIds = [user_metadata['creature_collection']];
    console.log("COLLECTION IDS: " + collectionIds);
    cardContainer.textContent = '';
    collectionIds.forEach(cardId => addCardImage(cardId));
}

function addCardImage(cardId) {
    //get name associate with cardId
    console.log("Getting image associated with " + cardId);
    const name = "potito";
    var img = new Image();
    img.src = name + '.png';
    const cardElement = "<img src=\"" + name + ".png\" alt=" + name + " width=\"500\" height=\"600\">";
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
}

function loadCollection() {
	document.getElementById("collection-container").classList.remove("hidden");
	document.getElementById("dex-container").classList.add("hidden");
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
        addCardToUserMetadata(user);
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

async function addCardToUserMetadata(user) {
    await retrieveAuthAPIToken();
    var options = {
        method: 'PATCH',
        url: 'https://harlow777.us.auth0.com/api/v2/users/' + user.sub,
        headers: {authorization: 'Bearer ' + authToken,'content-type': 'application/json'},
        data: {
            user_metadata: {
                creature_collection:'1000'
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
    axios.request(options).then(function (response) {
	authToken = response.data['access_token'];
    }).catch(function(error) {
        console.error(error);
        authToken = null;
    });
    return authToken;
}
