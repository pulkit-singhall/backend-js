class ApiResponse { 
    constructor(statusCode, message = "Success in Response", data) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;  
    }
}