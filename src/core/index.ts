import { createFormExternals } from "./externals";
import { createFormInternals } from "./internals";
import { IFormCreatorOptions } from "./type";

declare global {
  namespace FormilyCore {
    export interface FieldProps {
      [key: string]: any;
    }
    export interface VirtualFieldProps {
      [key: string]: any;
    }
  }
}

export const createForm = (options: IFormCreatorOptions = {}) => {
  return createFormExternals(createFormInternals(options));
};
