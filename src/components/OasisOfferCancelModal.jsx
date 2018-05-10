import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from "react-modal";
import CSSModules from "react-css-modules";

import styles from "./OasisOfferCancelModal.scss";
import InfoBox from "./InfoBox";
import InfoBoxBody from "./InfoBoxBody";
import OasisIcon from "./OasisIcon";
import OasisButton from "./OasisButton";
import OasisTransactionStatusWrapper from "../containers/OasisTransactionStatus";
import {
  TX_OFFER_CANCEL,
  TX_STATUS_CONFIRMED
} from "../store/reducers/transactions";

const propTypes = PropTypes && {
  onCloseModal: PropTypes.func,
  localStatus: PropTypes.any,
  txStartTimestamp: PropTypes.number,
  askForConfirmToClose: PropTypes.bool,
  tokenAmount: PropTypes.string,
  tokenName: PropTypes.string
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
    return localStatus ? (
      <OasisTransactionStatusWrapper
        noBorder
        txType={TX_OFFER_CANCEL}
        localStatus={localStatus}
        txTimestamp={txStartTimestamp}
        customBlock={OasisOfferCancelModal.customBlock()}
      />
    ) : null;
  }

  cancelTransactionConfirmed() {
    return this.props.localStatus === TX_STATUS_CONFIRMED;
  }

  render() {
    const { tokenAmount, tokenName, localStatus } = this.props;
    return (
      <ReactModal ariaHideApp={false} isOpen={true} className={styles.modal}>
        <div>
          <div>
            <h4 className={styles.heading}>Cancel Offer</h4>
          </div>
          <div>
            <InfoBox color="danger">
              <InfoBoxBody>
                <div>
                  <OasisIcon icon="warning" />
                </div>
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
                  before you cancel await, your order may not or only be
                  partially cancelled.
                </div>
              </InfoBoxBody>
            </InfoBox>
          </div>
          <div>{this.transactionStatusSection()}</div>
          <div />
          <div className={styles.actions}>
            <OasisButton
              onClick={this.onCloseModal}
              className={styles.closeModalBtn}
              caption={
                this.askForConfirmToClose() || this.cancelTransactionConfirmed()
                  ? "Close"
                  : "Cancel"
              }
            />
            <OasisButton
              disabled={localStatus}
              onClick={this.onCancelOffer}
              caption="Cancel offer"
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
export default CSSModules(OasisOfferCancelModal, { styles });
