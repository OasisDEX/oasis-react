import MockDate from 'mockdate';

export function mockDate(date, block) {
  try {
    MockDate.set(date);
    return block.call();
  } finally {
    MockDate.reset();
  }
}
