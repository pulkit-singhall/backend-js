class ApiResponse { 
    constructor(statusCode, data, message = "Success in Response") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;  
    }
}

export { ApiResponse }