import * as stream from "readable-stream";
import * as promisify from "util.promisify";

export const finishedAsync: (src: any) => Promise<any> =
    promisify(stream.finished);
export const pipelineAsync: (...src: stream.Stream[]) => Promise<any> =
    promisify(stream.pipeline);

export function reduceStreamToPromise<T>(
    readable: stream.Readable,
    dataCallback?: (result: T, chunk: any) => T,
    seed?: T): Promise<T> {
    if (dataCallback) {
        readable.on("data", data => seed = dataCallback(seed, data));
    }

    return finishedAsync(readable)
        .then(() => seed);
}

export function readToEnd(readable: stream.Readable): Promise<string> {
    return reduceStreamToPromise(readable, (result, chunk) => result + chunk, "");
}

export function stringToReadable(s: string) {
    const result = new stream.Readable();
    result.push(s);
    result.push(null);
    return result;
}

export function printStreamTraffic(str) {
    // tslint:disable-next-line:no-console
    str.on("data", d => console.log("READ", d.toString()));
    const orgWrite = str.write;
    str.write = (...args) => {
        // tslint:disable-next-line:no-console
        console.log("WRITE", args[0]);
        return orgWrite.call(str, ...args);
    };
}
