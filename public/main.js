class Table {

    constructor() {

        this.rowData = [];

        this.columnDefs = [
            { headerClass: "header-center", cellStyle: { textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }, headerName: "SKU", field: "sku" },
            { headerClass: "header-center", cellStyle: { textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }, headerName: "Store", field: "store" },
            { headerClass: "header-center", cellStyle: { textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }, headerName: "Quantity", field: "quantity", editable: true },
            { headerClass: "header-center", cellStyle: { textAlign: "center", whiteSpace: "normal", wordWrap: "break-word" }, headerName: "Description", field: "description", editable: true },
            {
                headerClass: "header-center", cellStyle: { textAlign: "center" }, headerName: "Actions", field: "actions",
                cellRenderer: function (params) {
                    return `<button onclick="window.app.deleteRow('' + ${params.rowIndex} + '')">Delete</button>`;
                }
            }
        ];

        this.gridOptions = {
            columnDefs: this.columnDefs,
            rowData: this.rowData,
            pagination: true,
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
        this.table.api.setRowData(data.rows);
    }

    async updateData(id, payload) {
        await this.http.put("api/csv/" + id, payload);
    }

}


document.addEventListener("DOMContentLoaded", function () {
    window.app = new App();
    window.app.init();
});
