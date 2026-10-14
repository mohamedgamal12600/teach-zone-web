// Add the public Firebase Web app config from Project settings > Your apps > Web.
// Do not put service-account keys or other private credentials in this file.
export const firebaseConfig = {
  apiKey: 'AIzaSyDRUULU3QqbFfHcupuGa0I9UDNrCpqIhPo',
  authDomain: 'teach-zone-adec7.firebaseapp.com',
  databaseURL: 'https://teach-zone-adec7-default-rtdb.firebaseio.com',
  projectId: 'teach-zone-adec7',
  storageBucket: 'teach-zone-adec7.firebasestorage.app',
  messagingSenderId: '395561619175',
  appId: '1:395561619175:web:f064ccceac011ff37d5c42',
  measurementId: 'G-DSKW1KV289',
};

const requiredFields = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
export const configured = requiredFields.every((field) => {
  const value = firebaseConfig[field];
  return typeof value === 'string' && value.trim() !== '' && !value.startsWith('YOUR_');
});
