const login = async (email, password) => {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/login', { email, password })

    if (res.data.status === 'success') {
      flash('success', 'You are logged in successfully');

      setTimeout(() => {
        location.assign('/');
      }, 2000);
    } 
  } catch (error) {
    // To show messages, they're in error.response.data
    flash('error', error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  login(email, password);
});