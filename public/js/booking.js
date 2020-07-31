if (document.querySelector('button#booking')) document.querySelector('button#booking').onclick = function(e) {
  e.preventDefault();

  const bookingDateWrapper = document.querySelector('#bookingDateWrapper');

  // * toggle
  if (!this.hasAttribute('clicked')) {
    this.classList.remove('span-all-rows');
    this.classList.add('ma-bt-sm');
    this.setAttribute('clicked', true);
    
    bookingDateWrapper.classList.remove('hide')
  } else {
    bookingDateWrapper.classList.add('hide')
    
    this.removeAttribute('clicked');
    this.classList.remove('ma-bt-sm');
    this.classList.add('span-all-rows');
  }

}

if (document.querySelector('#bookingDate')) document.querySelector('#bookingDate').onchange = async function(e) {
  e.preventDefault();

  // * Temporary handler
  flash('warning', 'Retrieving checkout session...', null);
  this.setAttribute('disabled', true);

  if (this.value === 'reset') return;

  const payload = { startDate: this.value };

  try {
    const res = await axios.post(`https://cosmic-desert-natours.herokuapp.com/api/v1/tours/${this.getAttribute('tour-id')}/bookings/checkout`, payload, axiosConfig);

    if (res) {
      removeFlash();

      const { stripePublicKey, stripeCheckoutSessionId } = res.data.data;
      
      const stripe = Stripe(stripePublicKey);

      flash('success', 'Redirecting you to checkout page...', null);

      await stripe.redirectToCheckout({ sessionId: stripeCheckoutSessionId });
    }
  } catch (error) {
    removeFlash();
    this.removeAttribute('disabled');
    console.log(error);
    // flash('error', error.response.message);
  }
}

if (document.querySelector('#favBtn')) document.querySelector('#favBtn').onclick = async function(e) {
  removeFlash();
  flash('warning', 'Adding to favourites...', null);

  e.preventDefault();

  const { tour_id } = this.dataset;

  let isFavourite = this.hasAttribute('isFavourite');

  const endpoint = isFavourite ? 'removeFromFavourites' : 'addToFavourites';

  try {
    const res = await axios.post(`https://cosmic-desert-natours.herokuapp.com/api/v1/tours/${tour_id}/users/${endpoint}`, {}, axiosConfig);

    if (res.data.status === 'success') {
      isFavourite = !isFavourite;
      
      removeFlash();
      flash('success', isFavourite ? `Added to favourites. <a class="no-decor" href="/me/favourites">Manage favourites</a>` : `Removed from favourites. <a class="no-decor" href="/me/favourites">Manage favourites</a>`);

      const btnTxt = document.querySelector('span#favBtnText');
      btnTxt.innerHTML = isFavourite ? 'Remove from favourite' : 'Add to favourite';

      if (isFavourite) {
        this.classList.add('isFav');
        this.setAttribute('isFavourite', isFavourite);
      } else {
        this.classList.remove('isFav');
        this.removeAttribute('isFavourite');
      } 
    }
  } catch (error) {
    console.log(error);
    removeFlash();
    flash('error', 'There\'s a problem adding to your favourites');
  }
};

const reviewStars = document.querySelectorAll('svg.review-star');

const starsHighlightHover = function (e) {
  const index = this.dataset.index;

  for (let i=0; i<5; i++) {
    const star = document.querySelector(`svg#rs${i+1}`);

    if ((i+1)<=index) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  }
};

const starsHighlightLeave = function (e) {
  reviewStars.forEach(st => st.classList.remove('active'));
};

const starsCommit = function (e) {
  reviewStars.forEach(st => st.classList.remove('active'));
  reviewStars.forEach(st => st.classList.remove('commit-active'));
  reviewStars.forEach(st => st.classList.remove('rating'));

  /**
   * * rating: Final rating score
   * * commit-active: Stars below the rating star
   */
  const index = this.dataset.index;
    
  // * Toggle turn off rating if user clicks the same star as final rating
  if (this.classList.contains('rating')) return;

  for (let i=0; i<5; i++) {
    const star = document.querySelector(`svg#rs${i+1}`);

    if ((i+1)<=index) {
      star.classList.add('commit-active');
      
      if ((i+1)==index) star.classList.add('rating');
    } else {
      star.classList.remove('commit-active');
      star.classList.remove('rating');
    }
  }
};

if (reviewStars) reviewStars.forEach(st => st.addEventListener('mouseover', starsHighlightHover));
if (reviewStars) reviewStars.forEach(st => st.addEventListener('mouseleave', starsHighlightLeave));
if (reviewStars) reviewStars.forEach(st => st.addEventListener('click', starsCommit));

const reviewForm = document.querySelector('form#reviewSubmit');

const submitReview = async function(e) {
  e.preventDefault();

  removeFlash();

  const ratingElem = document.querySelector('svg.rating');
  const reviewElem = document.querySelector('textarea#review');

  if (!ratingElem) {
    flash('error', 'Please input the rating before submiting');

    return;
  }

  const rating = ratingElem.dataset.index;
  const review = reviewElem.value;
  const method = document.querySelector('input#reviewMethod').value;
  
  flash('warning', 'Saving your review...', null);

  try {
    let res;
    
    if (method === 'create') {
      res = await axios.post(`https://cosmic-desert-natours.herokuapp.com/api/v1/tours/${this.dataset.tour_id}/reviews`, { review, rating }, axiosConfig);
    } else {
      res = await axios.patch(`https://cosmic-desert-natours.herokuapp.com/api/v1/tours/${this.dataset.tour_id}/reviews/${this.dataset.review_id}`, { review, rating }, axiosConfig);
    }

    if (res.data.status === 'success') {
      removeFlash();
      flash('success', 'Success saving your review');

      setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (error) {
    removeFlash();
    flash('error', 'There\'s a problem saving you review');
    console.log(error);
  }
};

if (reviewForm) reviewForm.addEventListener('submit', submitReview);