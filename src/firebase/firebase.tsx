// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBZ4mcwhCFl2OmVLkRuLF_-e1OmMFqFd7g',
    authDomain: 'tipconnect-14d4b.firebaseapp.com',
    projectId: 'tipconnect-14d4b',
    storageBucket: 'tipconnect-14d4b.appspot.com',
    messagingSenderId: '396238574696',
    appId: '1:396238574696:web:cfc09b10d0efeae7e197dd',
    measurementId: 'G-VQLX42D0JL',
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const storage = getStorage(firebase);
const analytics = getAnalytics(firebase);

export default firebase;
export { storage, storageRef, uploadBytes, getDownloadURL };
