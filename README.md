### Objective

Create a concise table of FDA reports of adverse events upon drug consumption searched by reaction type.

### Approach

The API endpoint used here outputs quite a lot of information. This information needs to be carefully parsed to show only the most interesting parts.
* Only a select few fields have been chosen to serve as columns: Reaction, Date, Drugs, Age, and Country of Occurence.
* The table can be sorted by any of the columns.
* To properly interpret the response data, the FDA provides a specification [found here](https://www.fda.gov/media/111763/download).
* Each report can have multiple *Reactions* and *Drugs* so those needed be written out as a comma separated list.
* The width of the columns needed to be adjusted to prevent the table from being totally unreadable in cases where *Reactions* and *Drugs* produce long results.
* The *Country* column reflects the country that reported the event because the country of occurence isn't always available. Such cases have the country name followed by (reported by).

#### Current Limitations
* The search method is limited to searching by reactions only.
* The search is limited to 10 results
  * The best way to improve this is to make several API calls:
    1. first call an endpoint that returns the number of hits for a query. Use this information to fill the pagination data (despite not having all the table data yet).
    2. Make a query to get the first couple pages or so of the table.
    3. Make a query to get the rest of the table silently in the background. 
* The columns for *Drugs* and *Reactions* often produce ugly long lists.
  * This is best solved by only listing one reaction (the one that was searched) and making the row expandable to reveal a sub-table that shows the drugs as well as information on the dosage and perscription period (not currently shown) and the a list of the other reactions.

### Technical Details
* React (hook-based) was used.
  * Material-UI tables were used. It's MIT licensed so it's fine.
  * **Installation instructions**:
    * Need to have node.js installed in your environment (known to work with 13.12).
    * Run the following commands:
      ```
      git clone https://github.com/nora-sandler/kyulux-test && cd kyulux-test
      npm install
      npm start
      ```
    * In a browser, type *localhost:3000/Table* in the address bar.
