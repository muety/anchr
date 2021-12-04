// https://stackoverflow.com/a/6969486/3112139
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    escapeRegExp: escapeRegExp
};