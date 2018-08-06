import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from "react-modal";
import CSSModules from "react-css-modules";

import styles from "./OasisOfferCancelModal.scss";
import InfoBoxWithIco from "./InfoBoxWithIco";
import modalStyles from "../styles/modules/_modal.scss";
import OasisButton from "./OasisButton";
import {
  TX_OFFER_CANCEL,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED
} from "../store/reducers/transactions";
import OasisTransactionStatusWrapperInfoBox from "../containers/OasisTransactionStatusInfoBox";
import OasisCantCancelOffer from "./OasisCantCancelOffer";
const propTypes = PropTypes && {
  onCloseModal: PropTypes.func,
  localStatus: PropTypes.any,
  txStartTimestamp: PropTypes.number,
  askForConfirmToClose: PropTypes.bool,
  tokenAmount: PropTypes.string,
  tokenName: PropTypes.string,
  canOfferBeCancelled: PropTypes.bool.isRequired
};
const defaultProps = {};

class OasisOfferCancelModal extends PureComponent {
  static customBlock() {
    return <div>Cancel offer</div>;
  }
  constructor(props) {
    super(props);
    this.onCancelOffer = this.onCancelOffer.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCancelOffer() {
    this.props.onCancelOffer();
  }
  onCloseModal() {
    this.props.onModalClose();
  }

  askForConfirmToClose() {
    const { askForConfirmToClose } = this.props;
    return askForConfirmToClose;
  }

  transactionStatusSection() {
    const { localStatus, txStartTimestamp } = this.props;
    return (
      <OasisTransactionStatusWrapperInfoBox
        txStatus={localStatus}
        infoText={<strong>Cancel offer</strong>}
        txType={TX_OFFER_CANCEL}
        localStatus={localStatus}
        txTimestamp={txStartTimestamp}
      />
    );
  }

  cancelTransactionConfirmed() {
    return this.props.localStatus === TX_STATUS_CONFIRMED;
  }

  isTransactionPendingOrAwaitingAcceptance() {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.props.localStatus);
  }

  renderInfo() {
    const { tokenAmount, tokenName, canOfferBeCancelled } = this.props;
    return canOfferBeCancelled || this.props.localStatus ? (
      <div>
        <InfoBoxWithIco color="danger" icon="warning">
          <div>
            This action will return
            <b
              style={{
                display: "inlineBlock",
                marginLeft: "5px",
                marginRight: "5px"
              }}
            >
              {tokenAmount} {tokenName}
            </b>
            to your token balance. If someone (partially) fills this order
            before you cancel await, your order may not or only be partially
            cancelled.
          </div>
        </InfoBoxWithIco>
      </div>
    ) : (
      <OasisCantCancelOffer />
    );
  }

  render() {
    const { localStatus, canOfferBeCancelled } = this.props;
    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={true}
        className={modalStyles.modal}
      >
        <div>
          <div>
            <h4 className={modalStyles.heading}>Cancel Offer</h4>
            {!this.isTransactionPendingOrAwaitingAcceptance() ? (
              <button
                className={modalStyles.closeModalBtn}
                onClick={this.onCloseModal}
              >
                ×
              </button>
            ) : null}
          </div>
          <div>{this.renderInfo()}</div>
          <div>{this.transactionStatusSection()}</div>
          <div className={styles.actions}>
            <OasisButton
              disabled={this.isTransactionPendingOrAwaitingAcceptance()}
              onClick={this.onCloseModal}
              caption={"Close"}
            />
            <OasisButton
              disabled={
                (localStatus && localStatus !== TX_STATUS_CANCELLED_BY_USER) ||
                !canOfferBeCancelled
              }
              onClick={this.onCancelOffer}
              caption="Cancel offer"
              color="danger"
            />
          </div>
        </div>
      </ReactModal>
    );
  }
}

OasisOfferCancelModal.displayName = "OasisOfferCancelModal";
OasisOfferCancelModal.propTypes = propTypes;
OasisOfferCancelModal.defaultProps = defaultProps;
export default CSSModules(
  OasisOfferCancelModal,
  { styles, modalStyles },
  { allowMultiple: true }
);
