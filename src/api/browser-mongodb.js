// Browser-compatible MongoDB implementation
// This file provides browser-compatible versions of MongoDB functionality
export class ObjectId {
    constructor(id) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = id || this.generateId();
    }
    toString() {
        return this.id;
    }
    equals(other) {
        return this.id === other.id;
    }
    // Simple implementation to generate a random ID
    generateId() {
        return "xxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, () => {
            const r = Math.floor(Math.random() * 16);
            return r.toString(16);
        });
    }
}
