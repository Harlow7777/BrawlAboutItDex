let auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
};

window.onload = async () => {
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

        var user = auth0.getUser();
        console.log("Authenticated as: " + user.user_id);
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
            redirect_uri: window.location.origin
        });
    } catch(err) {
        console.log("Log in failed", err);
    }
}

const logout = async () => {
    try {
        console.log("Logging out");
        auth0.logout({
            returnTo: window.location.origin
        });
    } catch(err) {
        console.log("Log out failed", err);
    }
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
            audience: 'https://harlow777.us.auth0.com/api/v2'
        }
    };
    axios.request(options).then(function (response) {
        console.log(response.data);
    }).catch(function(error) {
        console.error(error);
    });
}