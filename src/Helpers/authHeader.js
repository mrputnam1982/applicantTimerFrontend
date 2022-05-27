import {authenticationService as auth} from '../Services/authenticationService'

export function authHeader() {
    // return authorization header with jwt token
    const currentUser = auth.currentUserValue;
    console.log("authHeader", currentUser.token);
    if (currentUser && currentUser.token) {
            return `Bearer ${currentUser.token}`;
    } else {
        return {};
    }

}