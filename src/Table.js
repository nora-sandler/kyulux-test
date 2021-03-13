
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import * as utils from './utils.js';
import * as fda from './fda-utils.js';
import { countryCodes } from './iso-3166-alpha-2.js';

function createData(indexid, reaction, date, drugs, age, countryCode, countryName, countryIsOnlyReported, gender, strSerious) {
  return { indexid, reaction, date, drugs, age, countryName, country: { countryCode, countryIsOnlyReported }, gender, strSerious };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


let total = 0;

function parseFDAAdverseEventSearch(adverseEventsResponse) {
  let ourRows = []

  if (adverseEventsResponse === undefined || 'error' in adverseEventsResponse) {
    return ourRows
  }

  total = adverseEventsResponse.meta.results.total;
    console.log(total)
    
  let results = adverseEventsResponse.results
  for (let iresult = 0; iresult < results.length; iresult++) {

    
    // Get reactions.
    // let symptoms = []
    let strSymptoms = ""

    let reactions = results[iresult].patient.reaction
    for (let ireaction = 0; ireaction < reactions.length - 1; ireaction++) {
      // symptoms.push(reactions[ireaction].reactionmeddrapt)
      strSymptoms += reactions[ireaction].reactionmeddrapt + ", "

    }
    strSymptoms += reactions[reactions.length - 1].reactionmeddrapt

    // Get date 
    let dateAsRead = results[iresult].receiptdate
    let dateStr = dateAsRead.substr(0, 4) + '/' + dateAsRead.substr(4, 2) + '/' + dateAsRead.substr(6, 2)
    let date = new Date(0)
    date.setUTCSeconds(Date.parse(dateStr) / 1000)


    // Get drugs

    let drugs = results[iresult].patient.drug
    let drugsSorted = []

    for (let idrugs = 0; idrugs < drugs.length; idrugs++) {

      let strCurDrug = drugs[idrugs].medicinalproduct

      let strCurDrugLowered = strCurDrug[0]
      for (let iCurDrug = 1; iCurDrug < strCurDrug.length; iCurDrug++) {
        strCurDrugLowered += strCurDrug[iCurDrug].toLowerCase()
      }

      drugsSorted.push(strCurDrugLowered)
    }

    drugsSorted = utils.sort_unique(drugsSorted)

    let strDrugs = ""
    for (let idrugs = 0; idrugs < drugsSorted.length; idrugs++) {
      strDrugs += drugsSorted[idrugs] + (idrugs < drugsSorted.length - 1 ? ", " : "")
    }

    // Get  age
    let age = fda.getPatientAgeInYears(results[iresult].patient.patientonsetage,
      results[iresult].patient.patientonsetageunit)

    // Get gender

    let gender = ""
    let patient = results[iresult].patient.patientsex
    //console.log(patient, "fem")

    if (patient === "1") {
      gender = "Male"
    }
    else {
      gender = "Female"
    }
    // symptoms.push(reactions[ireaction].reactionmeddrapt)
    // console.log(symptoms[0])





    // strSymptoms += reactions[reactions.length-1].reactionmeddrapt
    // console.log(strSymptoms)

    // Serious
    let newSerious = results[iresult].serious
    console.log("disabling", newSerious)
    let strSerious = ""
    if (newSerious === "1") {
      strSerious = "Yes"
    }
    
    else {
      strSerious = "No"
    }



    // Get country
    let countryCode = ""
    let countryIsOnlyReported = false;
    if ("occurcountry" in results[iresult]) {
      countryCode = results[iresult].occurcountry
    }
    else {
      countryIsOnlyReported = true;
      countryCode = results[iresult].primarysource.reportercountry
    }
    let countryName = countryCodes[countryCode]

    let curRow = createData(ourRows.length, strSymptoms, date, strDrugs, age, countryCode, countryName, countryIsOnlyReported, gender, strSerious)
    ourRows.push(curRow)
  }

  return ourRows
}

function errorReport(error) {
  console.log("error")
}







const headCells = [
  { id: 'reaction', disablePadding: true, label: 'Reactions' }, // patient.reaction.reactionmeddrapt
  { id: 'date', disablePadding: false, label: 'Date' }, // receiptdate
  { id: 'drugs', disablePadding: false, label: 'Drugs' }, // drug[].openfda.generic_name[]
  { id: 'age', disablePadding: false, label: 'Age' }, // patientonsetage
  { id: 'countryName', disablePadding: false, label: 'Country of Occurence' }, // occurcountry
  { id: 'gender', disablePadding: true, label: 'Patient gender' }, // patient gender
  { id: 'strSerious', disablePadding: false, label: 'Seriousness' }, // Seriousness

];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">

        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { onSearch } = props;

  const searchInputStyle = {
    margin: "auto",
    width: "100%",
  }
  const formInputStyle = {
    margin: "auto",
    width: "58%",
  }


  return (
    <Toolbar
      className={clsx(classes.root)}
    >
      <form style={formInputStyle} onSubmit={(e) => { e.preventDefault(); onSearch(e, document.getElementById("searchTerm").value) }} >
        Search: <input
          type="text"
          style={searchInputStyle}
          id="searchTerm"
          name="searchTerm"
          placeholder="Enter Adverse Reaction"
          required
        />
      </form>

    </Toolbar>
  );
};

