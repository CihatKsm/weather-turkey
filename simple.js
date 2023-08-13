const weather = require('./weather');
const date = () => new Date()

console.log(date(), 'System opened!')

weather({ search: 'Bursa Büyükorhan', days: 1 })
    .then((data) => console.log(data))