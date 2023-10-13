const weather = require('./weather');
const date = () => new Date()

console.log(date(), 'System opened!')

weather({ search: 41, days: 1 })
    .then((data) => console.log(data.daily))