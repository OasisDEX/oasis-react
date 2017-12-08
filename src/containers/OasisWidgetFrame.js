import React from "react";
import PropTypes from 'prop-types';


import styles from './OasisWidgetFrame.scss';
import CSSModules from 'react-css-modules';

const OasisWidgetFrame = (props) => {
  return (
    <section styleName="OasisWidgetFrame">
      <div className="row">
        <div className="col-md-6">
          <h3 styleName="Heading">{props.heading}</h3>
        </div>
      </div>

      <div>
        {props.children}
      </div>
    </section>
  );
};

OasisWidgetFrame.propTypes = {
  heading: PropTypes.string.isRequired,
  children: PropTypes.node
};

OasisWidgetFrame.displayName = "OasisWidgetFrame";

export default CSSModules(OasisWidgetFrame, styles);
