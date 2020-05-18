import React, {Component, Fragment} from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import ActionBouton from './ActionBouton'
import paginationFactory from 'react-bootstrap-table2-paginator'
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit'

const { ExportCSVButton } = CSVExport;

class TableStudy extends Component {
    

    static defaultProps = {
        hiddenActionBouton: false, 
        hiddenRemoveRow: true, 
        pagination: false, 
        hiddenName: true, 
        hiddenID: true, 
        hiddenAccessionNumber: false, 
        editable: false, 
        hiddenCSV: true
    }

    getSelectedItems(){
        return this.node.selectionContext.selected
    }

    getColumns(){
        return this.columns
    }

    columns = [
    {
        dataField: 'AnonymizedFrom', 
        text:'Anonymized from', 
        hidden: true
    },  {
        dataField: 'StudyOrthancID',
        text: 'Study ID', 
        hidden: true
    }, {
        dataField: 'PatientName', 
        text: 'Patient Name', 
        sort: true, 
        hidden: this.props.hiddenName,
        title: (cell, row, rowIndex, colIndex) => row.PatientName, 
        editable: false
    }, {
        dataField: 'PatientID', 
        text: 'Patient ID', 
        sort: true, 
        hidden: this.props.hiddenID, 
        editable: false
    }, {
        dataField: 'StudyDate', 
        text: 'Study Date', 
        sort: true, 
        editable: false
    }, {
        dataField: 'StudyDescription', 
        text: 'Description',
        sort: true,
        title: (cell, row, rowIndex, colIndex) => row.StudyDescription, 
        editable: false
    }, {
        dataField: 'newStudyDescription', 
        text: 'New Description', 
        sort: true, 
        editable: this.props.editable, 
        hidden: !this.props.editable, 
        csvExport: false
    }, {
        dataField: 'AccessionNumber', 
        text: 'Accession Number',
        sort: true, 
        hidden: this.props.hiddenAccessionNumber, 
        editable: false
    }, {
        dataField: 'newAccessionNumber', 
        text: 'New Accession Number',
        sort: true, 
        editable: this.props.editable, 
        hidden: !this.props.editable, 
        csvExport: false
    }, {
        dataField: 'Action', 
        text: 'Action', 
        hidden: this.props.hiddenActionBouton,
        formatter:  ( (value, row, index) => 
            <ActionBouton level='studies' orthancID={row.StudyOrthancID} StudyInstanceUID={row.StudyInstanceUID} onDelete={this.props.onDelete} />
        ),
        clickToSelect: false, 
        editable: false, 
        csvExport: false
    }, {
        dataField: 'Remove', 
        text: 'Remove',
        hidden: this.props.hiddenRemoveRow,
        formatter: (cell, row, index) => {
            return <button type="button" className="btn btn-danger" onClick={(e) => {e.stopPropagation(); this.props.onDelete(row.StudyOrthancID)}}>Remove</button>
        }, 
        editable: false, 
        csvExport: false
    
    }]

    render() {
        return (
            <ToolkitProvider
                keyField="StudyOrthancID"
                data={ this.props.data }
                columns={ this.columns }
                exportCSV
            >
                {props => (<Fragment>
                <BootstrapTable
                    {...this.props}
                    {...props.baseProps}
                    striped={true} 
                    pagination={this.props.pagination ? paginationFactory() : undefined}
                />
                {this.props.button}
                <ExportCSVButton className='btn btn-info' hidden={this.props.hiddenCSV} { ...props.csvProps } >to CSV</ExportCSVButton>
            </Fragment>)}
            </ToolkitProvider>
            
        )
    }

}

export default TableStudy