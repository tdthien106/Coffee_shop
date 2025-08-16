export function getUser(){
    try{
        return JSON.parse(sessionStorage.getItem('user') || "null");
    }catch{
        return null;
    }
}

export function getToken(){
    return sessionStorage.getItem('token') || null;
}

export function isLoggedIn(){
    return !!getToken() && !!getUser();
}

export function logout(){
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
}