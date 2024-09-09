import { arrayToTree } from "./index";

describe("limitCurrentRequest", () => {

  it("should handle an array with a single node with a null parentId", () => {
    const arrayList = [{ id: 1, parentId: null, name: "Root 1" }];
    const tree = arrayToTree(arrayList);
    expect(tree).toEqual({
      1: { id: 1, name: "Root 1", children: [] },
    });
  });

  it("should handle an array with a single node with a non-null parentId", () => {
    const arrayList = [{ id: 2, parentId: 1, name: "Child 1" }];
    const tree = arrayToTree(arrayList);
    expect(tree).toEqual({});
  });

  it("should return an empty object when the input array is empty", () => {
    const result = arrayToTree([]);
    expect(result).toEqual({});
  });

  it("should handle an array with multiple levels of nested children", () => {
    debugger;
    const arrayList = [
      { id: 1, parentId: null, name: "Root 1" },
      { id: 2, parentId: 1, name: "Child 1" },
      { id: 3, parentId: 1, name: "Child 2" },
      { id: 4, parentId: 2, name: "Grandchild 1" },
      { id: 5, parentId: 2, name: "Grandchild 2" },
      { id: 6, parentId: 3, name: "Grandchild 3" },
    ];
    const tree = arrayToTree(arrayList);
    expect(tree).toEqual({
      1: {
        id: 1,
        name: "Root 1",
        children: [
          {
            id: 2,
            name: "Child 1",
            children: [
              { id: 4, name: "Grandchild 1", children: [] },
              { id: 5, name: "Grandchild 2", children: [] },
            ],
          },
          {
            id: 3,
            name: "Child 2",
            children: [{ id: 6, name: "Grandchild 3", children: [] }],
          },
        ],
      },
    });
  });
});

  it("should handle an array with duplicate IDs", () => {
    const arrayList = [
      { id: 1, parentId: null, name: "Root 1" },
      { id: 1, parentId: null, name: "Root 1 Duplicate" },
      { id: 2, parentId: 1, name: "Child 1" },
    ];
    const tree = arrayToTree(arrayList);
    expect(tree).toEqual({
      1: {
        id: 1,
        name: "Root 1 Duplicate",
        children: [
          { id: 2, name: "Child 1", children: [] },
        ],
      },
    });
  });
