/**
 * Image Optimization Pipeline Service
 * Implements automated image optimization and WebP conversion
 * Part of Phase 3: Performance Optimization - Additional Performance
 */

import { EventEmitter } from "eventemitter3";

// Image Optimization Types
export interface ImageOptimizationConfig {
  formats: ImageFormat[];
  quality: QualitySettings;
  sizes: ResponsiveSize[];
  compression: CompressionSettings;
  caching: CacheSettings;
  lazy: LazyLoadingSettings;
}

export interface ImageFormat {
  format: "webp" | "avif" | "jpeg" | "png" | "svg";
  quality: number;
  enabled: boolean;
  fallback?: string;
}

export interface QualitySettings {
  high: number; // 90-100
  medium: number; // 70-89
  low: number; // 50-69
  thumbnail: number; // 30-49
}

export interface ResponsiveSize {
  name: string;
  width: number;
  height?: number;
  density: number; // 1x, 2x, 3x
  breakpoint?: string;
}

export interface CompressionSettings {
  lossless: boolean;
  progressive: boolean;
  mozjpeg: boolean;
  pngquant: boolean;
  svgo: boolean;
}

export interface CacheSettings {
  enabled: boolean;
  maxAge: number; // seconds
  strategy: "cache-first" | "network-first" | "stale-while-revalidate";
  storage: "memory" | "disk" | "both";
}

export interface LazyLoadingSettings {
  enabled: boolean;
  threshold: number; // pixels
  placeholder: "blur" | "color" | "skeleton";
  fadeIn: boolean;
  preload: number; // number of images to preload
}

export interface OptimizedImage {
  id: string;
  originalUrl: string;
  optimizedUrls: {
    format: string;
    url: string;
    size: number;
    width: number;
    height: number;
    quality: number;
  }[];
  metadata: ImageMetadata;
  optimization: OptimizationResult;
  createdAt: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  colorSpace: string;
  hasAlpha: boolean;
  density: number;
  exif?: Record<string, any>;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  processingTime: number;
  formats: string[];
  savings: number; // bytes saved
}

export interface OptimizationJob {
  id: string;
  imageUrl: string;
  config: Partial<ImageOptimizationConfig>;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: OptimizedImage;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface OptimizationStats {
  totalImages: number;
  totalSavings: number;
  averageCompressionRatio: number;
  formatDistribution: Record<string, number>;
  processingTime: number;
  cacheHitRate: number;
}

class ImageOptimizationPipelineService extends EventEmitter {
  private config: ImageOptimizationConfig;
  private optimizedImages: Map<string, OptimizedImage> = new Map();
  private jobs: Map<string, OptimizationJob> = new Map();
  private cache: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    
    this.config = {
      formats: [
        { format: "webp", quality: 85, enabled: true, fallback: "jpeg" },
        { format: "avif", quality: 80, enabled: true, fallback: "webp" },
        { format: "jpeg", quality: 85, enabled: true },
        { format: "png", quality: 90, enabled: true },
      ],
      quality: {
        high: 95,
        medium: 85,
        low: 70,
        thumbnail: 60,
      },
      sizes: [
        { name: "thumbnail", width: 150, height: 150, density: 1 },
        { name: "small", width: 400, density: 1 },
        { name: "medium", width: 800, density: 1 },
        { name: "large", width: 1200, density: 1 },
        { name: "xlarge", width: 1920, density: 1 },
        // High DPI variants
        { name: "medium-2x", width: 1600, density: 2 },
        { name: "large-2x", width: 2400, density: 2 },
      ],
      compression: {
        lossless: false,
        progressive: true,
        mozjpeg: true,
        pngquant: true,
        svgo: true,
      },
      caching: {
        enabled: true,
        maxAge: 86400 * 30, // 30 days
        strategy: "cache-first",
        storage: "both",
      },
      lazy: {
        enabled: true,
        threshold: 100,
        placeholder: "blur",
        fadeIn: true,
        preload: 3,
      },
    };
    
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🖼️ Initializing Image Optimization Pipeline Service...");

