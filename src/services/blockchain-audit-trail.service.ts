/**
 * Blockchain-Based Audit Trail Service
 * Implements immutable audit trail with blockchain technology
 * Part of Phase 2: DOH Compliance Automation - Regulatory Reporting
 */

import { EventEmitter } from "eventemitter3";
import crypto from "crypto";

// Blockchain Types
export interface BlockchainAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  previousHash: string;
  hash: string;
  blockNumber: number;
  merkleRoot: string;
  signature: string;
  verified: boolean;
}

export interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  hash: string;
  entries: BlockchainAuditEntry[];
  miner: string;
  gasUsed: number;
  blockSize: number;
  transactionCount: number;
  signature: string;
  verified: boolean;
}

export interface AuditChain {
  chainId: string;
  name: string;
  description: string;
  createdAt: string;
  genesisBlock: AuditBlock;
  currentBlock: number;
  totalBlocks: number;
  totalEntries: number;
  chainHash: string;
  isValid: boolean;
  consensus: "proof_of_work" | "proof_of_stake" | "proof_of_authority";
  validators: string[];
  networkId: string;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  blockNumber?: number;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditAnalytics {
  totalEntries: number;
  totalBlocks: number;
  chainIntegrity: number;
  verificationRate: number;
  
  activityMetrics: {
    entriesPerDay: Array<{ date: string; count: number }>;
    actionDistribution: Record<string, number>;
    userActivityDistribution: Record<string, number>;
    resourceTypeDistribution: Record<string, number>;
  };
  
  securityMetrics: {
    hashVerificationRate: number;
    signatureVerificationRate: number;
    tamperAttempts: number;
    suspiciousActivities: number;
  };
  
  performanceMetrics: {
    averageBlockTime: number;
    averageBlockSize: number;
    transactionThroughput: number;
    storageEfficiency: number;
  };
  
  complianceMetrics: {
    dohComplianceRate: number;
    jawdaComplianceRate: number;
    auditTrailCompleteness: number;
    retentionCompliance: number;
  };
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
  reportType: "compliance" | "security" | "activity" | "integrity";
  period: {
    from: string;
    to: string;
  };
  
  summary: {
    totalEntries: number;
    totalBlocks: number;
    integrityScore: number;
    complianceScore: number;
  };
  
  findings: {
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    evidence: string[];
    recommendations: string[];
  }[];
  
  chainAnalysis: {
    chainIntegrity: boolean;
    brokenChains: number;
    invalidBlocks: number;
    tamperEvidence: string[];
  };
  
  complianceAnalysis: {
    dohCompliance: boolean;
    jawdaCompliance: boolean;
    missingEntries: string[];
    retentionViolations: string[];
  };
  
  attachments: {
    name: string;
    type: string;
    data: string; // base64 encoded
  }[];
}

export interface SmartContract {
  id: string;
  name: string;
  description: string;
  code: string;
  abi: string;
  bytecode: string;
  deployedAt: string;
  deployedBy: string;
  address: string;
  version: string;
  isActive: boolean;
  
  functions: {
    name: string;
    inputs: { name: string; type: string }[];
    outputs: { name: string; type: string }[];
    stateMutability: "pure" | "view" | "nonpayable" | "payable";
  }[];
  
  events: {
    name: string;
    inputs: { name: string; type: string; indexed: boolean }[];
  }[];
}

class BlockchainAuditTrailService extends EventEmitter {
  private auditChain: AuditChain | null = null;
  private blocks: Map<number, AuditBlock> = new Map();
  private pendingEntries: BlockchainAuditEntry[] = [];
  private smartContracts: Map<string, SmartContract> = new Map();
  private isInitialized = false;
  private miningInterval: NodeJS.Timeout | null = null;
  private validationInterval: NodeJS.Timeout | null = null;

  // Blockchain configuration
  private readonly BLOCK_SIZE_LIMIT = 100; // entries per block
  private readonly MINING_DIFFICULTY = 4;
  private readonly BLOCK_TIME_TARGET = 60000; // 1 minute
  private readonly CHAIN_ID = "reyada-audit-chain";
  private readonly NETWORK_ID = "homecare-network";

