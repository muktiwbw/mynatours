// * TOUR FORM =======================================================================
// * =================================================================================

// * ==== Multiple field handler =====================================================
const btHandler = function(e) {
  e.preventDefault();

  const src = this.getAttribute('evtSrc');
  const action = this.getAttribute('action');
  const container = document.querySelector(`.${src}-container`);
  
  switch (action) {
    case 'ad':
      switch (src) {
        case 'sd':
          const el = document.createElement('input');
          el.className = 'ma-bt-md startDates form__input';
          el.setAttribute('type', 'datetime-local');
          el.setAttribute('required', true);

          container.appendChild(el);
          break;

        case 'loc':
          const wrapper = document.createElement('div');
          const wrapperContent = document.createElement('div');
          const wrapperHeader = document.createElement('h1');
          const wrapperInput = document.createElement('div');
          const coordinate = document.createElement('input');
          const description = document.createElement('input');
          const day = document.createElement('input');

          wrapper.className = 'loc-wrapper card even-shadow ma-bt-md';
          wrapperContent.className = 'card__details';
          wrapperHeader.className = 'card__sub-heading';
          wrapperHeader.innerText = `Location ${container.childElementCount+1}`;
          wrapperInput.className = 'form__group card__text loc-input-wrapper';

          coordinate.className = 'ma-bt-sm locations coordinate form__input';
          coordinate.setAttribute('type', 'text');
          coordinate.setAttribute('placeholder', 'Coordinates (e.g. -74.70256042480406,39.98211362488752)');
          coordinate.setAttribute('required', true);
          coordinate.setAttribute('idx', container.childElementCount + 1);
          coordinate.onfocus = locInputHandler;

          description.className = 'ma-bt-sm locations description form__input';
          description.setAttribute('type', 'text');
          description.setAttribute('placeholder', 'Location name (e.g. Heroes Monument)');
          description.setAttribute('required', true);

          day.className = 'ma-bt-sm locations day form__input';
          day.setAttribute('type', 'number');
          day.setAttribute('placeholder', 'What day (e.g. 2)');
          day.setAttribute('required', true);
          
          wrapperInput.appendChild(description);
          wrapperInput.appendChild(coordinate);
          wrapperInput.appendChild(day);

          wrapperContent.appendChild(wrapperHeader);
          wrapperContent.appendChild(wrapperInput);

          wrapper.appendChild(wrapperContent);

          container.appendChild(wrapper);
          break;
      
        case 'guide':
          const selected = this.options[this.selectedIndex];
          const guideWrapper = document.createElement('div');
          const guideImg = document.createElement('img');
          const guideLabel = document.createElement('label');

          guideWrapper.className = 'guide-wrapper overview-box__detail ma-bt-sm';
          guideWrapper.setAttribute('value', selected.getAttribute('value'));

          guideImg.className = 'overview-box__img';
          guideImg.setAttribute('src', `/img/users/${selected.getAttribute('imgSrc')}`);
          guideImg.setAttribute('alt', selected.text);

          guideLabel.className = 'form__label guide-list';
          guideLabel.innerText = selected.text;

          guideWrapper.appendChild(guideImg);
          guideWrapper.appendChild(guideLabel);

          container.appendChild(guideWrapper);

          this.value = 'reset';
          selected.style.display = 'none';
          break;

        default:
          break;
      }
      break;
  
    default:
      const removed = container.lastElementChild;

      if (src === 'guide' && removed) {
        document.querySelector(`option.guide-select[value="${removed.getAttribute('value')}"]`).style.display = 'block';
      }

      if (container.childElementCount > 1 || src === 'guide') {
        if (removed) removed.remove();
      }
      break;
  }
};

const tourForm = document.querySelector('form.form');

if (tourForm) {
  const durVal = document.querySelector('span#duration-value');
  document.querySelector('input#duration').oninput = function() {
    durVal.innerHTML = this.value;
  };

  const parVal = document.querySelector('span#maxGroupSize-value');
  document.querySelector('input#maxGroupSize').oninput = function() {
    parVal.innerHTML = this.value;
  };
  
  document.querySelector('button.sd[action="rm"]').onclick = btHandler;
  document.querySelector('button.sd[action="ad"]').onclick = btHandler;
  document.querySelector('button.loc[action="rm"]').onclick = btHandler;
  document.querySelector('button.loc[action="ad"]').onclick = btHandler;
  document.querySelector('select#guides').onchange = btHandler;
  document.querySelector('button.guide[action="rm"]').onclick = btHandler;
}
// * =============================================================================

