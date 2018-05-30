export const TIMESTAMP_RESOLUTION_MS = 1;
export const TIMESTAMP_RESOLUTION_SEC = 1000;


const getTimestamp = (timestampRes = TIMESTAMP_RESOLUTION_MS) => {
  const currentTimestamp = Date.now();
  switch (timestampRes) {
    case  TIMESTAMP_RESOLUTION_SEC: return Math.ceil(currentTimestamp / 1000);
    case  TIMESTAMP_RESOLUTION_MS: return currentTimestamp;
  }
};

export {
  getTimestamp
}