const getUseStyles = (onGetVisibility) => {
  return makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
      display: onGetVisibility() ? "block" : "none",
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }));
}

export default function EnhancedTable() {
  const [rows, setRows] = useStateWithCallbackLazy([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  //TODO: Kind of a hack but it works to update right away.
  let rows2 = [];

  const handleFetchData = (event, enteredSearchTerm) => {
    fetch(`https://api.fda.gov/drug/event.json?search=patient.reaction.reactionmeddrapt:%22${enteredSearchTerm}%22&limit=10`)
    .then(response => response.json())
      .then(data => {
        setRows(rows2 = parseFDAAdverseEventSearch(data), () => { setIsVisible(rows2.length > 0 ? true : false); });

      }).catch((error) => { errorReport(error) });
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGetVisibility = (event) => {
    return isVisible;
  };

  const paginationStyle = {
    display: handleGetVisibility() ? "block" : "none",
  }


  const classes = getUseStyles(handleGetVisibility)();

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          onSearch={handleFetchData}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size='medium'
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.reaction);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  console.log(`We are on page ${page}: row ${index} Hee Hee`)

                  const rowStyleReactions = {
                    width: "45%"
                  }
                  const rowStyleDrugs = {
                    width: "35%"
                  }
                  const rowStyleAge = {
                    width: "5%"
                  }
                  const rowStyleDate = {
                    width: "5%"
                  }
                  const rowStyleCountry = {
                    width: "10%"
                  }
                  const rowStyleGender = {
                    width: "5%"
                  }
                  const rowStyleSeriousness = {
                    width: "10%"
                  }


                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.reaction)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.indexid}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">

                      </TableCell>
                      <TableCell style={rowStyleReactions} component="th" id={labelId} scope="row" padding="none">
                        {row.reaction}
                      </TableCell>
                      <TableCell style={rowStyleDate} align="left">{row.date.toLocaleDateString()}</TableCell>
                      <TableCell style={rowStyleDrugs} align="left">{row.drugs}</TableCell>
                      <TableCell style={rowStyleAge} align="left">{row.age}</TableCell>
                      <TableCell style={rowStyleCountry} align="left">{row.countryName + (row.country.countryIsOnlyReported ? ' (reported by)' : '')}</TableCell>
                      <TableCell style={rowStyleGender} align="left">{row.gender}</TableCell>
                      <TableCell style={rowStyleSeriousness} align="left">{row.strSerious}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          style={paginationStyle}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
