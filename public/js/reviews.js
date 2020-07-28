const deleteRev = async function(e) {
  e.preventDefault();

  removeFlash();
  flash('warning', 'Removing review...', null);

  const { review_id, tour_id } = this.dataset;

  try {
    const res = await axios.delete(`/api/v1/tours/${tour_id}/reviews/${review_id}`, axiosConfig);

    if (res) {
      this.parentElement.parentElement.remove();
      
      removeFlash();
      flash('success', 'Success removing your review');
    }
  } catch (error) {
    removeFlash();
    flash('error', 'There has been a problem removing your review');
    console.log(error.response);
  }
}

const btnDel = document.querySelectorAll('a.delete-rev');

btnDel.forEach(dl => dl.addEventListener('click', deleteRev));