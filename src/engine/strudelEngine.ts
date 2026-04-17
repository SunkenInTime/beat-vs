import { evaluate, hush, initStrudel, samples } from '@strudel/web';

class StrudelEngine {
  private initPromise?: Promise<void>;
  private isInitialized = false;

  async ready(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = Promise.resolve(
        initStrudel({
          prebake: () => samples('github:tidalcycles/dirt-samples'),
        }),
      ).then(() => {
        this.isInitialized = true;
      });
    }

    return this.initPromise;
  }

  async play(code: string): Promise<void> {
    await this.ready();
    hush();
    await evaluate(code);
  }

  stop(): void {
    if (!this.isInitialized) {
      return;
    }

    hush();
  }
}

export const strudelEngine = new StrudelEngine();
