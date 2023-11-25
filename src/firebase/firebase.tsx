import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyBZ4mcwhCFl2OmVLkRuLF_-e1OmMFqFd7g',
    authDomain: 'tipconnect-14d4b.firebaseapp.com',
    projectId: 'tipconnect-14d4b',
    storageBucket: 'tipconnect-14d4b.appspot.com',
    messagingSenderId: '396238574696',
    appId: '1:396238574696:web:cfc09b10d0efeae7e197dd',
    measurementId: 'G-VQLX42D0JL',
};

const firebase = initializeApp(firebaseConfig);
const storage = getStorage(firebase);
const analytics = getAnalytics(firebase);

export default firebase;
export { storage, storageRef, uploadBytes, getDownloadURL };
