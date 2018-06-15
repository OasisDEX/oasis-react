import web3 from "../bootstrap/web3";

function pad(value, length) {
  return value.toString().length < length ? pad("0" + value, length) : value;
}

export const solSha3 = (...args) => {
  args = args.map(arg => {
    if (typeof arg === "string") {
      if (arg.substring(0, 2) === "0x") {
        return arg.slice(2);
      } else {
        return web3.toHex(arg).slice(2);
      }
    }

    if (typeof arg === "number") {
      return pad(arg.toString(16), 64, 0);
    } else {
      return "";
    }
  });

  args = args.join("");

  return web3.sha3(args, { encoding: "hex" });
};
