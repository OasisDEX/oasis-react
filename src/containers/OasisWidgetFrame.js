import React from "react";
import PropTypes from 'prop-types';


import styles from './OasisWidgetFrame.scss';
import CSSModules from 'react-css-modules';

const OasisWidgetFrame = (props) => {
  return (
    <section styleName="OasisWidgetFrame">
      <div className="row">
        <div className="col-md-12">
          <h4 styleName="Heading">{props.heading} {props.loadProgressSection}</h4>
          <hr/>
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
  loadProgressSection: PropTypes.node,

  children: PropTypes.node
};

OasisWidgetFrame.displayName = "OasisWidgetFrame";

export default CSSModules(OasisWidgetFrame, styles);
