export const cognitoAuthConfig = {
    authority: process.env.REACT_APP_AUTHORITY,
    client_id: process.env.REACT_APP_COGNITO_CLIENT_ID,
    client_secret: process.env.REACT_APP_COGNITO_CLIENT_SECRET,
    redirect_uri: process.env.REACT_APP_REDIRECT_URI,
    response_type: "code",
    scope: "email openid profile",
    silent_redirect_uri: 'http://localhost:3000/silent-renew',
    automaticSilentRenew: true,
    loadUserInfo: true,
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname)
    },
};
  