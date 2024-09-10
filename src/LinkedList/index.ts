export class LinkNode<T> {
  value: T;
  next: LinkNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class LinkList<T> {
  head: LinkNode<T> | null = null;

  insertAtHead(value: T): void {
    const newNode = new LinkNode(value);
    if (this.head === null) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
  }

  deleteAtPosition(index: number): boolean {
    if (index < 0 || this.head === null) {
      return false;
    }

    if (index === 0) {
      this.head = this.head.next;
      return true;
    }

    let current = this.head;
    let previous: LinkNode<T> | null = null;
    let currentIndex = 0;

    while (current.next && currentIndex < index) {
      previous = current;
      current = current.next;
      currentIndex++;
    }

    if (previous && current) {
      previous.next = current.next;
      return true;
    }

    return false;
  }

  find(value: T | null): LinkNode<T> | null {
    if (!value || this.head === null) {
      return null;
    }

    let current: LinkNode<T> | null = this.head;
    while (current) {
      if (current.value === value) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  toString(): string {
    const result: T[] = [];

    let current: LinkNode<T> | null = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result.join(" -> ");
  }
}
