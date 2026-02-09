declare module "pg" {
  export class Pool {
    constructor(config?: any);
    connect(): Promise<any>;
    query<T = any>(...args: any[]): Promise<{ rows: T[] }>;
    end(): Promise<void>;
  }
}
