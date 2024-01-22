"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const loaderElement = document.querySelector(".loader");

///////////////////////////////////////

//show loader/spinner
const showLoader = function () {
  loaderElement.classList.remove("hidden");
};
// hide loader/spinner
const hideLoader = function () {
  loaderElement.classList.add("hidden");
};

// show button
const showButton = function () {
  btn.classList.remove("hidden");
};

// hide button
const hideButton = function () {
  btn.classList.add("hidden");
};

const renderError = function (err) {
  countriesContainer.insertAdjacentText("beforeend", ` ${err.message}`);
};
const getJSON = function (url, errorMessage = "Something went wrong💥💥💥.") {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${errorMessage} (${response.status})`);
    return response.json();
  });
};

const getLocation = function () {
  return new Promise(function (resolve, reject) {
    /*
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      err => reject(err)
    );*/
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const getCoundtryData = function (countryName) {
  getJSON(
    `https://restcountries.com/v2/name/${countryName}`,
    "Country not found"
  )
    .then(([data]) => {
      renderCountry(data);

      //neighbouring country
      const neighborCountry = data.borders?.[0];
      if (!neighborCountry) throw new Error(`No neighbour found `);
      // const neighborCountry = 'noCountry';

      return getJSON(
        `https://restcountries.com/v2/alpha/${neighborCountry}`,
        "No Country found"
      );
    })
    .then((neighbourData) => {
      renderCountry(neighbourData, "neighbour");
    })
    .catch((err) => {
      renderError(err);
    })
    .finally(() => (countriesContainer.style.opacity = 1));
};

const renderCountry = function (data, neighbour = "") {
  const html = `
    <article class="country ${neighbour}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(
          data.population / 1_000_000
        ).toFixed(1)} million people</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
    </article>
    `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
};

const whereAmI = function () {
  hideButton();
  showLoader();
  getLocation()
    .then((position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      return getJSON(
        `https://geocode.xyz/${lat},${lng}?geoit=json&auth=67217618795933950x103347`
      );
    })
    .then((data) => {
      return data.country;
    })
    .then((country) => {
      hideLoader();
      getCoundtryData(country);
    })
    .catch((err) => {
      showButton();
      console.log(err.message);
    });
};

btn.addEventListener("click", whereAmI);
