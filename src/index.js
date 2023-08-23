let L = 'en';
const Ls = {
    en: {
        name: 'en',
        separator: ' ',
        Y: 'year',
        M: 'mounth',
        D: 'day',
        H: 'hour',
        m: 'minute',
        S: 'second',
    },
    zh: {
        name: 'zh',
        separator: '',
        Y: '年',
        M: '月',
        D: '天',
        H: '时',
        m: '分',
        S: '秒',
    },
};

function parseLocale(preset, object, isLocal) {
    let l;
    if (!preset) {
        return L;
    }

    if (typeof preset === 'string') {
        const presetLower = preset.toLowerCase();
        if (Ls[presetLower]) {
            l = presetLower;
        }

        if (object) {
            Ls[presetLower] = object;
            l = presetLower;
        }
    } else {
        const {name} = preset;
        Ls[name] = preset;
        l = name;
    }

    if (!isLocal && l) {
        L = l;
    }

    return l || (!isLocal && L);
}

const REGEX_FORMAT = /\[([^\]]+)]|Y|M|D|H|m|S/g;

const SECOND = 1 * 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MOUNTH = 30 * DAY;
const YEAR = 365 * DAY;
const WEEK = 7 * DAY;

function Durationjs(config) {
    this.$i18n = parseLocale(config.locale, null, true);

    this.init(config.milliseconds);
}

Durationjs.prototype.init = function (milliseconds) {
    this.$milliseconds = milliseconds;

    let distance = milliseconds;
    this.$y = Math.floor(distance / YEAR);

    distance = distance - this.$y * YEAR;
    this.$l = Math.floor(distance / MOUNTH);
    this.$L = Math.floor(this.$milliseconds / MOUNTH);

    distance = distance - this.$l * MOUNTH;
    this.$d = Math.floor(distance / DAY); // days
    this.$D = Math.floor(this.$milliseconds / DAY); // whole days

    distance = distance - this.$d * DAY;
    this.$h = Math.floor(distance / HOUR); // hours
    this.$H = Math.floor(this.$milliseconds / HOUR); // whole hours

    distance = distance - this.$h * HOUR;
    this.$m = Math.floor(distance / MINUTE); // minutes
    this.$M = Math.floor(this.$milliseconds / MINUTE); // whole minutes

    distance = distance - this.$m * MINUTE;
    this.$s = Math.floor(distance / SECOND); // seconds
    this.$S = Math.floor(this.$milliseconds / SECOND); // whole seconds

    distance = distance - this.$s * SECOND;
    this.$t = Math.floor(distance / 1); // milliseconds
    this.$T = this.$milliseconds; // whole milliseconds
};

Durationjs.prototype.$locale = function () {
    return Ls[this.$i18n];
};

Durationjs.prototype.locale = function (preset, object) {
    if (!preset) return this.$i18n;

    const that = this;
    debugger;
    const nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName) {
        that.$i18n = nextLocaleName;
    }

    return that;
};

