const { default: axios } = require('axios');
const api = require('./api');

/**
 * 
 * @param {*} search Aramak istediğiniz il/ilçe (Türkiye için)
 * @param {*} days Kaç günlük hava durumu istediğinizi belirtin. (Varsayılan: 10)
 * @returns 
 */
module.exports = async ({ search, days }) => await api({ search, days });