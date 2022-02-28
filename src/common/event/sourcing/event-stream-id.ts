// TODO: make class final
export class EventStreamId {
  private _streamName: string;
  private _streamVersion: number;

  // TODO: overload constructor
  constructor(
    streamName?: string,
    streamVersion?: number,
    streamnameSegment1?: string,
    streamNameSegment2?: string,
  ) {
    this.setStreamName(
      streamName || streamnameSegment1 + ':' + streamNameSegment2,
    );
    this.setStreamVersion(streamVersion || 1);
  }

  streamName(): string {
    return this._streamName;
  }

  streamVersion(): number {
    return this._streamVersion;
  }

  withStreamVersion(streamVersion: number): EventStreamId {
    return new EventStreamId(this.streamName(), streamVersion);
  }

  private setStreamName(streamName: string) {
    this._streamName = streamName;
  }

  private setStreamVersion(streamVersion: number) {
    this._streamVersion = streamVersion;
  }
}
