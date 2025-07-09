import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA-IXUoW8tHsrmbchQNshm-lvRdBlNGFfo",
    authDomain: "meeting-calendar-850d6.firebaseapp.com",
    databaseURL: "https://meeting-calendar-850d6-default-rtdb.firebaseio.com",
    projectId: "meeting-calendar-850d6",
    storageBucket: "meeting-calendar-850d6.firebasestorage.app",
    messagingSenderId: "364349027722",
    appId: "1:364349027722:web:79fa2ecf9e42b72c0e4473",
    measurementId: "G-MMZDDX4Y2R"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export const auth = getAuth(app);

export { database };
