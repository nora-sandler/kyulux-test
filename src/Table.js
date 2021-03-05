
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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import * as fda from './fda-utils.js';
import { countryCodes } from './iso-3166-alpha-2.js';

function createData(reaction, date, drugs, age, countryCode, countryName, countryIsOnlyReported) {
  return { reaction, date, drugs, age, countryName, country: {countryCode, countryIsOnlyReported } };
}

let rows = [
  // createData('Cupcake', 305, 3.7, 67, 4.3),
  // createData('Donut', 452, 25.0, 51, 4.9),
  // createData('Eclair', 262, 16.0, 24, 6.0),
  // createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  // createData('Gingerbread', 356, 16.0, 49, 3.9),
  // createData('Honeycomb', 408, 3.2, 87, 6.5),
  // createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  // createData('Jelly Bean', 375, 0.0, 94, 0.0),
  // createData('KitKat', 518, 26.0, 65, 7.0),
  // createData('Lollipop', 392, 0.2, 98, 0.0),
  // createData('Marshmallow', 318, 0, 81, 2.0),
  // createData('Nougat', 360, 19.0, 9, 37.0),
  // createData('Oreo', 437, 18.0, 63, 4.0),
];

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

function parseFDAAdverseEventSearch(adverseEventsResponse) {
  console.log("parseFDAAdverseEventSearch")
  console.log(adverseEventsResponse)
  let ourRows = []
  let results = adverseEventsResponse.results
  for(let iresult = 0; iresult < results.length; iresult++) {


    // Get reactions.
    // let symptoms = []
    let strSymptoms = ""

    let reactions = results[iresult].patient.reaction
    for(let ireaction = 0; ireaction < reactions.length-1; ireaction++) {
      // symptoms.push(reactions[ireaction].reactionmeddrapt)
      // console.log(symptoms[0])
      strSymptoms += reactions[ireaction].reactionmeddrapt + ", "
      
    }
    strSymptoms += reactions[reactions.length-1].reactionmeddrapt
    console.log(strSymptoms)

   // Get date 
   let dateAsRead = results[iresult].receiptdate
   let dateStr = dateAsRead.substr(0,4) + '/' + dateAsRead.substr(4,2) + '/' + dateAsRead.substr(6,2)
   let date = new Date(0)
   date.setUTCSeconds(Date.parse( dateStr ) / 1000)


   // Get drugs
   let strDrugs = ""

   let drugs = results[iresult].drugs
   for(let idrugs = 0; idrugs < drugs.length; idrugs++) {
     // symptoms.push(reactions[ireaction].reactionmeddrapt)
     // console.log(symptoms[0])
     let strCurDrug = drugs.medicinalproduct
     for(let iCurDrug = 1; iCurDrug < strCurDrug.length; iCurDrug++)
     {
       strCurDrug[iCurDrug].toLowerCase() 
     }
     strDrugs += strCurDrug + (idrugs < drugs.length - 1 ? ", " : "")
   }


   // Get age
   let age = fda.getPatientAgeInYears( results[iresult].patient.patientonsetage,
                                       results[iresult].patient.patientonsetageunit )


   // Get country
   let countryCode = ""
   let countryIsOnlyReported = false;
   if( "occurcountry" in results[iresult] ) {
     countryCode = results[iresult].occurcountry
   }
   else {
     countryIsOnlyReported = true;
     countryCode = results[iresult].primarysource.reportercountry
   }
   let countryName = countryCodes[countryCode]

   let curRow = createData(strSymptoms, date, strDrugs, age, countryCode, countryName, countryIsOnlyReported)
   ourRows.push(curRow)
  }

  return ourRows
}

function errorReport(error)
{
  console.log("error")
}


fetch('https://api.fda.gov/drug/event.json?search=patient.reaction.reactionmeddrapt:%22headache%22&limit=50').then(response => response.json())
            .then(data => { rows = parseFDAAdverseEventSearch(data)
        }).catch((error) => { errorReport(error) })

const headCells = [
  { id: 'reaction', numeric: false, disablePadding: true, label: 'Reactions' }, // patient.reaction.reactionmeddrapt
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' }, // receiptdate
  { id: 'drugs', numeric: false, disablePadding: false, label: 'Drugs' }, // drug[].openfda.generic_name[]
  { id: 'age', numeric: true, disablePadding: false, label: 'Age' }, // patientonsetage
  { id: 'countryName', numeric: false, disablePadding: false, label: 'Country of Occurence' }, // occurcountry
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
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
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
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
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
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

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.reaction);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  const rowStyleReactions = {
                    width: "25%"
                  }
                  const rowStyleDrugs = {
                    width: "25%"
                  }

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.reaction)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.reaction}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell style={rowStyleReactions} component="th" id={labelId} scope="row" padding="none">
                        {row.reaction}
                      </TableCell>
                      <TableCell align="right">{row.date.toLocaleDateString()}</TableCell>
                      <TableCell align="right">{row.drugs}</TableCell>
                      <TableCell align="right">{row.age}</TableCell>
                      <TableCell align="left">{row.countryName + (row.country.countryIsOnlyReported ? ' (reported by)' : '')}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
}
