export class Nimi {
  private data: any[];
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.data = new Array(size).fill(null);
  }

  add(index: number, value: any): void {
    if (index >= 0 && index < this.size) {
      this.data[index] = { value };
    }
  }

  Value(index: number): any {
    if (index >= 0 && index < this.size) {
      return this.data[index];
    }
    return null;
  }
}
