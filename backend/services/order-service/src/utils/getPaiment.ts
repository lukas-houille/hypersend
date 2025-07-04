
export function getPaiment() {
    // simulate paiment validation with a random delay between 1 and 3 seconds
    setTimeout(() => {
    }, Math.floor(Math.random() * 2000) + 1000);
};