  constructor() {
    super();
    this.initializeBlockchain();
  }

  private async initializeBlockchain(): Promise<void> {
    try {
      console.log("⛓️ Initializing Blockchain Audit Trail Service...");

      // Initialize or load existing blockchain
      await this.loadOrCreateBlockchain();

      // Deploy smart contracts
      await this.deploySmartContracts();

      // Start mining process
      this.startMining();

      // Start validation process
      this.startValidation();

      // Load existing blocks
      await this.loadBlocks();

      this.isInitialized = true;
      this.emit("blockchain:initialized");

      console.log("✅ Blockchain Audit Trail Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Blockchain Audit Trail Service:", error);
      throw error;
    }
  }

  /**
   * Record audit entry in blockchain
   */
  async recordAuditEntry(
    userId: string,
    userRole: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>,
    metadata: {
      ipAddress: string;
      userAgent: string;
      sessionId: string;
    }
  ): Promise<BlockchainAuditEntry> {
    try {
      const entryId = this.generateEntryId();
      const timestamp = new Date().toISOString();
      const previousHash = this.getLastBlockHash();

      const entry: BlockchainAuditEntry = {
        id: entryId,
        timestamp,
        userId,
        userRole,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        sessionId: metadata.sessionId,
        previousHash,
        hash: "",
        blockNumber: 0, // Will be set when added to block
        merkleRoot: "",
        signature: "",
        verified: false,
      };

      // Calculate entry hash
      entry.hash = this.calculateEntryHash(entry);

      // Sign entry
      entry.signature = this.signEntry(entry);

      // Add to pending entries
      this.pendingEntries.push(entry);

      // Emit event
      this.emit("audit:entry_recorded", entry);

      console.log(`📝 Audit entry recorded: ${action} on ${resourceType}:${resourceId} by ${userId}`);
      return entry;
    } catch (error) {
      console.error("❌ Failed to record audit entry:", error);
      throw error;
    }
  }

  /**
   * Query audit entries from blockchain
   */
  async queryAuditEntries(query: AuditQuery): Promise<{
    entries: BlockchainAuditEntry[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      let allEntries: BlockchainAuditEntry[] = [];

      // Collect entries from all blocks
      for (const block of this.blocks.values()) {
        allEntries.push(...block.entries);
      }

      // Apply filters
      let filteredEntries = allEntries;

      if (query.userId) {
        filteredEntries = filteredEntries.filter(entry => entry.userId === query.userId);
      }

      if (query.action) {
        filteredEntries = filteredEntries.filter(entry => entry.action === query.action);
      }

      if (query.resourceType) {
        filteredEntries = filteredEntries.filter(entry => entry.resourceType === query.resourceType);
      }

      if (query.resourceId) {
        filteredEntries = filteredEntries.filter(entry => entry.resourceId === query.resourceId);
      }

      if (query.dateFrom) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) >= new Date(query.dateFrom!)
        );
      }

