// Browser-compatible MongoDB implementation
// This file provides browser-compatible versions of MongoDB functionality

export class ObjectId {
  private id: string;

  constructor(id?: string) {
    this.id = id || this.generateId();
  }

  toString() {
    return this.id;
  }

  equals(other: ObjectId) {
    return this.id === other.id;
  }

  // Simple implementation to generate a random ID
  private generateId(): string {
    return "xxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, () => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
