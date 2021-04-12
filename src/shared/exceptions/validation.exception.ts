type ValidationExceptionMeta = {
  message: string;
  errors: string[];
  code: number;
};

class ValidationException {
  /**
   * Error message
   */
  public message: string;
  /**
   * Error list
   */
  public errors: string[] = [];
  /**
   * Error code
   */
  public code: number;

  /**
   * Init exception
   */
  public constructor({
    message = '',
    errors = [],
    code = 3001,
  }: ValidationExceptionMeta) {
    this.message = message;
    this.errors = errors;
    this.code = code;
  }
}

export { ValidationException };
