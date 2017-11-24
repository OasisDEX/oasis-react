export default function(func) {
  return (...args) =>
    new Promise((resolve, reject) => {
      const cb = (err, data) => err ? reject(err) : resolve(data);
      func.apply(this, [...args, cb]);
    });
}