const { default: axios } = require("axios");
const places = require("./places");

module.exports = async (data) => {
    if (!data.search) return null;
    let search;
    if (!isNaN(Number(data.search))) {
        const placeName =  places.find(f => f.plate == Number(data.search))?.name;
        if (!plateToPlace) return null;
        search = placeName;
    } else if (data.search.split(' ').length > 1) {
        let datas = [];
        for (let { city, counties } of places) {
            for (let countie of counties) {
                countie = countie.toLowerCase(), city = city.toLowerCase();
                dataSearch = data.search.replaceAll(' ', '').toLowerCase();
                if (countie+city == dataSearch || city+countie == dataSearch) 
                    datas.push({ city, countie });
            }
        }

        if (datas.length == 0) return null;
        if (datas.length > 0) search = datas[0];
    } else {
        search = data.search;
    }

    const searchUrl = `https://meteoroloji.boun.edu.tr/sorgular/sehir_talep.php?merkez=${search?.countie ? search?.countie : search}`;

    console.log(searchUrl)
    const searchApi = await axios({ method: 'post', url: searchUrl }).catch((e) => null) || null;
    
    if (searchApi.status != 200) {
        console.log(Error('Some weather-turkey module api error! Please try again later.'))
        return null;
    }

    let output;
    if (searchApi?.data?.length == 0) return null;
    if (searchApi?.data?.length > 0 && search.length == 2) {
        let datas = [];
        for (let data of searchApi.data) if (textFix(data.il) == search[0] && textFix(data.ilce) == search[1]) datas.push(data);
        if (datas.length == 0) return searchApi?.data[0];
        if (datas.length > 0) output = datas[0];
    } else {
        output = searchApi?.data[0];
    }

    if (!output) return null;

    const dataUrl = 'https://meteoroloji.boun.edu.tr/sorgular/veri_talep.php';
    const object = { sehir: JSON.stringify({ ilce: searchApi?.data[0]?.ilce, il: searchApi?.data[0]?.il }) }
    const headers = { headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryEH8ABrOo5YnHGWe2' } }
    const dataApi = await axios.post(dataUrl, object, headers).catch((e) => null);

    if (!dataApi?.data) {
        console.log(Error('Some weather-turkey module api error! Please try again later.'))
        return null;
    }

    const NumberFix = (n, c) => String(n).includes('.') ? Number(String(n).split('.')[0] + '.' + String(n).split('.')[1].slice(0, c)) : Number(n);
    const measurements = (datas) => datas.map(data => {
        return {
            timestamp: Number(new Date(data.tarih + ' ' + (String(data.saat).length == 1 ? '0' : '') + data.saat + ':00:00')),
            date: data.tarih.split('-').reverse().join('.'),
            time: (String(data.saat).length == 1 ? '0' : '') + data.saat + ':00:00',
            temperature: {
                value: NumberFix(data.sicaklik, 2),
                max: NumberFix(data.max_sicaklik, 2),
                min: NumberFix(data.min_sicaklik, 2),
                felt: calcHumidex(data.sicaklik, data.nem),
                unit: { long: 'Celcius', short: 'C' }
            },
            humidity: { value: NumberFix(data.nem), unit: { long: 'Percentile', short: '%' } },
            pressure: {
                value: NumberFix((data.basinc / 100).toLocaleString("tr-TR").replaceAll('.', '').replaceAll(',', '.'), 2),
                unit: { long: 'Hektopaskal', short: 'hPa' }
            },
            rains: { value: NumberFix(data.yagis, 2), unit: { long: 'Millimeter', short: 'mm' } },
            closeness: { value: NumberFix(data.kapalilik, 2), unit: { long: 'Percentile', short: '%' } },
            wind: {
                speed: NumberFix(data.ruzgar, 2),
                direction: {
                    degree: NumberFix(data.ruzgar_yon, 2),
                    text: degToText(NumberFix(data.ruzgar_yon, 2))
                },
                unit: { long: 'Kilometer per hour', short: 'km/h' }
            },
            status: {
                text: data.durum,
                icon: `https://meteoroloji.boun.edu.tr/files/img/durumlar/${data.dosya_adi}.png`
            }
        }
    });

    const bc = measurements(dataApi?.data).filter(f => f.timestamp < Number(new Date())).reverse()[0];
    const fc = measurements(dataApi?.data).filter(f => f.timestamp > Number(new Date()))[0];

    const currentControl = {
        timestamp: Number(new Date()) + 3 * 60 * 60 * 1000,
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR'),
        temperature: {
            value: NumberFix((bc.temperature.value + fc.temperature.value) / 2, 2),
            max: NumberFix((bc.temperature.max + fc.temperature.max) / 2, 2),
            min: NumberFix((bc.temperature.min + fc.temperature.min) / 2, 2),
            felt: calcHumidex(NumberFix((bc.temperature.value + fc.temperature.value) / 2, 2), NumberFix((bc.humidity.value + fc.humidity.value) / 2), 2),
            unit: { long: 'Celcius', short: 'C' }
        },
        humidity: { value: NumberFix((bc.humidity.value + fc.humidity.value) / 2, 2), unit: { long: 'Percentile', short: '%' } },
        pressure: {
            value: NumberFix((bc.pressure.value + fc.pressure.value) / 2, 2),
            unit: { long: 'Hektopaskal', short: 'hPa' }
        },
        rains: { value: NumberFix((bc.rains.value + fc.rains.value) / 2, 2), unit: { long: 'Millimeter', short: 'mm' } },
        closeness: { value: NumberFix((bc.closeness.value + fc.closeness.value) / 2, 2), unit: { long: 'Percentile', short: '%' } },
        wind: {
            speed: NumberFix((bc.wind.speed + fc.wind.speed) / 2, 2),
            direction: {
                degree: NumberFix((bc.wind.direction.degree + fc.wind.direction.degree) / 2, 2),
                text: degToText(NumberFix((bc.wind.direction.degree + fc.wind.direction.degree) / 2), 2)
            },
            unit: { long: 'Kilometer per hour', short: 'km/h' }
        },
        status: {
            text: fc.status.text,
            icon: fc.status.icon
        }
    }

    let _measurements = [currentControl, ...measurements(dataApi.data).filter(f => f.timestamp > Number(new Date()))]
    if (!isNaN(Number(data?.count))) _measurements = _measurements.slice(0, Number(data.count))

    let _daily = {};
    _measurements.forEach(e => {
        if (!_daily[e.date]) _daily[e.date] = [];
        _daily[e.date].push(e)
    });

    let daily = [];
    for (let key of Object.keys(_daily)) {
        let { timestamp, date, temperature, humidity, pressure, rains, closeness, wind, status } = _daily[key][0];
        let data = { timestamp, date, temperature, humidity, pressure, rains, closeness, wind, status, measurements: _daily[key] };

        data.temperature.value = NumberFix(_daily[key].reduce((a, b) => a + b.temperature.value, 0) / _daily[key].length, 2);
        data.temperature.max = NumberFix(_daily[key].reduce((a, b) => a + b.temperature.max, 0) / _daily[key].length, 2);
        data.temperature.min = NumberFix(_daily[key].reduce((a, b) => a + b.temperature.min, 0) / _daily[key].length, 2);
        data.humidity.value = NumberFix(_daily[key].reduce((a, b) => a + b.humidity.value, 0) / _daily[key].length, 2);
        data.pressure.value = NumberFix(_daily[key].reduce((a, b) => a + b.pressure.value, 0) / _daily[key].length, 2);
        data.rains.value = NumberFix(_daily[key].reduce((a, b) => a + b.rains.value, 0) / _daily[key].length, 2);
        data.closeness.value = NumberFix(_daily[key].reduce((a, b) => a + b.closeness.value, 0) / _daily[key].length, 2);
        data.wind.speed = NumberFix(_daily[key].reduce((a, b) => a + b.wind.speed, 0) / _daily[key].length, 2);
        data.wind.direction.degree = NumberFix(_daily[key].reduce((a, b) => a + b.wind.direction.degree, 0) / _daily[key].length, 2);
        data.temperature.felt = calcHumidex(data.temperature.value, data.humidity.value);
        data.wind.direction.text = degToText(data.wind.direction.degree);

        data.status.text = _daily[key][Math.floor(_daily[key].length / 2) - 1].status.text;
        data.status.icon = _daily[key][Math.floor(_daily[key].length / 2) - 1].status.icon;

        daily.push(data);
    }

    if (!isNaN(Number(data?.days))) daily = daily.slice(0, Number(data.days))
    else if (isNaN(Number(data?.days))) daily = daily.slice(0, 1)

    return {
        city: textFix(output.il),
        county: output.ilce ? textFix(output?.ilce) : null,
        daily
    }
};

function degToText(derece) {
    let yonler = ["Kuzey", "Kuzeydoğu", "Doğu", "Güneydoğu", "Güney", "Güneybatı", "Batı", "Kuzeybatı", "Kuzey"];
    let index = Math.floor((derece / 45) + 0.5) % 8;
    return yonler[index];
}

function calcHumidex(temp, RH) {
    let comment = '';
    let kelvin = Number(temp) + 273;
    let eTs = Math.pow(10, ((-2937.4 / kelvin) - 4.9283 * Math.log(kelvin) / Math.LN10 + 23.5471));
    let eTd = eTs * Number(RH) / 100;

    let hx = Math.round(Number(temp) + ((eTd - 10) * 5 / 9));

    if (Number(RH) < 0 || Number(RH) > 100) return { value: null, text: null }
    if (hx < temp) hx = temp;

    if (hx < -10)
        comment = "Buz gibi soğuk bir hava, Donma tehlikesi var!"
    else if (hx < 0)
        comment = "Soğuk bir hava...";
    else if (hx < 25)
        comment = "Rahat bir hava...";
    else if (hx < 30)
        comment = "Bunaltıcı olmayan bir hava...";
    else if (hx < 34)
        comment = "Sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın!";
    else if (hx < 38)
        comment = "Sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın. Güneş altında fazla durmayın.";
    else if (hx < 40)
        comment = "Bunaltıcı, sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın. Açık alanda çalışıyorsanız 30-40 dakikada bir bardak su içmeniz tavsiye olunur.";
    else if (hx < 42)
        comment = "Bunaltıcı, çok sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın. Açık alanda çalışıyorsanız 25-30 dakikada bir bardak su içmeniz tavsiye olunur.";
    else if (hx < 45)
        comment = "Çok Bunaltıcı, çok sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın. Açık alanda çalışıyorsanız 20-25 dakikada bir bardak su içmeniz tavsiye olunur.";
    else if (hx >= 45)
        comment = "Çok bunaltıcı ve çok sıcak bir hava... Zorda kalınmadıkça açık alanda durulmamalıdır, güneş olmayan yerlerde de dikkatli olunmalıdır. Kalp, tansiyon hastaları çok dikkatli olmalı. Aşırı hareketlerden kaçınmakta fayda var.";

    return { value: hx, text: comment }
}

function textFix(_texts) {
    const latters = [[`İ`, `i`], [`I`, `ı`], [`Ö`, `ö`], [`Ü`, `ü`], [`Ğ`, `ğ`], [`Ç`, `ç`], [`Ş`, `ş`]];
    const texts = _texts.split(' ').map(m => {
        if (latters.find(f => f[0] == m[0])) return m[0] + m.slice(1).toLowerCase();
        let sliced = m.slice(1);
        for (let latter of latters) sliced = sliced.replaceAll(latter[0], latter[1]);
        return m[0].toUpperCase() + sliced.toLowerCase();
    }).join(' ')
    return texts;
}