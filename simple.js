const weather = require('./weather')
const date = () => new Date()

console.log(date(), 'System opened!')

setTimeout(async () => {
    const information = await weather({ search: 'kartepe', count: 1 })
    console.log(information)
}, 1000);

/*\--------------------------------------------------------/*\

    Merhaba, 
    Konu hakkında geliştirmeye yönelik fikirlerin var ise dinlemek/görüşmek isterim.

    Telegram: http://t.me/cihatksm (Hızlı İletişim)
    E-posta: me@cihatksm.com

/*\--------------------------------------------------------\*/