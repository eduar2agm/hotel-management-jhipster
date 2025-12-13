import { type AuthProviderProps } from 'react-oidc-context';

export const oidcConfig: AuthProviderProps = {
  authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin + '/login',
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: (user) => {
    console.log('OIDC: Signin Callback success', user);
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onRemoveUser: () => console.log('OIDC: User removed'),
  onSignoutCallback: () => console.log('OIDC: Signout callback'),
};
