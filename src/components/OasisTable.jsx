import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import CSSModules from 'react-css-modules';

// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTable.scss';


const propTypes = PropTypes && {
  rows: PropTypes.any.isRequired,
  col: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func
};

const defaultProps = {
  collapseRowNumber: 4,
  collapseInitial: false,
  collapseEnabled: false
};


const getColTemplate = (rowDef, row) => {
  if(rowDef.template) {
    return rowDef.template.call(null, row);
  } else {
    return (<span style={{fontSize: '10px'}}>N/A</span>);
  }
};

export class OasisTable extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: this.props.collapseInitial
    };
    this.rowClickHandler = this.rowClickHandler.bind(this);
  }

  toggleCollapse() {
    this.setState({isCollapsed: !this.state.isCollapsed})
  }

  rowClickHandler(rowData) {
    const { onRowClick, metadata } = this.props;
    onRowClick && onRowClick(rowData, metadata);
  }

  rowContent(row) {
    const { col } = this.props;
    return col.map(
      (rowDef, i) => {
        return (
          <td key={i}>
            { row[rowDef.key] || getColTemplate(rowDef, row) }
          </td>
        )
      }
    );
  }

  renderTHeadContent() {
    const { col } = this.props;
    return (
      <tr>
        {col.map( (col, i) => (<th key={i}>{col.heading}</th>) )}
      </tr>
    )
  }

  hideRow(i) {
    return this.props.collapseEnabled
      && this.state.isCollapsed
      && this.props.collapseRowNumber < i + 1;
  }

  renderRows() {
    const { rows, onRowClick } = this.props;
    return rows.map( (row, i) => {
      return this.hideRow(i) ? null : (
        <tr
          className={`${row.isActive ? styles.active: ''} ${onRowClick ? styles.clickable : ''}`}
          key={i}
          data-tradingpair={row.tradingPair}
          onClick={this.rowClickHandler.bind(null, row)}
        >
          {this.rowContent(row)}
        </tr>
      )
    }
    );
  }

  renderCollapseRow() {
    const {collapseEnabled, col, rows, collapseRowNumber} = this.props;
    if (!collapseEnabled || rows.size <= collapseRowNumber) {
      return null;
    }
    return (
      <tr
        className={`${styles.clickable} ${styles.collapseRow}`}
        onClick={this.toggleCollapse.bind(this)}
      >
        <td colSpan={col.length} className={styles.collapseCell}>
          {this.state.isCollapsed ? "Show more" : "Show less"}
        </td>
      </tr>
    )
  }


  render() {
    return (
      <div>
        <table className={`${styles.scrolling} ${this.props.className || ''}`}>
          <thead>
            {this.renderTHeadContent()}
          </thead>
          <tbody>
            {this.renderRows()}
            {this.renderCollapseRow()}
          </tbody>
        </table>
      </div>
    );
  }
}

OasisTable.displayName = 'OasisTable';
OasisTable.propTypes = propTypes;
OasisTable.defaultProps = defaultProps;
export default CSSModules(OasisTable, styles, { allowMultiple: true });
