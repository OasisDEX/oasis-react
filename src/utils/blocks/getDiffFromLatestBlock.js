import network from '../../store/selectors/network';

const BLOCK_DIFF_TYPE_TIME = 'BLOCK_DIFF/TYPE_TIME';
const BLOCK_DIFF_TYPE_BLOCK_COUNT = 'BLOCK_DIFF/TYPE_BLOCK_COUNT';

const getDiffFromLatestBlock = (blockNumber, getState, diffType = BLOCK_DIFF_TYPE_BLOCK_COUNT) => {
    const latestBlockNumber = network.latestBlockNumber(getState());
    switch (diffType) {
      case BLOCK_DIFF_TYPE_BLOCK_COUNT:
        return latestBlockNumber - blockNumber;
      case BLOCK_DIFF_TYPE_TIME:
        alert('Not implemented yet');
        break;
    }
};

export default getDiffFromLatestBlock;