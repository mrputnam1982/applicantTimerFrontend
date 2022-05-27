import {BehaviorSubject} from 'rxjs';
const currentNameSubject = new BehaviorSubject();
const currentRoleSubject = new BehaviorSubject();

export const nameService = {
    setName,
    currentName: currentNameSubject.asObservable(),
    get currentNameValue() {
        var name = localStorage.getItem("name");
        if(name) return name;
        else return currentNameSubject.value;
    },
    setRole,
    currentRole: currentRoleSubject.asObservable(),
    get currentRoleValue() {
        var role = localStorage.getItem("role");
        if(role) return JSON.parse(role);
        else return currentRoleSubject.value;
    }
}

function setRole(role) {
    currentRoleSubject.next(role);
    localStorage.setItem("role", JSON.stringify(role));
}
function setName(name) {
    currentNameSubject.next(name);
    localStorage.setItem("name", name)
}