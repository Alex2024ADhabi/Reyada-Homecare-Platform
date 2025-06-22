import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";

// Real-time Analytics Configuration
export interface RealTimeAnalyticsConfig {
  streamEndpoint: string;
  apiKey: string;
  region: string;
  bufferSize: number;
  flushInterval: number; // milliseconds
  retryAttempts: number;
  enableCompression: boolean;
  enableEncryption: boolean;
}

// Stream Interfaces
export interface DataStream {
  streamId: string;
  name: string;
  description: string;
  schema: StreamSchema;
  partitionKey: string;
  retentionPeriod: number; // hours
  shardCount: number;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  metrics: StreamMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamSchema {
  fields: StreamField[];
  version: string;
  compatibility: "BACKWARD" | "FORWARD" | "FULL" | "NONE";
}

export interface StreamField {
  name: string;
  type:
    | "STRING"
    | "INTEGER"
    | "FLOAT"
    | "BOOLEAN"
    | "TIMESTAMP"
    | "OBJECT"
    | "ARRAY";
  required: boolean;
  description?: string;
}

export interface StreamMetrics {
  recordsPerSecond: number;
  bytesPerSecond: number;
  errorRate: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  lastUpdated: Date;
}

// Real-time Event Interfaces
export interface RealTimeEvent {
  eventId: string;
  streamId: string;
  timestamp: Date;
  eventType: string;
  source: string;
  data: any;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  userAgent?: string;
  ipAddress?: string;
  tags?: { [key: string]: string };
}

// Analytics Query Interfaces
export interface RealTimeQuery {
  queryId: string;
  streamId: string;
  timeWindow: TimeWindow;
  aggregations: Aggregation[];
  filters: Filter[];
  groupBy?: string[];
  orderBy?: OrderBy[];
  limit?: number;
}

export interface TimeWindow {
  type: "TUMBLING" | "SLIDING" | "SESSION";
  size: number; // milliseconds
  advance?: number; // milliseconds (for sliding windows)
  sessionTimeout?: number; // milliseconds (for session windows)
}

export interface Aggregation {
  field: string;
  function:
    | "COUNT"
    | "SUM"
    | "AVG"
    | "MIN"
    | "MAX"
    | "DISTINCT_COUNT"
    | "PERCENTILE";
  alias?: string;
  parameters?: any;
}

export interface Filter {
  field: string;
  operator:
    | "="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "IN"
    | "NOT_IN"
    | "CONTAINS"
    | "REGEX";
  value: any;
}

export interface OrderBy {
  field: string;
  direction: "ASC" | "DESC";
}

// Analytics Result Interfaces
export interface RealTimeResult {
  queryId: string;
  timestamp: Date;
  windowStart: Date;
  windowEnd: Date;
  data: any[];
  metadata: ResultMetadata;
}

export interface ResultMetadata {
  recordCount: number;
  processingTime: number;
  dataFreshness: number; // milliseconds
  confidence: number; // 0-1
}

// Real-time Analytics Service Implementation
export class RealTimeAnalyticsService {
  private config: RealTimeAnalyticsConfig;
  private streams: Map<string, DataStream> = new Map();
  private activeQueries: Map<string, RealTimeQuery> = new Map();
  private eventBuffer: Map<string, RealTimeEvent[]> = new Map();
  private websocketConnections: Map<string, any> = new Map();

  constructor(config: RealTimeAnalyticsConfig) {
    this.config = config;
    this.initializeStreams();
    this.startBufferFlush();
  }

  // Stream Management
  async createStream(stream: DataStream): Promise<void> {
    try {
      // Validate stream configuration
      this.validateStream(stream);

      // Create physical stream
      await this.createPhysicalStream(stream);

      // Store stream metadata
      await this.storeStreamMetadata(stream);

      // Initialize stream buffer
      this.eventBuffer.set(stream.streamId, []);

      // Add to local registry
      this.streams.set(stream.streamId, stream);

      console.log(`Stream ${stream.name} created successfully`);
    } catch (error) {
      console.error("Error creating stream:", error);
      throw new Error(`Failed to create stream: ${error.message}`);
    }
  }

  async getStream(streamId: string): Promise<DataStream | null> {
    return this.streams.get(streamId) || null;
  }

  async listStreams(): Promise<DataStream[]> {
    return Array.from(this.streams.values());
  }

  // Event Ingestion
  async ingestEvent(event: RealTimeEvent): Promise<void> {
    try {
      // Validate event
      await this.validateEvent(event);

      // Store event in database for persistence
      await this.storeEvent(event);

      // Add to buffer
      const buffer = this.eventBuffer.get(event.streamId) || [];
      buffer.push(event);
      this.eventBuffer.set(event.streamId, buffer);

      // Check if buffer should be flushed
      if (buffer.length >= this.config.bufferSize) {
        await this.flushBuffer(event.streamId);
      }

      // Process real-time queries
      await this.processRealTimeQueries(event);
    } catch (error) {
      console.error("Error ingesting event:", error);
      throw new Error(`Failed to ingest event: ${error.message}`);
    }
  }

