const { default: axios } = require('axios');
const api = require('./api');

module.exports = async (datas) => await api(datas);

setTimeout(async () => await checkUpdate(), 1000);
async function checkUpdate() {
    const module = 'weather-turkey';
    const package = require('./package.json');
    const url = `https://unpkg.com/${module}@latest`;
    const api = await axios({ method: 'get', url }).catch((e) => null);
    const latest = api.request.path.split('/')[1].split('@')[1] || 0;
    const update = Number(latest.split('.').join('')) > Number(package.version.split('.').join(''))
    const logText = `✅ Please update ${module} module ${package.version} to ${latest} version.`;
    if (update) console.log('\x1b[32m%s\x1b[0m', logText);
}