      // Setup image processing workers
      await this.setupImageProcessingWorkers();

      // Initialize cache
      await this.initializeCache();

      // Setup lazy loading observer
      this.setupLazyLoadingObserver();

      this.isInitialized = true;
      this.emit("service:initialized");

      console.log("✅ Image Optimization Pipeline Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Image Optimization Pipeline Service:", error);
      throw error;
    }
  }

  /**
   * Optimize single image
   */
  async optimizeImage(
    imageUrl: string,
    customConfig?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImage> {
    try {
      const jobId = this.generateJobId();
      const config = { ...this.config, ...customConfig };

      // Check cache first
      const cacheKey = this.generateCacheKey(imageUrl, config);
      if (this.cache.has(cacheKey)) {
        console.log(`📦 Cache hit for image: ${imageUrl}`);
        return this.cache.get(cacheKey);
      }

      // Create optimization job
      const job: OptimizationJob = {
        id: jobId,
        imageUrl,
        config,
        status: "pending",
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      this.jobs.set(jobId, job);
      this.emit("job:created", job);

      // Process image
      const optimizedImage = await this.processImage(job);

      // Cache result
      if (config.caching.enabled) {
        this.cache.set(cacheKey, optimizedImage);
      }

      // Store result
      this.optimizedImages.set(optimizedImage.id, optimizedImage);

      this.emit("image:optimized", optimizedImage);
      return optimizedImage;
    } catch (error) {
      console.error(`❌ Failed to optimize image ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Batch optimize images
   */
  async optimizeImages(
    imageUrls: string[],
    customConfig?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];
    const concurrency = 3; // Process 3 images at a time

    for (let i = 0; i < imageUrls.length; i += concurrency) {
      const batch = imageUrls.slice(i, i + concurrency);
      const batchPromises = batch.map(url => this.optimizeImage(url, customConfig));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error("❌ Batch optimization failed:", error);
        // Continue with next batch
      }
    }

    this.emit("batch:completed", { total: imageUrls.length, successful: results.length });
    return results;
  }

  /**
   * Generate responsive image set
   */
  generateResponsiveImageSet(optimizedImage: OptimizedImage): {
    srcSet: string;
    sizes: string;
    src: string;
    placeholder?: string;
  } {
    const webpUrls = optimizedImage.optimizedUrls.filter(url => url.format === "webp");
    const fallbackUrls = optimizedImage.optimizedUrls.filter(url => url.format === "jpeg" || url.format === "png");

    // Generate srcSet
    const srcSet = webpUrls
      .map(url => `${url.url} ${url.width}w`)
      .join(", ");

    // Generate sizes attribute
    const sizes = this.config.sizes
      .filter(size => size.breakpoint)
      .map(size => `(max-width: ${size.breakpoint}) ${size.width}px`)
      .join(", ") + `, ${this.config.sizes[this.config.sizes.length - 1].width}px`;

    // Fallback src
    const src = fallbackUrls.length > 0 ? fallbackUrls[0].url : optimizedImage.originalUrl;

    // Generate placeholder
    const placeholder = this.generatePlaceholder(optimizedImage);

    return { srcSet, sizes, src, placeholder };
  }

  /**
   * Create optimized picture element
   */
  createPictureElement(optimizedImage: OptimizedImage): string {
    const webpUrls = optimizedImage.optimizedUrls.filter(url => url.format === "webp");
    const avifUrls = optimizedImage.optimizedUrls.filter(url => url.format === "avif");
    const fallbackUrls = optimizedImage.optimizedUrls.filter(url => url.format === "jpeg" || url.format === "png");

    let pictureHtml = "<picture>";

    // AVIF source
    if (avifUrls.length > 0) {
      const srcSet = avifUrls.map(url => `${url.url} ${url.width}w`).join(", ");
      pictureHtml += `<source srcset="${srcSet}" type="image/avif">`;
    }

    // WebP source
    if (webpUrls.length > 0) {
      const srcSet = webpUrls.map(url => `${url.url} ${url.width}w`).join(", ");
      pictureHtml += `<source srcset="${srcSet}" type="image/webp">`;
    }

    // Fallback img
    const fallbackSrc = fallbackUrls.length > 0 ? fallbackUrls[0].url : optimizedImage.originalUrl;
    const fallbackSrcSet = fallbackUrls.map(url => `${url.url} ${url.width}w`).join(", ");
    
    pictureHtml += `<img src="${fallbackSrc}" srcset="${fallbackSrcSet}" alt="" loading="lazy">`;
    pictureHtml += "</picture>";

    return pictureHtml;
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): OptimizationStats {
    const images = Array.from(this.optimizedImages.values());
    
    const totalSavings = images.reduce((sum, img) => sum + img.optimization.savings, 0);
    const averageCompressionRatio = images.length > 0
      ? images.reduce((sum, img) => sum + img.optimization.compressionRatio, 0) / images.length
      : 0;

    const formatDistribution: Record<string, number> = {};
    images.forEach(img => {
      img.optimizedUrls.forEach(url => {
        formatDistribution[url.format] = (formatDistribution[url.format] || 0) + 1;
      });
    });

    const totalProcessingTime = images.reduce((sum, img) => sum + img.optimization.processingTime, 0);
    const cacheHitRate = this.calculateCacheHitRate();

    return {
      totalImages: images.length,
      totalSavings,
      averageCompressionRatio,
      formatDistribution,
      processingTime: totalProcessingTime,
      cacheHitRate,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ImageOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit("config:updated", this.config);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit("cache:cleared");
  }

  // Private helper methods
  private async setupImageProcessingWorkers(): Promise<void> {
    // In a real implementation, this would setup Web Workers for image processing
    console.log("👷 Image processing workers initialized");
  }

  private async initializeCache(): Promise<void> {
    // Initialize cache storage
    if (this.config.caching.enabled) {
      console.log("📦 Image cache initialized");
    }
  }

  private setupLazyLoadingObserver(): void {
    if (typeof window === "undefined" || !this.config.lazy.enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: `${this.config.lazy.threshold}px`,
      }
    );

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  private async processImage(job: OptimizationJob): Promise<OptimizedImage> {
    const startTime = Date.now();
    
    // Update job status
    job.status = "processing";
    job.progress = 10;
    this.emit("job:progress", job);

    // Load original image
    const originalImage = await this.loadImageData(job.imageUrl);
    job.progress = 30;
    this.emit("job:progress", job);

    // Extract metadata
    const metadata = await this.extractImageMetadata(originalImage);
    job.progress = 40;
    this.emit("job:progress", job);

    // Generate optimized versions
    const optimizedUrls: OptimizedImage["optimizedUrls"] = [];
    
    for (const format of job.config.formats || this.config.formats) {
      if (!format.enabled) continue;

      for (const size of job.config.sizes || this.config.sizes) {
        const optimizedUrl = await this.generateOptimizedVersion(
          originalImage,
          format,
          size,
          job.config.quality || this.config.quality
        );
        
        optimizedUrls.push(optimizedUrl);
      }
    }

    job.progress = 90;
    this.emit("job:progress", job);

    // Calculate optimization results
    const originalSize = metadata.size;
    const optimizedSize = optimizedUrls.reduce((sum, url) => sum + url.size, 0);
    const savings = originalSize - optimizedSize;
    const compressionRatio = (savings / originalSize) * 100;
    const processingTime = Date.now() - startTime;

    const optimizedImage: OptimizedImage = {
      id: this.generateImageId(),
      originalUrl: job.imageUrl,
      optimizedUrls,
      metadata,
      optimization: {
        originalSize,
        optimizedSize,
        compressionRatio,
        processingTime,
        formats: [...new Set(optimizedUrls.map(url => url.format))],
        savings,
      },
      createdAt: new Date().toISOString(),
    };

    // Complete job
    job.status = "completed";
    job.progress = 100;
    job.result = optimizedImage;
    job.completedAt = new Date().toISOString();
    this.emit("job:completed", job);

    return optimizedImage;
  }

  private async loadImageData(imageUrl: string): Promise<any> {
    // Simulated image loading
    // In real implementation, this would load and decode the image
    return {
      url: imageUrl,
      data: new ArrayBuffer(1024 * 100), // 100KB simulated
    };
  }

  private async extractImageMetadata(imageData: any): Promise<ImageMetadata> {
    // Simulated metadata extraction
    // In real implementation, this would use libraries like sharp or canvas
    return {
      width: 1920,
      height: 1080,
      format: "jpeg",
      size: 1024 * 100, // 100KB
      colorSpace: "sRGB",
      hasAlpha: false,
      density: 72,
    };
  }

  private async generateOptimizedVersion(
    imageData: any,
    format: ImageFormat,
    size: ResponsiveSize,
    quality: QualitySettings
  ): Promise<OptimizedImage["optimizedUrls"][0]> {
    // Simulated image optimization
    // In real implementation, this would use image processing libraries
    
    const qualityValue = this.getQualityForSize(size.name, quality);
    const optimizedSize = Math.floor(imageData.data.byteLength * (qualityValue / 100) * 0.7);
    
    return {
      format: format.format,
      url: `${imageData.url}?format=${format.format}&w=${size.width}&q=${qualityValue}`,
      size: optimizedSize,
      width: size.width,
      height: size.height || Math.floor(size.width * 0.75), // Maintain aspect ratio
      quality: qualityValue,
    };
  }

  private getQualityForSize(sizeName: string, quality: QualitySettings): number {
    switch (sizeName) {
      case "thumbnail":
        return quality.thumbnail;
      case "small":
        return quality.low;
      case "medium":
        return quality.medium;
      case "large":
      case "xlarge":
        return quality.high;
      default:
        return quality.medium;
    }
  }

  private generatePlaceholder(optimizedImage: OptimizedImage): string {
    switch (this.config.lazy.placeholder) {
      case "blur":
        // Generate a tiny blurred version
        const tinyUrl = optimizedImage.optimizedUrls.find(url => url.width <= 50);
        return tinyUrl ? `${tinyUrl.url}&blur=20` : "";
      
      case "color":
        // Generate average color placeholder
        return "#f0f0f0"; // Simulated average color
      
      case "skeleton":
        // Return skeleton placeholder CSS
        return "data:image/svg+xml;base64," + btoa(`
          <svg width="${optimizedImage.metadata.width}" height="${optimizedImage.metadata.height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <animate attributeName="fill" values="#f0f0f0;#e0e0e0;#f0f0f0" dur="1.5s" repeatCount="indefinite"/>
          </svg>
        `);
      
      default:
        return "";
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute("data-src");
      
      if (this.config.lazy.fadeIn) {
        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s";
        
        img.onload = () => {
          img.style.opacity = "1";
        };
      }
    }
  }

  private calculateCacheHitRate(): number {
    // Simulated cache hit rate calculation
    return 75.5;
  }

  private generateCacheKey(imageUrl: string, config: Partial<ImageOptimizationConfig>): string {
    const configHash = JSON.stringify(config);
    return `${imageUrl}-${btoa(configHash).slice(0, 8)}`;
  }

  private generateJobId(): string {
    return `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateImageId(): string {
    return `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.clearCache();
      this.removeAllListeners();
      console.log("🖼️ Image Optimization Pipeline Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during image optimization service shutdown:", error);
    }
  }
}

export const imageOptimizationPipelineService = new ImageOptimizationPipelineService();
export default imageOptimizationPipelineService;