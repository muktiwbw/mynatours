const login = async (email, password) => {
  flash('warning', 'Logging you in...', null);

  try {
    const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/login', { email, password });

    if (res.data.status === 'success') {
      removeFlash();
      flash('success', 'You are logged in successfully');

      setTimeout(() => {
        location.assign('/');
      }, 2000);
    } 
  } catch (error) {
    removeFlash();
    // To show messages, they're in error.response.data
    flash('error', error.response.data.message);
  }
};

const register = async (name, email, password, passwordConfirm) => {
  flash('warning', 'Creating your account...', null);
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/register', { name, email, password, passwordConfirm });

    if (res.data.status === 'created') {
      removeFlash();
      flash('success', 'Your account is registered successfully');

      setTimeout(() => {
        location.assign('/');
      }, 2000);
    } 
  } catch (error) {
    removeFLash();
    // To show messages, they're in error.response.data
    flash('error', error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  const formType = document.querySelector('input[type="hidden"]');

  switch (formType.value) {
    case 'login':
      const lgEmail = document.getElementById('email').value;
      const lgPassword = document.getElementById('password').value;
      
      login(lgEmail, lgPassword);
      break;
      
    case 'register':
      const rgName = document.getElementById('name').value;
      const rgEmail = document.getElementById('email').value;
      const rgPassword = document.getElementById('password').value;
      const rgPasswordConfirm = document.getElementById('passwordConfirm').value;

      register(rgName, rgEmail, rgPassword, rgPasswordConfirm);
      break;
  
    default:
      break;
  }

});