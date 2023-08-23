let L = 'en';
const Ls = {
    en: {
        name: 'en',
        separator: ' ',
        Y: 'year',
        M: 'month',
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
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function Durationjs(config) {
    this.$i18n = parseLocale(config.locale, null, true);

    this.init(config.milliseconds);
}

Durationjs.prototype.init = function (milliseconds) {
    this.$milliseconds = milliseconds;

    let distance = milliseconds;
    this.$y = Math.floor(distance / YEAR);

    distance = distance - this.$y * YEAR;
    this.$l = Math.floor(distance / MONTH);
    this.$L = Math.floor(this.$milliseconds / MONTH);

    distance = distance - this.$l * MONTH;
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

// TODO milliseconds is object

function normalize(ms) {
    return Object.keys(ms)
        .map(function (key) {
            switch (key) {
                case 'years':
                    return Number(ms.years) * YEAR;
                case 'months':
                    return Number(ms.months) * MONTH;
                case 'days':
                    return Number(ms.days) * DAY;
                case 'hours':
                    return Number(ms.hours) * HOUR;
                case 'minutes':
                    return Number(ms.minutes) * MINUTE;
                case 'seconds':
                    return Number(ms.seconds) * SECOND;
            }
        })
        .reduce(function (prev, cur) {
            prev += cur;

            return prev;
        }, 0);
}

function durationjs(milliseconds, c) {
    const config = typeof c === 'object' ? c : {};
    if (typeof milliseconds !== 'number') {
        config.milliseconds = normalize(milliseconds);
    } else {
        config.milliseconds = milliseconds;
    }
    config.args = arguments;

    return new Durationjs(config);
}

durationjs.locale = parseLocale;

module.exports = durationjs;
