import { type AuthProviderProps } from 'react-oidc-context';
import { type User, WebStorageStateStore } from 'oidc-client-ts';

// Helper removed (unused and caused type errors)

export const oidcConfig: AuthProviderProps = {
  authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin + '/login',
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: (user: User | void) => {
    console.log('OIDC: Signin Callback success', user);
    window.history.replaceState({}, document.title, window.location.pathname);

    if (user) {
      // Simple redirection logic base on token inspection could go here
      // For now, we leave the user on /login (which should redirect to dashboard)
      // or we can force it here.
      // Let's let the Login component handle redirection based on useAuth hook.
    }
  },
  onRemoveUser: () => console.log('OIDC: User removed'),
  onSignoutCallback: () => {
    console.log('OIDC: Signout callback');
    window.location.href = '/login';
  },
};