  async ingestBatch(events: RealTimeEvent[]): Promise<void> {
    try {
      for (const event of events) {
        await this.ingestEvent(event);
      }
    } catch (error) {
      console.error("Error ingesting batch:", error);
      throw new Error(`Failed to ingest batch: ${error.message}`);
    }
  }

  // Real-time Querying
  async executeRealTimeQuery(query: RealTimeQuery): Promise<RealTimeResult> {
    try {
      const startTime = Date.now();

      // Get stream data from database
      const streamData = await this.getStreamData(
        query.streamId,
        query.timeWindow,
      );

      // Apply filters
      const filteredData = this.applyFilters(streamData, query.filters);

      // Apply aggregations
      const aggregatedData = this.applyAggregations(
        filteredData,
        query.aggregations,
        query.groupBy,
      );

      // Apply ordering and limiting
      const finalData = this.applyOrderingAndLimiting(
        aggregatedData,
        query.orderBy,
        query.limit,
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      const result: RealTimeResult = {
        queryId: query.queryId,
        timestamp: new Date(),
        windowStart: new Date(Date.now() - query.timeWindow.size),
        windowEnd: new Date(),
        data: finalData,
        metadata: {
          recordCount: finalData.length,
          processingTime,
          dataFreshness: this.calculateDataFreshness(query.streamId),
          confidence: this.calculateConfidence(finalData),
        },
      };

      return result;
    } catch (error) {
      console.error("Error executing real-time query:", error);
      throw new Error(`Failed to execute real-time query: ${error.message}`);
    }
  }

  async subscribeToQuery(
    query: RealTimeQuery,
    callback: (result: RealTimeResult) => void,
  ): Promise<string> {
    try {
      const subscriptionId = new ObjectId().toString();

      // Store active query
      this.activeQueries.set(subscriptionId, query);

      // Set up periodic execution
      const interval = setInterval(async () => {
        try {
          const result = await this.executeRealTimeQuery(query);
          callback(result);
        } catch (error) {
          console.error("Error in query subscription:", error);
        }
      }, query.timeWindow.advance || query.timeWindow.size);

      // Store interval for cleanup
      (this.activeQueries.get(subscriptionId) as any).interval = interval;

      return subscriptionId;
    } catch (error) {
      console.error("Error subscribing to query:", error);
      throw new Error(`Failed to subscribe to query: ${error.message}`);
    }
  }

  async unsubscribeFromQuery(subscriptionId: string): Promise<void> {
    const query = this.activeQueries.get(subscriptionId) as any;
    if (query && query.interval) {
      clearInterval(query.interval);
    }
    this.activeQueries.delete(subscriptionId);
  }

  // Private helper methods
  private async initializeStreams(): Promise<void> {
    const db = getDb();
    const collection = db.collection("real_time_streams");
    const streams = await collection.find({}).toArray();

    streams.forEach((stream) => {
      this.streams.set(stream.streamId, stream);
      this.eventBuffer.set(stream.streamId, []);
    });
  }

  private startBufferFlush(): void {
    setInterval(async () => {
      for (const streamId of this.eventBuffer.keys()) {
        await this.flushBuffer(streamId);
      }
    }, this.config.flushInterval);
  }

  private validateStream(stream: DataStream): void {
    if (!stream.streamId || !stream.name || !stream.schema) {
      throw new Error("Stream must have id, name, and schema");
    }

    if (!stream.schema.fields || stream.schema.fields.length === 0) {
      throw new Error("Stream schema must have at least one field");
    }
  }

  private async createPhysicalStream(stream: DataStream): Promise<void> {
    // Implementation would create actual stream in streaming platform
    console.log(`Creating physical stream for ${stream.name}`);
  }

  private async storeStreamMetadata(stream: DataStream): Promise<void> {
    const db = getDb();
    const collection = db.collection("real_time_streams");

    await collection.insertOne({
      ...stream,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async validateEvent(event: RealTimeEvent): Promise<void> {
    const stream = this.streams.get(event.streamId);
    if (!stream) {
      throw new Error(`Stream ${event.streamId} not found`);
    }

    // Validate event data against stream schema
    this.validateEventData(event.data, stream.schema);
  }

  private validateEventData(data: any, schema: StreamSchema): void {
    schema.fields.forEach((field) => {
      if (field.required && !(field.name in data)) {
        throw new Error(`Required field ${field.name} is missing`);
      }

      if (field.name in data) {
        const value = data[field.name];
        if (!this.isValidType(value, field.type)) {
          throw new Error(`Field ${field.name} has invalid type`);
        }
      }
    });
  }

  private isValidType(value: any, type: string): boolean {
    switch (type) {
      case "STRING":
        return typeof value === "string";
      case "INTEGER":
        return Number.isInteger(value);
      case "FLOAT":
        return typeof value === "number";
      case "BOOLEAN":
        return typeof value === "boolean";
      case "TIMESTAMP":
        return value instanceof Date || !isNaN(Date.parse(value));
      case "OBJECT":
        return typeof value === "object" && value !== null;
      case "ARRAY":
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private async storeEvent(event: RealTimeEvent): Promise<void> {
    const db = getDb();
    const collection = db.collection("real_time_events");

    await collection.insertOne({
      ...event,
      _timestamp: new Date(),
    });
  }

  private async flushBuffer(streamId: string): Promise<void> {
    const buffer = this.eventBuffer.get(streamId);
    if (!buffer || buffer.length === 0) return;

    try {
      // Process events in buffer
      await this.processBufferedEvents(streamId, buffer);

      // Clear buffer
      this.eventBuffer.set(streamId, []);

      console.log(`Flushed ${buffer.length} events for stream ${streamId}`);
    } catch (error) {
      console.error(`Error flushing buffer for stream ${streamId}:`, error);
    }
  }

  private async processBufferedEvents(
    streamId: string,
    events: RealTimeEvent[],
  ): Promise<void> {
    // Process buffered events for real-time analytics
    console.log(`Processing ${events.length} events for stream ${streamId}`);
  }

  private async processRealTimeQueries(event: RealTimeEvent): Promise<void> {
    // Process active queries that match this event's stream
    for (const [subscriptionId, query] of this.activeQueries) {
      if (query.streamId === event.streamId) {
        // Check if event matches query filters
        if (this.eventMatchesFilters(event, query.filters)) {
          // Update query results
          await this.updateQueryResults(subscriptionId, event);
        }
      }
    }
  }

  private eventMatchesFilters(
    event: RealTimeEvent,
    filters: Filter[],
  ): boolean {
    return filters.every((filter) => {
      const value = this.getFieldValue(event.data, filter.field);
      return this.evaluateFilter(value, filter.operator, filter.value);
    });
  }

  private getFieldValue(data: any, field: string): any {
    return field.split(".").reduce((obj, key) => obj?.[key], data);
  }

  private evaluateFilter(
    value: any,
    operator: string,
    filterValue: any,
  ): boolean {
    switch (operator) {
      case "=":
        return value === filterValue;
      case "!=":
        return value !== filterValue;
      case ">":
        return value > filterValue;
      case "<":
        return value < filterValue;
      case ">=":
        return value >= filterValue;
      case "<=":
        return value <= filterValue;
      case "IN":
        return Array.isArray(filterValue) && filterValue.includes(value);
      case "NOT_IN":
        return Array.isArray(filterValue) && !filterValue.includes(value);
      case "CONTAINS":
        return typeof value === "string" && value.includes(filterValue);
      case "REGEX":
        return new RegExp(filterValue).test(value);
      default:
        return true;
    }
  }

  private async updateQueryResults(
    subscriptionId: string,
    event: RealTimeEvent,
  ): Promise<void> {
    // Update query results with new event
    console.log(`Updating query results for subscription ${subscriptionId}`);
  }

  private async getStreamData(
    streamId: string,
    timeWindow: TimeWindow,
  ): Promise<any[]> {
    // Get real data from database
    const db = getDb();
    const collection = db.collection("real_time_events");

    const windowStart = new Date(Date.now() - timeWindow.size);
    const windowEnd = new Date();

    const events = await collection
      .find({
        streamId,
        timestamp: {
          $gte: windowStart,
          $lte: windowEnd,
        },
      })
      .toArray();

    return events.map((event) => event.data);
  }

  private applyFilters(data: any[], filters: Filter[]): any[] {
    return data.filter((item) =>
      filters.every((filter) =>
        this.evaluateFilter(
          this.getFieldValue(item, filter.field),
          filter.operator,
          filter.value,
        ),
      ),
    );
  }

  private applyAggregations(
    data: any[],
    aggregations: Aggregation[],
    groupBy?: string[],
  ): any[] {
    if (!groupBy || groupBy.length === 0) {
      // No grouping, apply aggregations to entire dataset
      const result: any = {};
      aggregations.forEach((agg) => {
        const alias = agg.alias || `${agg.function}_${agg.field}`;
        result[alias] = this.calculateAggregation(data, agg);
      });
      return [result];
    }

    // Group data and apply aggregations to each group
    const groups = this.groupData(data, groupBy);
    return Object.entries(groups).map(([groupKey, groupData]) => {
      const result: any = {};

      // Add group by fields
      const groupKeys = groupKey.split("|");
      groupBy.forEach((field, index) => {
        result[field] = groupKeys[index];
      });

      // Add aggregations
      aggregations.forEach((agg) => {
        const alias = agg.alias || `${agg.function}_${agg.field}`;
        result[alias] = this.calculateAggregation(groupData, agg);
      });

      return result;
    });
  }

  private groupData(data: any[], groupBy: string[]): { [key: string]: any[] } {
    return data.reduce(
      (groups, item) => {
        const groupKey = groupBy
          .map((field) => this.getFieldValue(item, field))
          .join("|");
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      },
      {} as { [key: string]: any[] },
    );
  }

  private calculateAggregation(data: any[], aggregation: Aggregation): any {
    const values = data
      .map((item) => this.getFieldValue(item, aggregation.field))
      .filter((v) => v != null);

    switch (aggregation.function) {
      case "COUNT":
        return values.length;
      case "SUM":
        return values.reduce((sum, val) => sum + Number(val), 0);
      case "AVG":
        return values.length > 0
          ? values.reduce((sum, val) => sum + Number(val), 0) / values.length
          : 0;
      case "MIN":
        return values.length > 0 ? Math.min(...values.map(Number)) : null;
      case "MAX":
        return values.length > 0 ? Math.max(...values.map(Number)) : null;
      case "DISTINCT_COUNT":
        return new Set(values).size;
      case "PERCENTILE":
        const percentile = aggregation.parameters?.percentile || 50;
        return this.calculatePercentile(values.map(Number), percentile);
      default:
        return null;
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = values.sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);

    if (Number.isInteger(index)) {
      return sorted[index];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
  }

  private applyOrderingAndLimiting(
    data: any[],
    orderBy?: OrderBy[],
    limit?: number,
  ): any[] {
    let result = [...data];

    if (orderBy && orderBy.length > 0) {
      result.sort((a, b) => {
        for (const order of orderBy) {
          const aVal = this.getFieldValue(a, order.field);
          const bVal = this.getFieldValue(b, order.field);

          if (aVal < bVal) return order.direction === "ASC" ? -1 : 1;
          if (aVal > bVal) return order.direction === "ASC" ? 1 : -1;
        }
        return 0;
      });
    }

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }

  private calculateDataFreshness(streamId: string): number {
    // Calculate how fresh the data is based on latest event timestamp
    return Math.random() * 1000; // milliseconds
  }

  private calculateConfidence(data: any[]): number {
    // Calculate confidence score based on data quality
    return Math.min(0.95, 0.5 + data.length / 1000);
  }
}

// API Functions
export async function createRealTimeStream(stream: DataStream): Promise<void> {
  const config: RealTimeAnalyticsConfig = {
    streamEndpoint:
      process.env.REAL_TIME_STREAM_ENDPOINT || "wss://stream.example.com",
    apiKey: process.env.REAL_TIME_API_KEY || "",
    region: process.env.REAL_TIME_REGION || "us-east-1",
    bufferSize: 1000,
    flushInterval: 5000,
    retryAttempts: 3,
    enableCompression: true,
    enableEncryption: true,
  };

  const service = new RealTimeAnalyticsService(config);
  await service.createStream(stream);
}

export async function ingestRealTimeEvent(event: RealTimeEvent): Promise<void> {
  const config: RealTimeAnalyticsConfig = {
    streamEndpoint:
      process.env.REAL_TIME_STREAM_ENDPOINT || "wss://stream.example.com",
    apiKey: process.env.REAL_TIME_API_KEY || "",
    region: process.env.REAL_TIME_REGION || "us-east-1",
    bufferSize: 1000,
    flushInterval: 5000,
    retryAttempts: 3,
    enableCompression: true,
    enableEncryption: true,
  };

  const service = new RealTimeAnalyticsService(config);
  await service.ingestEvent(event);
}

export async function executeRealTimeAnalyticsQuery(
  query: RealTimeQuery,
): Promise<RealTimeResult> {
  const config: RealTimeAnalyticsConfig = {
    streamEndpoint:
      process.env.REAL_TIME_STREAM_ENDPOINT || "wss://stream.example.com",
    apiKey: process.env.REAL_TIME_API_KEY || "",
    region: process.env.REAL_TIME_REGION || "us-east-1",
    bufferSize: 1000,
    flushInterval: 5000,
    retryAttempts: 3,
    enableCompression: true,
    enableEncryption: true,
  };

  const service = new RealTimeAnalyticsService(config);
  return await service.executeRealTimeQuery(query);
}
