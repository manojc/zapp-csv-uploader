class HttpRequest {

    constructor() {
        this.baseUrl = "/";
    }

    get(url) {
        return this.makeRequest("GET", url);
    }

    post(url, data) {
        return this.makeRequest("POST", url, data);
    }

    put(url, data) {
        return this.makeRequest("PUT", url, data);
    }

    delete(url) {
        return this.makeRequest("DELETE", url);
    }

    postFile(url, file) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            xhr.open('POST', this.baseUrl + url, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(null);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                reject(xhr.statusText);
            };
            xhr.send(formData);
        });
    }

    makeRequest(method, url, data = null) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, this.baseUrl + url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(xhr.status === 200 ? JSON.parse(xhr.responseText) : null);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                reject(xhr.statusText);
            };
            xhr.send(data !== null ? JSON.stringify(data) : null);
        });
    }
}