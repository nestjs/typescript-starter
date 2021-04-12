class Response<D = any> {
  /**
   * Response message
   */
  public message: string;
  /**
   * Resposne data
   */
  public data: D;
  /**
   * Errors list
   */
  public errors: string[];
  /**
   * Operation status
   */
  public status = true;

  /**
   * Error code
   */
  public code: number;

  /**
   * Init response
   */
  public constructor({
    message,
    data,
    errors,
    status,
    code,
  }: Partial<Response>) {
    this.message = message || '';
    this.data = data || {};
    this.status = status || false;
    this.errors = errors || undefined;
    this.code = code || undefined;
  }
}

export { Response };
