const { default: axios } = require("axios");
const places = require("./places");

module.exports = async (data) => {
    if (!data.search) return null;
    const search = places.find(f => f.plate == data.search)?.name || data.search;
    const searchUrl = `https://meteoroloji.boun.edu.tr/sorgular/sehir_talep.php?merkez=${search}`;
    const searchApi = await axios({ method: 'post', url: searchUrl }).catch((e) => null);
    const output = searchApi?.data[0];

    if (!output) return { city: null, county: null, measurements: [] }

    const dataUrl = `https://meteoroloji.boun.edu.tr/sorgular/veri_talep.php`;
    const object = { sehir: JSON.stringify({ ilce: output?.ilce, il: output?.il }) }
    const headers = { headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryEH8ABrOo5YnHGWe2' } }
    const dataApi = await axios.post(dataUrl, object, headers)

    const NumberFix = (n, c) => String(n).includes('.') ? Number(String(n).split('.')[0] + '.' + String(n).split('.')[1].slice(0, c)) : Number(n);
    const measurements = (datas) => datas.map(data => {
        return {
            timestamp: Number(new Date(data.tarih + ' ' + (data.saat.length == 1 ? '0' : '') + data.saat + ':00:00')),
            date: data.tarih.split('-').reverse().join('.'),
            time: (data.saat.length == 1 ? '0' : '') + data.saat + ':00:00',
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
                text: data.durum.split(' ').map(m => m[0].toUpperCase() + m.slice(1)).join(' '),
                icon: `https://meteoroloji.boun.edu.tr/files/img/durumlar/${data.dosya_adi}.png`
            }
        }
    });

    const bc = measurements(dataApi.data).filter(f => f.timestamp < Number(new Date())).reverse()[0];
    const fc = measurements(dataApi.data).filter(f => f.timestamp > Number(new Date()))[0];

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
            text: bc.status.text,
            icon: bc.status.icon
        }
    }

    let _measurements = [currentControl, ...measurements(dataApi.data).filter(f => f.timestamp > Number(new Date()))]
    if (!isNaN(Number(data?.count))) _measurements = _measurements.slice(0, Number(data.count))
    else _measurements = []

    return {
        city: textFix(output.il),
        county: output.ilce ? textFix(output?.ilce) : null,
        measurements: _measurements
    }
};

function degToText (derece) {
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

function textFix(name) {
    let _name = name.slice(1);
    let latters = [[`İ`, `i`], [`I`, `ı`], [`Ö`, `ö`], [`Ü`, `ü`], [`Ğ`, `ğ`], [`Ç`, `ç`], [`Ş`, `ş`]];
    for (let latter of latters) _name = _name.replaceAll(latter[0], latter[1]);
    return name[0] + _name.toLowerCase();
}