const durationjs = require('../src/index');

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

const d2 = durationjs({
    years: 1,
    months: 10,
});

console.log(d2.format()); // 1year 10months
