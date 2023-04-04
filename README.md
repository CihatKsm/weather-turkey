#### Modül İndirme:

```bash
  npm install weather-turkey
```

#### Örnek Kullanım:
```js
const weather = require('weather-turkey')
const date = () => new Date()

console.log(date(), 'System opened!')

setTimeout(async () => {
    const information = await weather({ search: 'Kartepe', count: 3 })
    console.log(information)
}, 2000);
```

#### Örnek Çıktı:
```json
{
    "city": "Kocaeli",
    "county": "Kartepe",
    "measurements": [
        {
            "timestamp": 1680628706368,
            "date": "04.04.2023",
            "time": "17:18:26",
            "temperature": {
                "value": 12.18,
                "max": 16.05,
                "min": 10.88,
                "felt": { 
                    "value": 13, 
                    "text": "Rahat bir hava..." 
                },
                "unit": { 
                    "long": "Celcius", 
                    "short": "C" 
                }
            },
            "humidity": { 
                "value": 84.9, 
                "unit": { 
                    "long": "Percentile", 
                    "short": "%"
                } 
            },
            "pressure": { 
                "value": 1003.48,
                "unit": { 
                    "long": "Hektopaskal", 
                    "short": "hPa" 
                } 
            },
            "rains": { 
                "value": 1.21, 
                "unit": { 
                    "long": "Millimeter", 
                    "short": "mm" 
                } 
            },
            "closeness": { 
                "value": 70.05, 
                "unit": { 
                    "long": "Percentile", 
                    "short": "%" 
                } 
            },
            "wind": {
                "speed": 9.89,
                "direction": { 
                    "degree": 168.36, 
                    "text": "Güney" 
                },
                "unit": { 
                    "long": "Kilometer per hour", 
                    "short": "km/h" 
                }
            },
            "status": {
                "text": "Sağanak Yağmur",
                "icon": "https://meteoroloji.boun.edu.tr/files/img/durumlar/sagnak_yagmur.png"
            }
        },
        {...},
        {...}
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
