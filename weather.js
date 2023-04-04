const { default: axios } = require('axios');
const api = require('./api');

module.exports = async (datas) => await api(datas);