import 'babel-polyfill';

console.log('Hello world!');

;(async (message) => console.log(await new Promise(resolve => setTimeout(() => resolve(message), 5000))))(`I'm Awesome!`);