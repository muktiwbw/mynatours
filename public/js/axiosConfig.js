const jwt = document.querySelector('meta[jwt]').getAttribute('jwt');
const axiosConfig = { 
  headers: {
    "Content-Type": 'application/json;charset=UTF-8',
    "Accept" : "application/json",
    "Authorization": `Bearer ${jwt}`
  } 
};