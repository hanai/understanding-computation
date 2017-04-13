export default class SetExt<T> extends Set<T> {
  constructor(values?: T[] | Set<any>) {
    super(values);
  }

  intersection(setB: Set<any>) {
    var intersection = new SetExt();
    for (var elem of setB) {
      if (this.has(elem)) {
        intersection.add(elem);
      }
    }
    return intersection;
  }

  union(setB: Set<any>) {
    var union = new SetExt(this);
    for (var elem of setB) {
      union.add(elem);
    }
    return union;
  }

  difference(setB: Set<any>) {
    var difference = new SetExt(this);
    for (var elem of setB) {
      difference.delete(elem);
    }
    return difference;
  }

  subset(setB: Set<any>): boolean {
    return Array.from(this).every(val => setB.has(val));
  }
}
