import {BehaviorSubject} from "rxjs"
import axios from 'axios';
import Cookies from 'universal-cookie';
import {nameService as nameSvc} from './nameService';
const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));
//const loggedIn = new BehaviorSubject(false);

export const authenticationService = {
    login,
    logout,
    getUsernameFromJWT,
    verifyLogin,
    resendVerificationEmail,
    verificationError: false,
    loggedIn: localStorage.getItem('currentUser') ? true: false,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() { return currentUserSubject.value}
}

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function getUsernameFromJWT() {
    if(localStorage.getItem('currentUser')) {
      const user = JSON.parse(localStorage.getItem('currentUser')).token;
      return parseJwt(user).sub; 
    } else return "";
}

async function verifyLogin() {

      const cookies = new Cookies();
      const user = JSON.parse(localStorage.getItem("currentUser"));
      var response = null;
      //console.log(user);
      console.log("verifyLogin", user);
      if (user) {
        const decodedJwt = parseJwt(user.token);
        console.log("Decoded JWT", decodedJwt);
        if (decodedJwt.exp * 1000 < Date.now()) {
          localStorage.removeItem('currentUser');
          const username = decodedJwt.sub;
          const cookieValue = cookies.get("refresh_token");

          let params = {
            username,
            cookieValue
          };
          console.log("JWT expired, create new JWT using refresh token", params);
          await axios.post("/auth/refresh_token/update", params,
            {
                headers: { "Content-Type": "application/json"
                }
          })
          .then(response => {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            currentUserSubject.next(JSON.parse(localStorage.getItem('currentUser')));
            console.log("jwt refreshed", response.data);
            return response;
          }).catch(err=> {
            logout();
          })

     }

    }
    response = "DONE"
    return response;
}
async function resendVerificationEmail(username, password) {
  await axios.post('/auth/reverify', {username, password})
    .then(response => {
      console.log(response);
    }).catch(err => console.log(err))
}
async function login(username, password) {
    
    var refresh_token_data = "";
    var name = "";
    var roles = "";
    var image = "";
//    console.log(JSON.stringify({username, password}));
//    const requestOptions = {
//        method: 'PUT',
//        credentials: 'include',
//        headers: {
//
//                    'Content-Type': 'application/json',
//                    'Accept': 'application/json'
//        },
//        redirect: 'follow',
//        body: JSON.stringify({ username, password })
//    };
    if(authenticationService.loggedIn) {
      authenticationService.logout();
    }
    await axios.put('/auth/login', {username, password})
    .then(response => {
        console.log(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        name = response.data.username;
        roles = response.data.roles;
        authenticationService.loggedIn = true;
        currentUserSubject.next(JSON.parse(localStorage.getItem('currentUser')));
        console.log("loggedIn", authenticationService.loggedIn)
        setRefreshToken(username);
    }).catch(err => { console.log(err.response.data)
        if(err.response.data === "Client not enabled") authenticationService.verificationError = true;
        authenticationService.loggedIn = false;
    });

    return {name, roles};

}

async function setRefreshToken(username) {
  const cookies = new Cookies();
  var refresh_token_data = "";
  await axios.post("/auth/refresh_token/generate", username,
  {
      headers: { "Content-Type": "text/plain"},

  }).then(response => {
      console.log(response.data);
      refresh_token_data = response.data;
      console.log("SetCookie refresh_token", refresh_token_data);

      cookies.set(refresh_token_data.name, 
        refresh_token_data.value,
        {path: '/',
         maxAge: refresh_token_data.maxAge,
         secure: refresh_token_data.secure});
      console.log(cookies.getAll());
  }).catch(err => console.log(err));


}
function logout() {
    
    const cookies = new Cookies();
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    cookies.remove('refresh_token', {path: '/'})
    authenticationService.loggedIn = false;
    nameSvc.setName("");
    nameSvc.setRole("");
    currentUserSubject.next(null);
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    console.log("Logged out", nameSvc.currentNameValue);
}
