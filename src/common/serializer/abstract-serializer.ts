export class AbstractSerializer {
  protected constructor(isCompact: boolean, isPretty?: boolean) {
    if (isPretty && isCompact) {
      this.buildForPrettyCompact();
    } else if (isCompact) {
      this.buildForCompact();
    } else {
      this.build();
    }
  }

  private buildForPrettyCompact(): void {}

  private buildForCompact(): void {}

  private build(): void {}
}
