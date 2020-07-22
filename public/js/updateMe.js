document.querySelector('.form.form-user-data').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = new FormData;
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);

  try {
    const res = await axios.patch('http://127.0.0.1:3000/api/v1/users/updateMe', form, axiosConfig);

    if (res.data.status === 'updated') {
      flash('success', 'Your data has been updated');
      
      document.querySelector('.form__user-photo').setAttribute('src', `/img/users/${res.data.data.user.photo}`);
      document.querySelector('.nav__user-img').setAttribute('src', `/img/users/${res.data.data.user.photo}`);
      
      document.getElementById('photo').value = '';
    }
  } catch (error) {
    flash('error', 'There has been a problem updating your data');
  }
});

document.querySelector('.form.form-user-settings').addEventListener('submit', async function(e) {
  e.preventDefault();

  const currPassword = document.getElementById('password-current').value;
  const newPassword = document.getElementById('password').value;
  const newPasswordConfirm = document.getElementById('password-confirm').value;

  // alert(`${currPassword}, ${newPassword}, ${newPasswordConfirm}`);

  try {
    const res = await axios.patch('http://127.0.0.1:3000/api/v1/users/updatePassword', { currPassword, newPassword, newPasswordConfirm }, axiosConfig);

    if (res.data.status === 'updated') {
      axiosConfig.headers["Authorization"] = `Bearer ${res.data.data.token}`;

      flash('success', 'Your password has been successfully updated');

      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    }
  } catch (error) {
    flash('error', error.response.data.message);
  }
})