'use strict';
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');

const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');

const inputType = document.querySelector('.form__input--type');
const inputElevation = document.querySelector('.form__input--elevation');

/* 🌟 236. Creating a New Workout 🌟 */
//➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖

let map, mapEvent;

class Workout {
  clicks=0;
  date = new Date();
  //id = (new Date() + '').slice(-30);
  id = (Date.now() + '').slice(-30);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}${this.date.getDate()}`;
  }

  click(){
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, Cadence) {
    super(coords, distance, duration);
    this.Cadence = Cadence;
    this.calPace();
    this._setDescription();
  }
  calPace() {
    //min/km
    this.pace = (this.duration / this.distance).toFixed(2);
    return this.pace;
  }

}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calSpeed();
    this._setDescription();
  }
  calSpeed() {
    this.speed = ((this.distance / this.duration )*60).toFixed(2);
    return this.speed;
  }
}

//➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
class App {
  #mapZoomLavel=13;
  #workout = [];
  
  constructor() {
    // get user position
    this._getposition();

    // Get dat from local storage
    this._getLocalStorage();


    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevation);
    containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));

  }

  

  _getposition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get ur Current location');
        }
      );
  }

  _loadMap(position) {
    console.log('Map Loaded');

    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.map = L.map('map').setView(coords, this.#mapZoomLavel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', this._showForm.bind(this));
    
    this.#workout.forEach(element => {
            this._renderWorkoutMarker(element);
    });

  }

  _showForm(mapE) {
    mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    console.log(mapEvent);
  }

  _toggleElevation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // helper function

    e.preventDefault();

    // get Data from Form
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const { lat, lng } = mapEvent.latlng;
    let workout;

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    console.log(validInputs(distance));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    console.log(allPositive(distance));

    // if workout running ,create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert(' Input have to be a positive number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // if workout cycling ,create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      console.log(elevation);
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert(' Input have to be a positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add new object to workout array
    this.#workout.push(workout);
    console.log(workout);

    // render Workout on list
    this._renderWorkoutMarker(workout);

    // render workout on list
    this._renderWorkout(workout);

    // set local storage
    this._setLocalStorage();

    // hide form and clear input data
    this._hideForm(); 

    // 
    
  }
  // Display marker
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxwidth: 250,
          minwidth: 150,
          autoclose: true,
          closeOnClick: true,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type==='running'? '🏃‍♂️':'🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }

  _renderWorkout(workout){
    // console.log(workout);
    let html=`<li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type==='running'? '🏃‍♂️':'🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if(workout.type==='running')
    html+=`<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
  </li>`;

  if(workout.type==='cycling')
  html+=`<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.speed}</span>
  <span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⛰</span>
  <span class="workout__value">${workout.elevation}</span>
  <span class="workout__unit">m</span>
</div>
</li>`;

form.insertAdjacentHTML('afterend',html);
  }

  _moveToPopup(e) {
    
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);

    if(!workoutEl) return;

    const workout =this.#workout.find(work=>work.id===workoutEl.dataset.id);
    console.log(workout);
    
    this.map.setView(workout.coords,this.#mapZoomLavel,{
      animate:true,
      pan:{
        duration:1,
      }
    });
   // calling using public interface
   //  workout.click();
  }

   _hideForm(){
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
    inputCadence.value =
      '';
   }
  _setLocalStorage(){
     localStorage.setItem('workout',JSON.stringify(this.#workout));
  }

  _getLocalStorage(){

    const loadData = JSON.parse(localStorage.getItem('workout'));
    console.log(loadData );

    if(!loadData) return;

    this.#workout=loadData;
    this.#workout.forEach(element => {
      this._renderWorkout(element);
      
    });

  }

  reset(){
    localStorage.removeItem('workout');
    location.reload();
  }
  
}

const app = new App();


