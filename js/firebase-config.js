/* firebase-config.js – replace the placeholder values with your Firebase Web App config */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // Optional – if you use Google Analytics:
  measurementId: "YOUR_MEASUREMENT_ID"
};

/*
  To get these values:
  1. Open the Firebase console for the project *teach-zone-adec7*.
  2. Click the gear icon → Project settings → "Your apps".
  3. If a Web app is not listed, click "Add app" → Web and register one.
  4. Copy the config object shown and replace the placeholders above.
  5. Save this file – it will be imported by other modules.
*/