// * ==== Data Sender ==============================================================
if (tourForm) tourForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  flash('warning', 'Saving, might take awhile...', null);

  const _id = document.querySelector('input[type="hidden"][name="_id"]');
  const name = document.getElementById('name').value;
  const summary = document.getElementById('summary').value;
  const description = document.getElementById('description').value;
  const difficulty = document.getElementById('difficulty').value;
  const duration = document.getElementById('duration').value;
  const maxGroupSize = document.getElementById('maxGroupSize').value;
  const price = document.getElementById('price').value;
  const startLocation = (() => {
    const wrapper = document.querySelector('.sLoc-input-wrapper');
    
    return JSON.stringify({
      address: wrapper.children[0].value,
      description: wrapper.children[1].value,
      coordinates: wrapper.children[2].value.split(','),
      type: 'Point'
    });
  })(); // * This is self calling function. Basically you declare a function and call it immediately 
  const imageCover = document.querySelector('input#imageCover').files[0];

  // * Basically you want to avoid using this in basic fields unless you want to send files.
  // * If you're just sending simple text data, use object instead.
  const form = new FormData;
  form.append('name', name);
  form.append('summary', summary);
  form.append('description', description);
  form.append('difficulty', difficulty);
  form.append('duration', duration);
  form.append('maxGroupSize', maxGroupSize);
  form.append('price', price);
  form.append('startLocation', startLocation);
  form.append('imageCover', imageCover);

  // * Fields with multiple value need to be appended individually either using foreach or array map.
  // * For file though, you don't need to specify the field name as an array in order to 
  // * assign multiple value. The file input will store the file into file list (which is iterable) by default.
  // * So even for single upload, you still need to specify the index, which is 0. For multiple upload, you will
  // * need to iterate each one of them and append them individually into form data.
  Array.from(document.querySelector('input#images').files, im => form.append('images', im));
  Array.from(document.querySelectorAll('input.startDates'), sd => form.append('startDates[]', JSON.stringify({ startDate: new Date(sd.value).toISOString() })));
  Array.from(document.querySelectorAll('.loc-input-wrapper'), loc => form.append('locations[]', JSON.stringify({ 
    description: loc.children[0].value,
    coordinates: loc.children[1].value.split(','),
    day: loc.children[2].value,
    type: 'Point'
  })));
  Array.from(document.querySelectorAll('.guide-wrapper'), gd => form.append('guides[]', gd.getAttribute('value')));

  try {
    const res = _id ? await axios.patch(`http://127.0.0.1:3000/api/v1/tours/${_id.value}`, form, axiosConfig) : await axios.post(`http://127.0.0.1:3000/api/v1/tours`, form, axiosConfig);

    if (res) {
      removeFlash();

      flash('success', `Your data has successfully been ${_id ? 'updated': 'created'}`);
      
      setTimeout(() => {
        window.location.href = '/manage/tours';
      }, 2000);
    }
  } catch (error) {
    removeFlash();
    
    flash('error', error.response.message);
  }
});
// * ===============================================================================

// * END TOUR FORM =================================================================

// ! oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo

// * TOUR LIST ======================================================================
// * ================================================================================

const deleteTour = async function(e) {
  e.preventDefault();
  
  const _id = this.id;
  try {
    const res = await axios.delete(`http://127.0.0.1:3000/api/v1/tours/${_id}`, axiosConfig);

    if (res) {
      flash('success', 'Your data has successfully been deleted');
      this.parentElement.parentElement.remove();
    }
  } catch (error) {
    flash('error', error.response.message);
  }
};

const btDel = document.querySelectorAll('a.delete-tour');

if (btDel) btDel.forEach(bd => bd.addEventListener('click', deleteTour));

// * END TOUR LIST ==================================================================