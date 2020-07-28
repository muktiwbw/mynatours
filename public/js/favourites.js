const deleteFav = async function(e) {
  e.preventDefault();

  removeFlash();
  flash('warning', 'Removing tour...', null);

  const tourId = this.id;

  try {
    const res = await axios.post(`/api/v1/tours/${tourId}/users/removeFromFavourites`, {}, axiosConfig);

    if (res.data.status === 'success') {
      this.parentElement.parentElement.remove();
      
      removeFlash();
      flash('success', 'Tour has been removed from favourites');
    }
  } catch (error) {
    removeFlash();
    flash('error', 'There has been a problem removing tour from favourites');
    console.log(error.response);
  }
}

const btnDel = document.querySelectorAll('a.delete-fav');

btnDel.forEach(dl => dl.addEventListener('click', deleteFav));