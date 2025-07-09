import CryptoJS from "crypto-js"

// 加密配置
const ENCRYPTION_CONFIG = {
  algorithm: "AES",
  keySize: 256,
  ivSize: 128,
  saltSize: 128,
  iterations: 10000,
}

// 生成随机盐值
export function generateSalt(size: number = ENCRYPTION_CONFIG.saltSize): string {
  return CryptoJS.lib.WordArray.random(size / 8).toString()
}

// 生成随机IV
export function generateIV(size: number = ENCRYPTION_CONFIG.ivSize): string {
  return CryptoJS.lib.WordArray.random(size / 8).toString()
}

// 生成密钥
export function generateKey(password: string, salt: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: ENCRYPTION_CONFIG.keySize / 32,
    iterations: ENCRYPTION_CONFIG.iterations,
  })
}

// 获取默认密码（从环境变量或生成）
function getDefaultPassword(): string {
  // 在生产环境中，这应该从安全的环境变量中获取
  return process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-encryption-key-change-in-production"
}

// AES加密
export function encryptData(data: string, password?: string): string {
  try {
    const salt = generateSalt()
    const iv = generateIV()
    const key = generateKey(password || getDefaultPassword(), salt)

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 返回格式: salt:iv:encrypted
    return `${salt}:${iv}:${encrypted.toString()}`
  } catch (error) {
    console.error("Encryption failed:", error)
    throw new Error("数据加密失败")
  }
}

// AES解密
export function decryptData(encryptedData: string, password?: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format")
    }

    const [salt, iv, encrypted] = parts
    const key = generateKey(password || getDefaultPassword(), salt)

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    if (!decryptedText) {
      throw new Error("Decryption failed - invalid password or corrupted data")
    }

    return decryptedText
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("数据解密失败")
  }
}

// 安全存储类
export class SecureStorage {
  private prefix: string
  private ttl: number // 生存时间（毫秒）

  constructor(prefix = "secure_", ttl: number = 24 * 60 * 60 * 1000) {
    this.prefix = prefix
    this.ttl = ttl
  }

  // 存储数据
  setItem(key: string, value: any, encrypt = true): void {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        ttl: this.ttl,
      }

      const serialized = JSON.stringify(data)
      const stored = encrypt ? encryptData(serialized) : serialized

      localStorage.setItem(this.prefix + key, stored)
    } catch (error) {
      console.error("Failed to store data:", error)
      throw new Error("数据存储失败")
    }
  }

  // 获取数据
  getItem(key: string, decrypt = true): any {
    try {
      const stored = localStorage.getItem(this.prefix + key)
      if (!stored) return null

      const serialized = decrypt ? decryptData(stored) : stored
      const data = JSON.parse(serialized)

      // 检查是否过期
      if (Date.now() - data.timestamp > data.ttl) {
        this.removeItem(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error("Failed to retrieve data:", error)
      // 如果解密失败，删除损坏的数据
      this.removeItem(key)
      return null
    }
  }

  // 删除数据
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  // 清理过期数据
  cleanup(): void {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const serialized = decryptData(stored)
            const data = JSON.parse(serialized)

            if (Date.now() - data.timestamp > data.ttl) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // 如果解析失败，也删除这个键
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  // 获取所有键
  getAllKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  // 清空所有数据
  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}

// 内存存储类（用于敏感数据）
export class MemoryStorage {
  private data: Map<string, { value: any; timestamp: number; ttl: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor(cleanupIntervalMs = 60000) {
    // 定期清理过期数据
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  // 存储数据
  setItem(key: string, value: any, ttl: number = 30 * 60 * 1000): void {
    this.data.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    })
  }

  // 获取数据
  getItem(key: string): any {
    const item = this.data.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.data.delete(key)
      return null
    }

    return item.value
  }

  // 删除数据
  removeItem(key: string): void {
    this.data.delete(key)
  }

  // 清理过期数据
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.data.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.data.delete(key)
      }
    }
  }

  // 清空所有数据
  clear(): void {
    this.data.clear()
  }

  // 销毁存储
  destroy(): void {
    this.clear()
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// 哈希函数
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString()
}

// 生成随机字符串
export function generateRandomString(length = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString()
}

// 验证数据完整性
export function verifyIntegrity(data: string, hash: string): boolean {
  return hashData(data) === hash
}

// 创建数字签名
export function createSignature(data: string, secret: string): string {
  return CryptoJS.HmacSHA256(data, secret).toString()
}

// 验证数字签名
export function verifySignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(data, secret)
  return signature === expectedSignature
}

// 默认存储实例
export const secureStorage = new SecureStorage()
export const memoryStorage = new MemoryStorage()

// 清理函数（在应用关闭时调用）
export function cleanupEncryption(): void {
  memoryStorage.destroy()
  secureStorage.cleanup()
}

// 自动清理（页面卸载时）
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupEncryption)
}
