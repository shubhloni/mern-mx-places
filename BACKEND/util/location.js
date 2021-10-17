const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyBRogDLa_XP5GxoG3kihqetrv5VwVn4gro';

function getCoordsForAddress(address) {
  return {
    lat: 12.1231321,
    lng: 12.1231231,
  };
  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${API_KEY}`
  // );
  // //   console.log(response);
  // const data = response.data;
  // console.log(data);
  // if (!data || data.status === 'ZERO_RESULTS') {
  //   const error = new HttpError('Could not find address', 422);
  //   throw error;
  // }

  // const coordinates = data.results[0].geometry.location;
  // return coordinates;
}

module.exports = getCoordsForAddress;
