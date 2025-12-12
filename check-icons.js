
const icons = require('simple-icons/icons');
const names = [
    'astro', 'remix', 'nuxt', 'svelte', 'angular', 'nest', 'gatsby', 'solid', 'quasar'
];

names.forEach(name => {
    const matches = Object.keys(icons).filter(key => key.toLowerCase().includes(name));
    console.log(`${name}:`, matches);
});
