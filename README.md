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
  * These openFDA APIs actually allow making queries in a paged manner described [here](https://open.fda.gov/apis/paging).
    * A query with a limit of one can be made just to get the total hit count and fill the pagination information accordingly.
    * When clicking through pages, another query can be made by carefully adjusting the *skip* and *limit* parameters to reflect the page number and page size, respectively.
    * Sorting the columns would result in another query by specifying the *sort* parameter to the needed column and indicate whether it's ascending or descending.
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
