import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import CSSModules from 'react-css-modules';

// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisTable.scss';


const propTypes = PropTypes && {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  colDefs: PropTypes.arrayOf(PropTypes.object).isRequired
};
const defaultProps = {};


export class OasisTable extends PureComponent {

  rowContent(row) {
    const { colDefs } = this.props;
    return colDefs.map(
      (rowDef, i) => <td key={i}>{row[rowDef.key]}</td>
    );
  }

  renderTHeadContent() {
    const { colDefs } = this.props;
    return (
      <tr>
        {colDefs.map( (col, i) => (<th key={i}>{col.heading}</th>) )}
      </tr>
    )
  }

  renderRows() {
    const { rows } = this.props;
    return rows.map( (row, i) =>
      (<tr key={i}>{this.rowContent(row)}</tr>)
    );
  }

  render() {
    return (
      <div>
        <table>
          <thead>
            {this.renderTHeadContent()}
          </thead>
          <tbody>
            {this.renderRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

OasisTable.displayName = 'OasisTable';
OasisTable.propTypes = propTypes;
OasisTable.defaultProps = defaultProps;
export default CSSModules(OasisTable, styles);
