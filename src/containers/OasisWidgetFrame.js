import React from "react";
import PropTypes from "prop-types";

import styles from "./OasisWidgetFrame.scss";
import CSSModules from "react-css-modules";

const OasisWidgetFrame = properties => {
  const {
    heading,
    headingClassName,
    loadProgressSection,
    spaceForContent,
    children,
    headingChildren,
    ...props
  } = properties;
  return (
    <section styleName="OasisWidgetFrame" {...props}>
      <div className="row">
        <div className="col-md-12">
          <h4 styleName="Heading" className={headingClassName}>
            {heading} {loadProgressSection}
            {headingChildren}
          </h4>
        </div>
      </div>

      <div styleName={spaceForContent ? "OasisWidgetContent" : ""}>
        {children}
      </div>
    </section>
  );
};

OasisWidgetFrame.propTypes =
  {
    heading: PropTypes.string.isRequired,
    loadProgressSection: PropTypes.node,
    spaceForContent: PropTypes.bool,

    headingChildren: PropTypes.node,
    children: PropTypes.node
  } && {};

const defaultProps = {
  className: ""
};

OasisWidgetFrame.displayName = "OasisWidgetFrame";
OasisWidgetFrame.defaultProps = defaultProps;

export default CSSModules(OasisWidgetFrame, styles);
