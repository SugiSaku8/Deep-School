"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nimi = void 0;
class Nimi {
    constructor(size) {
        this.size = size;
        this.data = new Array(size).fill(null);
    }
    add(index, value) {
        if (index >= 0 && index < this.size) {
            this.data[index] = { value };
        }
    }
    Value(index) {
        if (index >= 0 && index < this.size) {
            return this.data[index];
        }
        return null;
    }
}
exports.Nimi = Nimi;
//# sourceMappingURL=nimi.js.map