import React from "react";
import PropTypes from "prop-types";

import styles from "./OasisWidgetFrame.scss";
import CSSModules from "react-css-modules";
import OasisLoadingDataOverlay from "../components/OasisLoadingDataOverlay";

const OasisWidgetFrame = properties => {
  const {
    heading,
    headingClassName,
    loadProgressSection,
    spaceForContent,
    children,
    headingChildren,
    isLoadingData,
    loadingDataText,
    noContentPaddingXXS,
    ...props
  } = properties;
  return (
    <section styleName={"OasisWidgetFrame"} {...props}>
      <div className="row">
        <div className="col-12">
          <h4 styleName="Heading" className={headingClassName}>
            <span styleName="HeadingText">
              {heading}
            </span>
            <span>
              {loadProgressSection}
            </span>
            {headingChildren}
          </h4>
          <hr />
        </div>
      </div>

      <div
        styleName={spaceForContent ? "OasisWidgetContent" : ""}
        className={noContentPaddingXXS ? styles.NoContentPaddingXXS: ""}
      >
        {isLoadingData && (
          <OasisLoadingDataOverlay loadingText={loadingDataText} />
        )}
        {children}
      </div>
    </section>
  );
};

OasisWidgetFrame.propTypes = {
  noContentPaddingXXS: PropTypes.bool,
  heading: PropTypes.string.isRequired,
  loadProgressSection: PropTypes.node,
  spaceForContent: PropTypes.bool,
  headingChildren: PropTypes.node,
  children: PropTypes.node,
  isLoadingData: PropTypes.bool,
  loadingDataText: PropTypes.string
};

const defaultProps = {
  className: ""
};

OasisWidgetFrame.displayName = "OasisWidgetFrame";
OasisWidgetFrame.defaultProps = defaultProps;

export default CSSModules(OasisWidgetFrame, styles);
