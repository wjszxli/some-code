// function concurrentRequest<T>(
//   requestFns: (() => Promise<T>)[],
//   maxConcurrent: number
// ): Promise<T[]> {
//   let activeCount = 0;
//   const results: T[] = [];
//   const queue: (() => Promise<void>)[] = [];

//   return new Promise((resolve, reject) => {
//     const runNext = () => {
//       if (queue.length === 0 && activeCount == 0) {
//         resolve(results);
//         return;
//       }

//       while (activeCount < maxConcurrent && queue.length > 0) {
//         const fn = queue.shift();
//         if (fn) {
//           activeCount++;
//           fn()
//             .then(() => {
//               activeCount--;
//               runNext();
//             })
//             .catch(reject);
//         }
//       }
//     };

//     requestFns.forEach((fn, index) => {
//       queue.push(() => {
//         return fn().then((result) => {
//           results[index] = result;
//         });
//       });
//     });

//     runNext();
//   });
// }

// function limitRequest<T>(requestList: (() => Promise<T>)[], limitCount: number): Promise<T[]> {
//     const queue: (() => Promise<void>)[] = []
//     const results: T[] = [];

//     return new Promise((resolve, reject) => {
//         let activeRequestsCount = 0;

//         const runNext = () => {

//             if (queue.length === 0 && activeRequestsCount === 0) {
//                 resolve(results)
//             }
//             while (queue.length > 0 && activeRequestsCount < limitCount) {
//                 const fn = queue.shift();
//                 if (typeof fn === 'function') {
//                     activeRequestsCount++;
//                     fn().then(() => {
//                         activeRequestsCount--;
//                         runNext();
//                     })
//                 }
//             }
//         }

//         requestList.forEach((fn, index) => {
//             queue.push(async () => {
//                 results[index] = await fn();
//             })
//         })

//         runNext();
//     })
// }

// const request1 = new Promise((resolve, reject) => setTimeout(() => resolve("result1"), 2000))

// const request2 = new Promise((resolve, reject) => setTimeout(() => resolve("result2"), 2000))

// const request3 = new Promise((resolve, reject) => setTimeout(() => resolve("result3"), 2000))

// const getData = async () => {
//     const data = await limitRequest([() => request1, () => request2, () => request3], 2)
//     console.log(data)
// }

// getData()

export function limitCurrentRequest<T>(
    requestList: (() => Promise<T>)[],
    limitRequest: number
) {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        let maxRequestCount = 0;
        let currentIndex = 0;

        const runNext = async () => {
            if (currentIndex >= requestList.length && maxRequestCount === 0) {
                resolve(results);
                return;
            }

            while (
                maxRequestCount < limitRequest &&
                currentIndex < requestList.length
                ) {
                const requestIndex = currentIndex++;
                maxRequestCount++;
                requestList[requestIndex]()
                    .then((res) => {
                        results[requestIndex] = res;
                        maxRequestCount--;
                        runNext();
                    })
                    .catch((err) => reject(err));
            }
        };
        runNext();
    });
}

const request1 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result1"), 2000)
);

const request2 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result2"), 2000)
);

const request3 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result3"), 2000)
);

const request4 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result4"), 2000)
);

const request5 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result5"), 2000)
);

const request6 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result6"), 2000)
);

const request7 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result7"), 2000)
);

const request8 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result8"), 2000)
);

const request9 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result9"), 2000)
);

const request10 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result10"), 2000)
);

const request11 = new Promise((resolve, reject) =>
    setTimeout(() => resolve("result11"), 2000)
);

const getData = async () => {
    const data = await limitCurrentRequest(
        [
            () => request1,
            () => request2,
            () => request3,
            () => request4,
            () => request5,
            () => request6,
            () => request7,
            () => request8,
            () => request9,
            () => request10,
            () => request11,
        ],
        3
    );
    console.log(data);
};

getData();
