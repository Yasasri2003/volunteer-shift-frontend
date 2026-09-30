// src/components/GoogleSignInButton.jsx
import { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onCredential, onError, text = 'continue_with' }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return; // not configured — component just renders nothing below

    function tryInit() {
      if (!window.google?.accounts?.id) {
        // The GIS script loads async — retry briefly until it's ready.
        setTimeout(tryInit, 150);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onCredential(response.credential);
          } else {
            onError?.('Google sign-in did not return a credential');
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 336,
          text, // 'signup_with' | 'signin_with' | 'continue_with' — set per page
        });
      }
    }
    tryInit();
  }, [onCredential, onError, text]);

  if (!CLIENT_ID) {
    // Google sign-in isn't configured on this deployment — fail silently
    // rather than showing a broken/non-functional button.
    return null;
  }

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
