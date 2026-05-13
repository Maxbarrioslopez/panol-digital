export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 400, code: string = 'APP_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}
