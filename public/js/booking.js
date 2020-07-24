document.querySelector('button#booking').onclick = function(e) {
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

document.querySelector('#bookingDate').onchange = async function(e) {
  e.preventDefault();

  // * Temporary handler
  flash('warning', 'Retrieving checkout session...', null);
  this.setAttribute('disabled', true);

  if (this.value === 'reset') return;

  const payload = { startDate: this.value };

  try {
    const res = await axios.post(`/api/v1/tours/${this.getAttribute('tour-id')}/bookings/checkout`, payload, axiosConfig);

    if (res) {
      removeFlash();

      const { stripePublicKey, stripeCheckoutSessionId } = res.data.data;
      
      const stripe = Stripe(stripePublicKey);

      await stripe.redirectToCheckout({ sessionId: stripeCheckoutSessionId });
    }
  } catch (error) {
    removeFlash();
    this.removeAttribute('disabled');
    console.log(error);
    // flash('error', error.response.message);
  }
}