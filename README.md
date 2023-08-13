#### Modül İndirme:

```bash
  npm install weather-turkey
```

#### Örnek Kullanım:
```js
const weather = require('weather-turkey')
const date = () => new Date()

console.log(date(), 'System opened!')

weather({ search: 'kartepe', days: 10 })
    .then((data) => console.log(data))
```

#### Örnek Çıktı:
```js
{
  city: 'Kocaeli',
  county: 'Kartepe',
  daily: [
    {
        timestamp: 1691874000000,
        date: '13.08.2023',
        temperature: {
            value: 22.35,
            max: 24.03,
            min: 21.32,
            felt: {
                value: 30,
                text: 'Sıcak bir hava... Sıvı ihtiyacınızı karşılamayı unutmayın!'
            },
            unit: { long: 'Celcius', short: 'C' }
        },
        humidity: { value: 88.64, unit: { long: 'Percentile', short: '%' } },
        pressure: { value: 1013.73, unit: { long: 'Hektopaskal', short: 'hPa' } },
        rains: { value: 0.06, unit: { long: 'Millimeter', short: 'mm' } },
        closeness: { value: 97.02, unit: { long: 'Percentile', short: '%' } },
        wind: {
            speed: 10.97,
            direction: { degree: 57.95, text: 'Kuzeydoğu' },
            unit: { long: 'Kilometer per hour', short: 'km/h' }
        },
        status: {
            text: 'Kapalı',
            icon: 'https://meteoroloji.boun.edu.tr/files/img/durumlar/kapali.png'
        },
        measurements: [
            {
                timestamp: 1691874000000,
                date: '13.08.2023',
                time: '00:00:00',
                temperature: {...},
                humidity: {...},
                pressure: {...},
                rains: {...},
                closeness: {...},
                wind: {...},
                status: {...}
            }
            {... /* Toplam sekiz ölçüm verisi */},
        ]
    },
    {... /* Toplam 10 günlük veri */}
  ]
}
```

[![ISC License](https://img.shields.io/badge/License-ISC-green.svg)](https://choosealicense.com/licenses/isc/)

#### Geri Bildirim

**E-posta:** me@cihatksm.com adresinden bana ulaşın.
<br>
<small>
Boğaziçi Üniversitesi Kandilli Rasathanesi ve D.A.E Meteroloji Laboratuvarı verileri kullanılarak hazırlanmıştır.
<br>
Herhangi bir sorun teşkil ediyorsa, problem oluşturuyorsa ya da oluşturduysa önce tarafıma bilgi verilmesi rica olunur.
</small>
