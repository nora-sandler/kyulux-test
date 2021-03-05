
export function getPatientAgeInYears(patientonsetage, patientonsetageunit) {
  // First get the age in hours
  let multiplier = 0;

  if      ( patientonsetageunit === "800" ) { // Decade
    multiplier = 24*7*52*10
  } 
  else if ( patientonsetageunit === "801" ) { // Year
    multiplier = 24*7*52
  }
  else if ( patientonsetageunit === "802" ) { // Month
    multiplier = 24*7*52/12
  }
  else if ( patientonsetageunit === "803" ) { // Week
    multiplier = 24*7
  }
  else if ( patientonsetageunit === "804" ) { // Day
    multiplier = 24
  }
  else if ( patientonsetageunit === "805" ) { // Hour
    multiplier = 1
  }
  else
  {
    // TODO: throw error
  }

  return patientonsetage !== undefined ? (patientonsetage * multiplier / (24*7*52)).toString() : "Unknown";
}
