import { evaluate, hush, initStrudel, samples } from '@strudel/web';

class StrudelEngine {
  private initPromise?: Promise<void>;

  async ready(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = Promise.resolve(
        initStrudel({
          prebake: () => samples('github:tidalcycles/dirt-samples'),
        }),
      );
    }

    return this.initPromise;
  }

  async play(code: string): Promise<void> {
    await this.ready();
    hush();
    await evaluate(code);
  }

  stop(): void {
    hush();
  }
}

export const strudelEngine = new StrudelEngine();
