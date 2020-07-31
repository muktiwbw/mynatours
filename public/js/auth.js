const login = async (email, password) => {
  removeFlash();
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
  removeFlash();
  flash('warning', 'Creating your account...', null);
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/register', { name, email, password, passwordConfirm });

    if (res.data.status === 'created') {
      removeFlash();
      flash('success', res.data.message);
    } 
  } catch (error) {
    removeFLash();
    // To show messages, they're in error.response.data
    flash('error', error.response.data.message);
  }
};

const forgotPassword = async (email) => {
  removeFlash();
  flash('warning', 'Sending reset password token to your email...', null);
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/forgotPassword', { email });

    if (res.data.status === 'success') {
      removeFlash();
      flash('success', res.data.message);
    } 
  } catch (error) {
    removeFLash();
    flash('error', error.response.data.message);
  }
};

const resetPassword = async (password, passwordConfirm, token) => {
  removeFlash();
  flash('warning', 'Resetting your password...', null);
  try {
    const res = await axios.patch('http://127.0.0.1:3000/api/v1/auth/resetPassword', { password, passwordConfirm, token });

    if (res.data.status === 'updated') {
      removeFlash();
      flash('success', res.data.message);

      setTimeout(() => {
        location.assign('/login');
      }, 1500);
    } 
  } catch (error) {
    removeFLash();
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

    case 'forgot_password': 
      const fpEmail = document.querySelector('input#email').value;

      forgotPassword(fpEmail);
      break;

    case 'reset_password':
      const rpPassword = document.querySelector('input#password').value;
      const rpPasswordConfirm = document.querySelector('input#passwordConfirm').value;
      const rpResetToken = document.querySelector('meta[reset_token]').getAttribute('reset_token');

      resetPassword(rpPassword, rpPasswordConfirm, rpResetToken);
      break;
  
    default:
      break;
  }

});