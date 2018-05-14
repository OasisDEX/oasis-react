import MockDate from 'mockdate';

export function mockDate(date, block) {
  try {
    MockDate.set(date, 0);
    return block.call();
  } finally {
    MockDate.reset();
  }
}
