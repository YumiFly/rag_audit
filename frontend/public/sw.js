const CACHE_NAME = "rag-audit-v2"
const STATIC_CACHE = "rag-audit-static-v2"
const DYNAMIC_CACHE = "rag-audit-dynamic-v2"

const STATIC_ASSETS = ["/", "/analyze", "/chat", "/batch-upload", "/manifest.json", "/offline.html"]

const API_CACHE_PATTERNS = [/\/api\/health/, /\/api\/analyze/]

// 安装事件
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(async (cache) => {
        // 逐个添加资源，避免单个失败导致全部失败
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset)
            console.log(`Successfully cached: ${asset}`)
          } catch (error) {
            console.warn(`Failed to cache: ${asset}`, error)
            // 继续处理其他资源，不让单个失败阻止整个安装过程
          }
        })
        await Promise.allSettled(cachePromises)
      }),
      self.skipWaiting(),
    ]),
  )
})

// 激活事件
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
              .map((name) => caches.delete(name)),
          )
        }),
      self.clients.claim(),
    ]),
  )
})

// 获取事件
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 处理导航请求
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 缓存成功的导航响应
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // 离线时返回缓存或离线页面
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // 如果没有缓存，尝试返回离线页面
            return caches.match("/offline.html").then((offlinePage) => {
              return offlinePage || new Response("离线模式 - 请检查网络连接", {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/plain; charset=utf-8" }
              })
            })
          })
        }),
    )
    return
  }

  // 处理API请求
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 缓存特定的API响应
          if (response.ok && API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // API离线时返回缓存
          return caches.match(request)
        }),
    )
    return
  }

  // 处理静态资源
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // 缓存新的静态资源
        if (response.ok && request.method === "GET") {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    }),
  )
})

// 后台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // 实现后台同步逻辑
  console.log("Background sync triggered")
}

// 消息处理
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