      if (query.dateTo) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) <= new Date(query.dateTo!)
        );
      }

      if (query.verified !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.verified === query.verified);
      }

      // Sort by timestamp (newest first)
      filteredEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      const paginatedEntries = filteredEntries.slice(offset, offset + limit);

      return {
        entries: paginatedEntries,
        totalCount: filteredEntries.length,
        hasMore: offset + limit < filteredEntries.length,
      };
    } catch (error) {
      console.error("❌ Failed to query audit entries:", error);
      throw error;
    }
  }

  /**
   * Verify blockchain integrity
   */
  async verifyBlockchainIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    integrityScore: number;
  }> {
    try {
      const issues: string[] = [];
      let validBlocks = 0;

      // Verify each block
      for (const [blockNumber, block] of this.blocks.entries()) {
        const blockIssues = await this.verifyBlock(block);
        if (blockIssues.length === 0) {
          validBlocks++;
        } else {
          issues.push(...blockIssues.map(issue => `Block ${blockNumber}: ${issue}`));
        }
      }

      // Verify chain continuity
      const chainIssues = this.verifyChainContinuity();
      issues.push(...chainIssues);

      const integrityScore = this.blocks.size > 0 ? (validBlocks / this.blocks.size) * 100 : 100;
      const isValid = issues.length === 0;

      if (this.auditChain) {
        this.auditChain.isValid = isValid;
      }

      this.emit("blockchain:integrity_verified", { isValid, issues, integrityScore });

      return { isValid, issues, integrityScore };
    } catch (error) {
      console.error("❌ Failed to verify blockchain integrity:", error);
      throw error;
    }
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(
    reportType: AuditReport["reportType"],
    period: { from: string; to: string },
    generatedBy: string
  ): Promise<AuditReport> {
    try {
      const reportId = this.generateReportId();
      const now = new Date().toISOString();

      // Query entries for the period
      const queryResult = await this.queryAuditEntries({
        dateFrom: period.from,
        dateTo: period.to,
      });

      // Verify blockchain integrity
      const integrityResult = await this.verifyBlockchainIntegrity();

      // Generate analytics
      const analytics = await this.getAuditAnalytics();

      const report: AuditReport = {
        id: reportId,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Audit Report`,
        description: `Comprehensive audit report for ${reportType} analysis`,
        generatedAt: now,
        generatedBy,
        reportType,
        period,
        
        summary: {
          totalEntries: queryResult.totalCount,
          totalBlocks: this.blocks.size,
          integrityScore: integrityResult.integrityScore,
          complianceScore: analytics.complianceMetrics.dohComplianceRate,
        },
        
        findings: await this.generateFindings(reportType, queryResult.entries),
        
        chainAnalysis: {
          chainIntegrity: integrityResult.isValid,
          brokenChains: integrityResult.issues.filter(issue => issue.includes("chain")).length,
          invalidBlocks: integrityResult.issues.filter(issue => issue.includes("Block")).length,
          tamperEvidence: integrityResult.issues.filter(issue => issue.includes("tamper")),
        },
        
        complianceAnalysis: {
          dohCompliance: analytics.complianceMetrics.dohComplianceRate >= 95,
          jawdaCompliance: analytics.complianceMetrics.jawdaComplianceRate >= 95,
          missingEntries: await this.identifyMissingEntries(queryResult.entries),
          retentionViolations: await this.identifyRetentionViolations(queryResult.entries),
        },
        
        attachments: await this.generateReportAttachments(reportType, queryResult.entries),
      };

      this.emit("audit:report_generated", report);

      console.log(`📊 Audit report generated: ${reportId} (${reportType})`);
      return report;
    } catch (error) {
      console.error("❌ Failed to generate audit report:", error);
      throw error;
    }
  }

  /**
   * Get audit analytics
   */
  async getAuditAnalytics(): Promise<AuditAnalytics> {
    try {
      const allEntries: BlockchainAuditEntry[] = [];
      for (const block of this.blocks.values()) {
        allEntries.push(...block.entries);
      }

      const analytics: AuditAnalytics = {
        totalEntries: allEntries.length,
        totalBlocks: this.blocks.size,
        chainIntegrity: (await this.verifyBlockchainIntegrity()).integrityScore,
        verificationRate: this.calculateVerificationRate(allEntries),
        
        activityMetrics: {
          entriesPerDay: this.calculateEntriesPerDay(allEntries),
          actionDistribution: this.calculateActionDistribution(allEntries),
          userActivityDistribution: this.calculateUserActivityDistribution(allEntries),
          resourceTypeDistribution: this.calculateResourceTypeDistribution(allEntries),
        },
        
        securityMetrics: {
          hashVerificationRate: this.calculateHashVerificationRate(allEntries),
          signatureVerificationRate: this.calculateSignatureVerificationRate(allEntries),
          tamperAttempts: this.detectTamperAttempts(allEntries),
          suspiciousActivities: this.detectSuspiciousActivities(allEntries),
        },
        
        performanceMetrics: {
          averageBlockTime: this.calculateAverageBlockTime(),
          averageBlockSize: this.calculateAverageBlockSize(),
          transactionThroughput: this.calculateTransactionThroughput(),
          storageEfficiency: this.calculateStorageEfficiency(),
        },
        
        complianceMetrics: {
          dohComplianceRate: this.calculateDOHComplianceRate(allEntries),
          jawdaComplianceRate: this.calculateJAWDAComplianceRate(allEntries),
          auditTrailCompleteness: this.calculateAuditTrailCompleteness(allEntries),
          retentionCompliance: this.calculateRetentionCompliance(allEntries),
        },
      };

      return analytics;
    } catch (error) {
      console.error("❌ Failed to get audit analytics:", error);
      throw error;
    }
  }

  // Private helper methods
  private async loadOrCreateBlockchain(): Promise<void> {
    // Try to load existing blockchain
    const existingChain = await this.loadExistingChain();
    
    if (existingChain) {
      this.auditChain = existingChain;
      console.log(`📚 Loaded existing blockchain: ${existingChain.name}`);
    } else {
      // Create new blockchain
      this.auditChain = await this.createGenesisChain();
      console.log(`🆕 Created new blockchain: ${this.auditChain.name}`);
    }
  }

  private async loadExistingChain(): Promise<AuditChain | null> {
    // In production, load from persistent storage
    return null;
  }

  private async createGenesisChain(): Promise<AuditChain> {
    const genesisBlock = await this.createGenesisBlock();
    
    const chain: AuditChain = {
      chainId: this.CHAIN_ID,
      name: "Reyada Healthcare Audit Chain",
      description: "Immutable audit trail for healthcare compliance",
      createdAt: new Date().toISOString(),
      genesisBlock,
      currentBlock: 0,
      totalBlocks: 1,
      totalEntries: 0,
      chainHash: genesisBlock.hash,
      isValid: true,
      consensus: "proof_of_authority",
      validators: ["system"],
      networkId: this.NETWORK_ID,
    };

    this.blocks.set(0, genesisBlock);
    return chain;
  }

  private async createGenesisBlock(): Promise<AuditBlock> {
    const timestamp = new Date().toISOString();
    const genesisEntry: BlockchainAuditEntry = {
      id: "genesis-entry",
      timestamp,
      userId: "system",
      userRole: "system",
      action: "blockchain_initialized",
      resourceType: "blockchain",
      resourceId: this.CHAIN_ID,
      details: { message: "Genesis block created" },
      ipAddress: "127.0.0.1",
      userAgent: "system",
      sessionId: "genesis",
      previousHash: "0",
      hash: "",
      blockNumber: 0,
      merkleRoot: "",
      signature: "",
      verified: true,
    };

    genesisEntry.hash = this.calculateEntryHash(genesisEntry);
    genesisEntry.signature = this.signEntry(genesisEntry);

    const block: AuditBlock = {
      blockNumber: 0,
      timestamp,
      previousHash: "0",
      merkleRoot: this.calculateMerkleRoot([genesisEntry]),
      nonce: 0,
      difficulty: 0,
      hash: "",
      entries: [genesisEntry],
      miner: "system",
      gasUsed: 0,
      blockSize: 1,
      transactionCount: 1,
      signature: "",
      verified: true,
    };

    block.hash = this.calculateBlockHash(block);
    block.signature = this.signBlock(block);

    return block;
  }

  private async deploySmartContracts(): Promise<void> {
    console.log("📜 Deploying smart contracts...");

    // Audit Entry Contract
    const auditContract: SmartContract = {
      id: "audit-entry-contract",
      name: "AuditEntryContract",
      description: "Smart contract for audit entry validation and storage",
      code: this.getAuditContractCode(),
      abi: this.getAuditContractABI(),
      bytecode: "0x608060405234801561001057600080fd5b50...", // Placeholder
      deployedAt: new Date().toISOString(),
      deployedBy: "system",
      address: "0x" + crypto.randomBytes(20).toString("hex"),
      version: "1.0.0",
      isActive: true,
      functions: [
        {
          name: "recordEntry",
          inputs: [
            { name: "userId", type: "string" },
            { name: "action", type: "string" },
            { name: "resourceId", type: "string" },
          ],
          outputs: [{ name: "success", type: "bool" }],
          stateMutability: "nonpayable",
        },
        {
          name: "verifyEntry",
          inputs: [{ name: "entryId", type: "string" }],
          outputs: [{ name: "isValid", type: "bool" }],
          stateMutability: "view",
        },
      ],
      events: [
        {
          name: "EntryRecorded",
          inputs: [
            { name: "entryId", type: "string", indexed: true },
            { name: "userId", type: "string", indexed: true },
            { name: "timestamp", type: "uint256", indexed: false },
          ],
        },
      ],
    };

    this.smartContracts.set(auditContract.id, auditContract);
    console.log(`✅ Deployed smart contract: ${auditContract.name}`);
  }

  private startMining(): void {
    this.miningInterval = setInterval(() => {
      this.mineBlock();
    }, this.BLOCK_TIME_TARGET);

    console.log("⛏️ Mining process started");
  }

  private startValidation(): void {
    this.validationInterval = setInterval(() => {
      this.validateChain();
    }, 300000); // Validate every 5 minutes

    console.log("✅ Validation process started");
  }

  private async loadBlocks(): Promise<void> {
    console.log("📦 Loading existing blocks...");
    // In production, load blocks from persistent storage
  }

  private async mineBlock(): Promise<void> {
    if (this.pendingEntries.length === 0) return;

    try {
      const blockNumber = this.auditChain!.currentBlock + 1;
      const timestamp = new Date().toISOString();
      const previousHash = this.getLastBlockHash();
      
      // Take entries for this block
      const blockEntries = this.pendingEntries.splice(0, this.BLOCK_SIZE_LIMIT);
      
      // Update entry block numbers
      blockEntries.forEach(entry => {
        entry.blockNumber = blockNumber;
        entry.verified = true;
      });

      const merkleRoot = this.calculateMerkleRoot(blockEntries);

      const block: AuditBlock = {
        blockNumber,
        timestamp,
        previousHash,
        merkleRoot,
        nonce: 0,
        difficulty: this.MINING_DIFFICULTY,
        hash: "",
        entries: blockEntries,
        miner: "system",
        gasUsed: blockEntries.length * 100, // Simplified gas calculation
        blockSize: blockEntries.length,
        transactionCount: blockEntries.length,
        signature: "",
        verified: false,
      };

      // Mine the block (find valid hash)
      await this.performProofOfWork(block);

      // Sign the block
      block.signature = this.signBlock(block);
      block.verified = true;

      // Add to blockchain
      this.blocks.set(blockNumber, block);
      
      // Update chain
      this.auditChain!.currentBlock = blockNumber;
      this.auditChain!.totalBlocks++;
      this.auditChain!.totalEntries += blockEntries.length;
      this.auditChain!.chainHash = block.hash;

      this.emit("blockchain:block_mined", block);

      console.log(`⛏️ Block mined: #${blockNumber} with ${blockEntries.length} entries`);
    } catch (error) {
      console.error("❌ Failed to mine block:", error);
    }
  }

  private async performProofOfWork(block: AuditBlock): Promise<void> {
    const target = "0".repeat(block.difficulty);
    
    while (true) {
      block.hash = this.calculateBlockHash(block);
      
      if (block.hash.startsWith(target)) {
        break;
      }
      
      block.nonce++;
      
      // Prevent infinite loop in demo
      if (block.nonce > 100000) {
        break;
      }
    }
  }

  private async validateChain(): Promise<void> {
    const integrityResult = await this.verifyBlockchainIntegrity();
    
    if (!integrityResult.isValid) {
      this.emit("blockchain:integrity_violation", integrityResult);
      console.warn("⚠️ Blockchain integrity violation detected:", integrityResult.issues);
    }
  }

  private async verifyBlock(block: AuditBlock): Promise<string[]> {
    const issues: string[] = [];

    // Verify block hash
    const calculatedHash = this.calculateBlockHash({ ...block, hash: "" });
    if (calculatedHash !== block.hash) {
      issues.push("Invalid block hash");
    }

    // Verify merkle root
    const calculatedMerkleRoot = this.calculateMerkleRoot(block.entries);
    if (calculatedMerkleRoot !== block.merkleRoot) {
      issues.push("Invalid merkle root");
    }

    // Verify each entry
    for (const entry of block.entries) {
      const entryIssues = await this.verifyEntry(entry);
      issues.push(...entryIssues);
    }

    return issues;
  }

  private async verifyEntry(entry: BlockchainAuditEntry): Promise<string[]> {
    const issues: string[] = [];

    // Verify entry hash
    const calculatedHash = this.calculateEntryHash({ ...entry, hash: "" });
    if (calculatedHash !== entry.hash) {
      issues.push(`Invalid entry hash: ${entry.id}`);
    }

    // Verify signature
    if (!this.verifyEntrySignature(entry)) {
      issues.push(`Invalid entry signature: ${entry.id}`);
    }

    return issues;
  }

  private verifyChainContinuity(): string[] {
    const issues: string[] = [];
    const sortedBlocks = Array.from(this.blocks.values()).sort((a, b) => a.blockNumber - b.blockNumber);

    for (let i = 1; i < sortedBlocks.length; i++) {
      const currentBlock = sortedBlocks[i];
      const previousBlock = sortedBlocks[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        issues.push(`Chain continuity broken between blocks ${previousBlock.blockNumber} and ${currentBlock.blockNumber}`);
      }
    }

    return issues;
  }

  // Cryptographic functions
  private calculateEntryHash(entry: Partial<BlockchainAuditEntry>): string {
    const data = `${entry.timestamp}${entry.userId}${entry.action}${entry.resourceType}${entry.resourceId}${JSON.stringify(entry.details)}${entry.previousHash}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private calculateBlockHash(block: Partial<AuditBlock>): string {
    const data = `${block.blockNumber}${block.timestamp}${block.previousHash}${block.merkleRoot}${block.nonce}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private calculateMerkleRoot(entries: BlockchainAuditEntry[]): string {
    if (entries.length === 0) return "";
    if (entries.length === 1) return entries[0].hash;

    const hashes = entries.map(entry => entry.hash);
    
    while (hashes.length > 1) {
      const newHashes: string[] = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = crypto.createHash("sha256").update(left + right).digest("hex");
        newHashes.push(combined);
      }
      
      hashes.splice(0, hashes.length, ...newHashes);
    }

    return hashes[0];
  }

  private signEntry(entry: BlockchainAuditEntry): string {
    // In production, use proper digital signatures
    const data = `${entry.hash}${entry.timestamp}${entry.userId}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private signBlock(block: AuditBlock): string {
    // In production, use proper digital signatures
    const data = `${block.hash}${block.timestamp}${block.miner}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private verifyEntrySignature(entry: BlockchainAuditEntry): boolean {
    const expectedSignature = this.signEntry(entry);
    return expectedSignature === entry.signature;
  }

  private getLastBlockHash(): string {
    if (this.blocks.size === 0) return "0";
    const lastBlockNumber = Math.max(...this.blocks.keys());
    return this.blocks.get(lastBlockNumber)?.hash || "0";
  }

  // Analytics calculation methods
  private calculateVerificationRate(entries: BlockchainAuditEntry[]): number {
    if (entries.length === 0) return 100;
    const verifiedEntries = entries.filter(entry => entry.verified).length;
    return (verifiedEntries / entries.length) * 100;
  }

  private calculateEntriesPerDay(entries: BlockchainAuditEntry[]): Array<{ date: string; count: number }> {
    const dailyCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = entry.timestamp.split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  }

  private calculateActionDistribution(entries: BlockchainAuditEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    entries.forEach(entry => {
      distribution[entry.action] = (distribution[entry.action] || 0) + 1;
    });

    return distribution;
  }

  private calculateUserActivityDistribution(entries: BlockchainAuditEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    entries.forEach(entry => {
      distribution[entry.userId] = (distribution[entry.userId] || 0) + 1;
    });

    return distribution;
  }

  private calculateResourceTypeDistribution(entries: BlockchainAuditEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    entries.forEach(entry => {
      distribution[entry.resourceType] = (distribution[entry.resourceType] || 0) + 1;
    });

    return distribution;
  }

  private calculateHashVerificationRate(entries: BlockchainAuditEntry[]): number {
    if (entries.length === 0) return 100;
    
    let validHashes = 0;
    entries.forEach(entry => {
      const calculatedHash = this.calculateEntryHash({ ...entry, hash: "" });
      if (calculatedHash === entry.hash) {
        validHashes++;
      }
    });

    return (validHashes / entries.length) * 100;
  }

  private calculateSignatureVerificationRate(entries: BlockchainAuditEntry[]): number {
    if (entries.length === 0) return 100;
    
    const validSignatures = entries.filter(entry => this.verifyEntrySignature(entry)).length;
    return (validSignatures / entries.length) * 100;
  }

  private detectTamperAttempts(entries: BlockchainAuditEntry[]): number {
    // Detect potential tampering attempts
    return entries.filter(entry => !entry.verified || entry.hash === "").length;
  }

  private detectSuspiciousActivities(entries: BlockchainAuditEntry[]): number {
    // Detect suspicious patterns
    const suspiciousActions = ["unauthorized_access", "data_modification", "system_breach"];
    return entries.filter(entry => suspiciousActions.includes(entry.action)).length;
  }

  private calculateAverageBlockTime(): number {
    if (this.blocks.size <= 1) return 0;
    
    const sortedBlocks = Array.from(this.blocks.values()).sort((a, b) => a.blockNumber - b.blockNumber);
    let totalTime = 0;
    
    for (let i = 1; i < sortedBlocks.length; i++) {
      const currentTime = new Date(sortedBlocks[i].timestamp).getTime();
      const previousTime = new Date(sortedBlocks[i - 1].timestamp).getTime();
      totalTime += currentTime - previousTime;
    }

    return totalTime / (sortedBlocks.length - 1);
  }

  private calculateAverageBlockSize(): number {
    if (this.blocks.size === 0) return 0;
    
    const totalEntries = Array.from(this.blocks.values()).reduce((sum, block) => sum + block.blockSize, 0);
    return totalEntries / this.blocks.size;
  }

  private calculateTransactionThroughput(): number {
    // Transactions per second
    const totalEntries = Array.from(this.blocks.values()).reduce((sum, block) => sum + block.transactionCount, 0);
    const timeSpan = this.calculateAverageBlockTime() * this.blocks.size / 1000; // Convert to seconds
    
    return timeSpan > 0 ? totalEntries / timeSpan : 0;
  }

  private calculateStorageEfficiency(): number {
    // Placeholder calculation
    return 85.7;
  }

  private calculateDOHComplianceRate(entries: BlockchainAuditEntry[]): number {
    // Calculate DOH compliance based on required audit entries
    const requiredActions = ["patient_access", "data_modification", "clinical_decision", "medication_administration"];
    const complianceEntries = entries.filter(entry => requiredActions.includes(entry.action));
    
    return entries.length > 0 ? (complianceEntries.length / entries.length) * 100 : 100;
  }

  private calculateJAWDAComplianceRate(entries: BlockchainAuditEntry[]): number {
    // Calculate JAWDA compliance based on quality-related audit entries
    const qualityActions = ["quality_assessment", "safety_incident", "care_coordination", "outcome_measurement"];
    const qualityEntries = entries.filter(entry => qualityActions.includes(entry.action));
    
    return entries.length > 0 ? (qualityEntries.length / entries.length) * 100 : 100;
  }

  private calculateAuditTrailCompleteness(entries: BlockchainAuditEntry[]): number {
    // Check for gaps in audit trail
    const sortedEntries = entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (sortedEntries.length <= 1) return 100;
    
    let gaps = 0;
    const expectedInterval = 3600000; // 1 hour in milliseconds
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const timeDiff = new Date(sortedEntries[i].timestamp).getTime() - new Date(sortedEntries[i - 1].timestamp).getTime();
      if (timeDiff > expectedInterval * 2) { // More than 2 hours gap
        gaps++;
      }
    }

    return Math.max(0, 100 - (gaps / sortedEntries.length) * 100);
  }

  private calculateRetentionCompliance(entries: BlockchainAuditEntry[]): number {
    // Check retention policy compliance (7 years for healthcare)
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds
    const cutoffDate = new Date(Date.now() - retentionPeriod);
    
    const retainedEntries = entries.filter(entry => new Date(entry.timestamp) > cutoffDate);
    
    return entries.length > 0 ? (retainedEntries.length / entries.length) * 100 : 100;
  }

  private async generateFindings(reportType: AuditReport["reportType"], entries: BlockchainAuditEntry[]): Promise<AuditReport["findings"]> {
    const findings: AuditReport["findings"] = [];

    // Security findings
    if (reportType === "security" || reportType === "compliance") {
      const suspiciousCount = this.detectSuspiciousActivities(entries);
      if (suspiciousCount > 0) {
        findings.push({
          category: "Security",
          severity: suspiciousCount > 10 ? "high" : "medium",
          description: `${suspiciousCount} suspicious activities detected`,
          evidence: [`${suspiciousCount} entries with suspicious actions`],
          recommendations: ["Investigate suspicious activities", "Strengthen access controls"],
        });
      }
    }

    // Integrity findings
    const integrityResult = await this.verifyBlockchainIntegrity();
    if (!integrityResult.isValid) {
      findings.push({
        category: "Integrity",
        severity: "critical",
        description: "Blockchain integrity violations detected",
        evidence: integrityResult.issues,
        recommendations: ["Investigate integrity violations", "Restore from backup if necessary"],
      });
    }

    return findings;
  }

  private async identifyMissingEntries(entries: BlockchainAuditEntry[]): Promise<string[]> {
    // Identify missing required audit entries
    const requiredActions = ["user_login", "data_access", "system_configuration"];
    const missingActions: string[] = [];

    requiredActions.forEach(action => {
      const hasAction = entries.some(entry => entry.action === action);
      if (!hasAction) {
        missingActions.push(action);
      }
    });

    return missingActions;
  }

  private async identifyRetentionViolations(entries: BlockchainAuditEntry[]): Promise<string[]> {
    // Identify retention policy violations
    const violations: string[] = [];
    
    // Check for entries that should have been archived
    const archiveDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
    const oldEntries = entries.filter(entry => new Date(entry.timestamp) < archiveDate);
    
    if (oldEntries.length > 0) {
      violations.push(`${oldEntries.length} entries exceed active retention period`);
    }

    return violations;
  }

  private async generateReportAttachments(reportType: AuditReport["reportType"], entries: BlockchainAuditEntry[]): Promise<AuditReport["attachments"]> {
    const attachments: AuditReport["attachments"] = [];

    // Generate blockchain export
    const blockchainData = {
      chain: this.auditChain,
      blocks: Array.from(this.blocks.values()),
      entries: entries.slice(0, 1000), // Limit for attachment size
    };

    attachments.push({
      name: "blockchain_export.json",
      type: "application/json",
      data: Buffer.from(JSON.stringify(blockchainData, null, 2)).toString("base64"),
    });

    return attachments;
  }

  // Smart contract code (simplified)
  private getAuditContractCode(): string {
    return `
      pragma solidity ^0.8.0;
      
      contract AuditEntryContract {
          struct AuditEntry {
              string id;
              string userId;
              string action;
              string resourceId;
              uint256 timestamp;
              bool verified;
          }
          
          mapping(string => AuditEntry) public entries;
          
          event EntryRecorded(string indexed entryId, string indexed userId, uint256 timestamp);
          
          function recordEntry(string memory entryId, string memory userId, string memory action, string memory resourceId) public returns (bool) {
              entries[entryId] = AuditEntry(entryId, userId, action, resourceId, block.timestamp, true);
              emit EntryRecorded(entryId, userId, block.timestamp);
              return true;
          }
          
          function verifyEntry(string memory entryId) public view returns (bool) {
              return entries[entryId].verified;
          }
      }
    `;
  }

  private getAuditContractABI(): string {
    return JSON.stringify([
      {
        "inputs": [
          {"name": "entryId", "type": "string"},
          {"name": "userId", "type": "string"},
          {"name": "action", "type": "string"},
          {"name": "resourceId", "type": "string"}
        ],
        "name": "recordEntry",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"name": "entryId", "type": "string"}],
        "name": "verifyEntry",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]);
  }

  // Utility methods
  private generateEntryId(): string {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
      }

      if (this.validationInterval) {
        clearInterval(this.validationInterval);
        this.validationInterval = null;
      }

      this.removeAllListeners();
      console.log("⛓️ Blockchain Audit Trail Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during blockchain service shutdown:", error);
    }
  }
}

export const blockchainAuditTrailService = new BlockchainAuditTrailService();
export default blockchainAuditTrailService;