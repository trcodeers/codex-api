import { Request } from 'express';

export interface SessionRequest extends Request {
  session: Request['session'] & {
    userId?: string;
  };
}