Durationjs.prototype.format = function format(formatStr) {
    const locale = this.$locale();

    function complex(value, unit) {
        if (value > 0) {
            if (value > 1 && locale.name === 'en') {
                return `${value}${locale[unit]}s`;
            } else {
                return `${value}${locale[unit]}`;
            }
        }

        return null;
    }

    if (!formatStr) {
        const units = Object.keys(locale);
        const formats = ['Y', 'M', 'D', 'H', 'm', 'S']
            .map(function (l) {
                if (units.indexOf(l) > -1) {
                    return l;
                }
            })
            .filter(v => v);

        const result = [];
        let idx = -1;

        if ((idx = formats.indexOf('Y')) > -1) {
            this.$y > 0 && result.push(complex(this.$y, 'Y'));
        }

        if ((idx = formats.indexOf('M')) > -1) {
            const value = idx === 0 ? this.$L : this.$l;
            value > 0 && result.push(complex(value, 'M'));
        }

        if ((idx = formats.indexOf('D')) > -1) {
            const value = idx === 0 ? this.$D : this.$d;
            value > 0 && result.push(complex(value, 'D'));
        }

        if ((idx = formats.indexOf('H')) > -1) {
            const value = idx === 0 ? this.$H : this.$h;
            value > 0 && result.push(complex(value, 'H'));
        }

        if ((idx = formats.indexOf('m')) > -1) {
            const value = idx === 0 ? this.$M : this.$m;
            value > 0 && result.push(complex(value, 'm'));
        }

        if ((idx = formats.indexOf('S')) > -1) {
            const value = idx === 0 ? this.$S : this.$s;
            value > 0 && result.push(complex(value, 'S'));
        }

        return result.filter(v => v).join(locale.separator || '');
    } else {
        const units = Array.prototype.slice.call(
            formatStr.match(REGEX_FORMAT) || []
        );
        const formats = ['Y', 'M', 'D', 'H', 'm', 'S']
            .map(function (l) {
                if (units.indexOf(l) > -1) {
                    return l;
                }
            })
            .filter(v => v);

        const matches = (match, isBiggest) => {
            switch (match) {
                case 'Y':
                    return this.$y;
                case 'M':
                    return isBiggest ? this.$L : this.$l;
                case 'D':
                    return isBiggest ? this.$D : this.$d;
                case 'H':
                    return isBiggest ? this.$H : this.$h;
                case 'm':
                    return isBiggest ? this.$M : this.$m;
                case 'S':
                    return isBiggest ? this.$S : this.$s;
            }
        };

        const result = formatStr
            .replace(REGEX_FORMAT, function (match, $1) {
                const value =
                    $1 || matches(match, formats.indexOf(match) === 0);

                return value;
            })
            .replace(/(0\D{1,})/g, function () {
                return '';
            });

        return result;
    }
};

Durationjs.prototype.floorMilliseconds = function () {
    return this.$milliseconds;
};

Durationjs.prototype.milliseconds = function () {
    return this.$milliseconds;
};

/* 返回一共有多少秒 */
Durationjs.prototype.floorSeconds = function () {
    return this.$S;
};

Durationjs.prototype.seconds = function () {
    return this.$s;
};

Durationjs.prototype.floorMinutes = function () {
    return this.$M;
};

Durationjs.prototype.minutes = function () {
    return this.$m;
};

Durationjs.prototype.floorHours = function () {
    return this.$H;
};

Durationjs.prototype.hours = function () {
    return this.$h;
};

Durationjs.prototype.floorDays = function () {
    return this.$D;
};

Durationjs.prototype.days = function () {
    return this.$d;
};

Durationjs.prototype.floorMonths = function () {
    return this.$L;
};

Durationjs.prototype.months = function () {
    return this.$l;
};

Durationjs.prototype.floorYears = function () {
    return this.$y;
};

Durationjs.prototype.years = function () {
    return this.$y;
};

Durationjs.prototype.get = function (name) {
    return this[name]();
};

Durationjs.prototype.floor = function (name) {
    const fnName = name.charAt(0).toUpperCase() + name.slice(1);
    return this['floor' + fnName]();
};

function durationjs(milliseconds, c) {
    const config = typeof c === 'object' ? c : {};
    config.milliseconds = milliseconds;
    config.args = arguments;

    return new Durationjs(config);
}

durationjs.locale = parseLocale;

// test
const ms =
    367 * 24 * 60 * 60 * 1000 +
    10 * 24 * 60 * 60 * 1000 +
    5 * 60 * 60 * 1000 +
    4 * 60 * 1000 +
    5 * 1000 +
    6;

const d = durationjs(ms);

// 自动去掉 0x 的展示，比如下面就没有月份
console.log(d.format('D天H时M月S秒Y年m分')); // 12天5时5秒1年4分
console.log(d.format('H时m分')); // 9053时4分
console.log(d.locale('zh').format()); // 1年12天5时4分5秒
console.log(d.locale('zh').format('H时m分')); // 9053时4分
console.log(d.locale('en').format()); // 1year 12days 5hours 4minutes 5seconds
console.log(
    d
        .locale('my', {
            name: 'my',
            H: 'h',
            m: 'm',
        })
        .format()
); // 9053h4m
// 支持自定义不想展示的单位，比如不展示年等
console.log(d.locale('my').format()); // 9053h4m
// h m 等变量是内置占位符，与上述 my 本地化实现类似
console.log(`${d.floorHours()}h${d.minutes()}m`); // 9053h4m
