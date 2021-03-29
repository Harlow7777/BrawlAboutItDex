let auth0 = null;

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
    console.log("USER AUTHENTICATED: " + isAuthenticated);
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;

    if(isAuthenticated) {
        document.getElementById("btn-logout").classList.remove("hidden");
        document.getElementById("btn-login").classList.add("hidden");

        document.getElementById("gated-content").classList.remove("hidden");

        var user = await auth0.getUser();
	console.log("User Authenticated as: " + user.sub);
	Object.keys(user).forEach(key => console.log(key + ": " + user[key]));
    } else {
        document.getElementById("btn-login").classList.remove("hidden");
        document.getElementById("btn-logout").classList.add("hidden");
        document.getElementById("gated-content").classList.add("hidden");
    }
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

document.getElementById('redeem-button').addEventListener("click",
    async function redeemCode() {
        var code = document.getElementById('redeem-input').value;
	const authToken = retrieveAuthAPIToken();
        const user = await auth0.getUser();
        console.log("METADATA for " + user.sub + ": " + user.user_metadata);
        console.log("Redemption code: " + code);
        //lookup card id based on redemption code
        addCardToUserMetadata(user, authToken);
});

function addCardToUserMetadata(user, authToken) {
// 	curl -H "Authorization: Bearer " -X PATCH  -H "Content-Type: application/json" -d '{"user_metadata":{"profileCode":777}}' https://harlow777.us.auth0.com/api/v2/users/google-oauth2%7C107083672195276515346
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

function retrieveAuthAPIToken() {
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
        console.log(response.data);
        return response.data.access_token;
    }).catch(function(error) {
        console.error(error);
        return null;
    });
}
