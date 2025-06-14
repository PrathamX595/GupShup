class ApiResponse<TData> {
    statusCode: number;
    data: TData;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: TData, message: string = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}