import { LinkList } from "./index";

describe("limitCurrentRequest", () => {
  it("should insert a node at the head when the list is empty", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);

    expect(list.head).not.toBeNull();
    expect(list.head?.value).toBe(10);
    expect(list.head?.next).toBeNull();
  });

  it("should insert a node at the head when the list is not empty", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);

    expect(list.head).not.toBeNull();
    expect(list.head?.value).toBe(10);
    expect(list.head?.next).not.toBeNull();
    expect(list.head?.next?.value).toBe(20);
    expect(list.head?.next?.next).toBeNull();
  });

  it("should return 'false' when attempting to delete from an empty list", () => {
    const list = new LinkList<number>();
    const result = list.deleteAtPosition(0);
    expect(result).toBe(false);
  });

  it("should delete the head node when index is 0 and list has one element", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    const result = list.deleteAtPosition(0);

    expect(result).toBe(true);
    expect(list.head).toBeNull();
  });

  it("should delete the node at the given index when the index is within the list bounds", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);
    list.insertAtHead(30);

    const result = list.deleteAtPosition(1);

    expect(result).toBe(true);
    expect(list.head).not.toBeNull();
    expect(list.head?.value).toBe(10);
    expect(list.head?.next).not.toBeNull();
    expect(list.head?.next?.value).toBe(30);
    expect(list.head?.next?.next).toBeNull();
  });

  it("should return 'false' when attempting to delete at an index equal to the list length", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);

    const result = list.deleteAtPosition(3);

    expect(result).toBe(false);
    expect(list.head).not.toBeNull();
    expect(list.head?.value).toBe(10);
  });

  it("should return 'false' when attempting to delete at a negative index", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    const result = list.deleteAtPosition(-1);
    expect(result).toBe(false);
  });

  it("should return an empty string when the list is empty", () => {
    const list = new LinkList<number>();
    const result = list.toString();
    expect(result).toBe("");
  });

  it("should correctly convert a multi-node list to a string", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);
    list.insertAtHead(30);

    const result = list.toString();
    expect(result).toBe("10 -> 20 -> 30");
  });

  it("should handle a list with mixed data types correctly", () => {
    const list = new LinkList<any>();
    list.insertAtHead(10);
    list.insertAtHead("string");
    list.insertAtHead(true);

    const result = list.toString();
    expect(result).toBe("10 -> string -> true");
  });

  it("should return 'null' when the input value is null", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);

    const result = list.find(null);
    expect(result).toBeNull();
  });

  it("should return the correct node when the value is found at the head of the list", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);
    list.insertAtHead(30);

    const result = list.find(10);

    expect(result).not.toBeNull();
    expect(result?.value).toBe(10);
  });
  

  it("should return the correct node when the value is found in the middle of the list", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);
    list.insertAtHead(20);
    list.insertAtHead(30);
  
    const result = list.find(20);
  
    expect(result).not.toBeNull();
    expect(result?.value).toBe(20);
  });

  it("should return 'null' when the list is empty and a non-null value is searched", () => {
    const list = new LinkList<number>();
    const result = list.find(10);
    expect(result).toBeNull();
  });

  it("should return 'null' when the value is not found in the list", () => {
    const list = new LinkList<number>();
    list.insertAtHead(10);

    const result = list.find(20);
    expect(result).toBeNull();
  })
});
