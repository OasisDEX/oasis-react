const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

export default isNumeric;