declare module '@strudel/web' {
  export interface InitStrudelOptions {
    prebake?: () => unknown | Promise<unknown>;
  }

  export function initStrudel(options?: InitStrudelOptions): Promise<void> | void;
  export function evaluate(
    code: string,
    showOutput?: boolean,
    hushFirst?: boolean,
  ): Promise<unknown>;
  export function hush(): void;
  export function getTime(): number;
  export function setcpm(value: number): unknown;
  export function samples(source: string): unknown;
}
