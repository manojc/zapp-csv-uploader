class CellRenderer {

    createGui() {
        const template =
            '<button id="theButton" style="height: 30px">✎</button><span id="theValue" style="padding-left: 5px;"></span>';
        const span = document.createElement('span');
        span.innerHTML = template;
        this.eGui = span;
    }

    init(params) {
        // create the gui
        this.createGui();
        // keep params, we use it in onButtonClicked
        this.params = params;

        // attach the value to the value span
        const eValue = this.eGui.querySelector('#theValue');

        eValue.textContent = params.value;
        // setup the button, first get reference to it
        this.eButton = this.eGui.querySelector('#theButton');

        this.buttonClickListener = () => this.onButtonClicked();
        this.eButton.addEventListener('click', this.buttonClickListener);
    }
    onButtonClicked() {
        // start editing this cell. see the docs on the params that this method takes
        const startEditingParams = {
            rowIndex: this.params.node.rowIndex,
            colKey: this.params.column.getId(),
        };
        this.params.api.startEditingCell(startEditingParams);
    }
    getGui() {
        // returns our gui to the grid for this cell
        return this.eGui;
    }
    refresh() {
        return false;
    }
    destroy() {
        // be good, clean up the listener
        this.eButton.removeEventListener('click', this.buttonClickListener);
    }
}

class Table {

    constructor() {

        this.rowData = [];

        this.columnDefs = [
            {
                cellStyle: { textAlign: "center" },
                headerName: "SKU",
                field: "sku"
            },
            {
                cellStyle: { textAlign: "center" },
                headerName: "Store",
                field: "store"
            }
            ,
            {
                cellStyle: { textAlign: "left" },
                headerName: "Quantity",
                field: "quantity",
                editable: true,
                cellRenderer: CellRenderer,
            }
            ,
            {
                cellStyle: { textAlign: "left" },
                headerName: "Description",
                field: "description",
                editable: true,
                cellRenderer: CellRenderer,
            }
            ,
            {
                cellStyle: { textAlign: "center" },
                headerName: "Actions",
                field: "actions",
                cellRenderer: function (params) {
                    return `<button onclick="window.app.deleteRow('' + ${params.rowIndex} + '')">Delete</button>`;
                }
            }
        ];

        this.gridOptions = {
            columnDefs: this.columnDefs,
            rowData: this.rowData,
            pagination: true,
            suppressClickEdit: true,
            paginationAutoPageSize: true,
            onCellValueChanged: function (event) {
                window.app.updateData(
                    event.data.id,
                    {
                        quantity: parseInt(event.data.quantity),
                        description: (event.data.description || "").trim()
                    }
                )

            }
        };
    }
}

class App {

    constructor() {
        this.table = new Table();
        this.http = new HttpRequest();
    }

    init() {
        const gridDiv = document.querySelector("#myGrid");
        this.table.api = new agGrid.createGrid(gridDiv, this.table.gridOptions);
        this.fetchData();
    }

    async uploadCsv() {
        const inputEl = document.getElementById("csv-input");
        if (!inputEl?.files?.length) {
            alert("CSV file not selected1");
            return;
        }
        const file = inputEl.files[0];
        await this.http.postFile('api/csv/upload', file);
        await this.fetchData();
    }

    async deleteRow(index) {
        let confirmed = confirm("Are you sure you want to delete this item?");
        if (confirmed) {
            const rowData = this.table.api.getRowNode(index).data;
            await this.http.delete("api/csv/" + rowData.id);
            this.table.api.applyTransaction({ remove: [rowData] });
        }
    }

    async fetchData() {
        const data = await this.http.post(
            "api/csv/list",
            { page_size: 1000, page_number: 1 }
        );
        this.table.api.setGridOption("rowData", data.rows);
    }

    async updateData(id, payload) {
        await this.http.put("api/csv/" + id, payload);
    }

}


document.addEventListener("DOMContentLoaded", function () {
    window.app = new App();
    window.app.init();
});
