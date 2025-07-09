# 项目结构和配置提示词

## 📁 项目结构提示词

```
请创建以下项目结构的React + TypeScript应用：

```
rag-audit-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/           # 通用组件
│   │   ├── ui/              # 基础UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/          # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── common/          # 通用业务组件
│   │       ├── FileUploader.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── HealthIndicator.tsx
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── AnalyzePage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── IngestPage.tsx
│   │   └── HistoryPage.tsx
│   ├── hooks/               # 自定义Hooks
│   │   ├── useApi.ts
│   │   ├── useToast.ts
│   │   ├── useLocalStorage.ts
│   │   └── useWebSocket.ts
│   ├── services/            # API服务
│   │   ├── api.ts
│   │   ├── health.ts
│   │   ├── analyze.ts
│   │   ├── chat.ts
│   │   └── ingest.ts
│   ├── types/               # TypeScript类型定义
│   │   ├── api.ts
│   │   ├── common.ts
│   │   └── components.ts
│   ├── utils/               # 工具函数
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── styles/              # 样式文件
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── tailwind.css
│   ├── context/             # React Context
│   │   ├── AppContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── setupTests.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts           # 或 craco.config.js
├── .env.example
├── .env.local
├── .gitignore
├── README.md
└── Dockerfile
```

请按照这个结构创建项目，并实现基础的配置文件。
```

## ⚙️ 配置文件提示词

```
请创建以下配置文件：

1. package.json：
```json
{
  "name": "rag-audit-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.5",
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "axios": "^1.3.4",
    "react-hook-form": "^7.43.5",
    "react-query": "^3.39.3",
    "tailwindcss": "^3.2.7",
    "lucide-react": "^0.323.0",
    "chart.js": "^4.2.1",
    "react-chartjs-2": "^5.2.0",
    "react-markdown": "^8.0.5",
    "react-syntax-highlighter": "^15.5.0",
    "framer-motion": "^10.0.1",
    "react-dropzone": "^14.2.3",
    "date-fns": "^2.29.3",
    "clsx": "^1.2.1",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "@types/node": "^18.14.2",
    "eslint": "^8.36.0",
    "prettier": "^2.8.4",
    "@typescript-eslint/eslint-plugin": "^5.54.1",
    "@typescript-eslint/parser": "^5.54.1"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,css,md}"
  }
}
```

2. tsconfig.json：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

3. tailwind.config.js：
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

4. vite.config.ts：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

请创建这些配置文件来设置项目基础。
```

## 🎨 样式系统提示词

```
请创建统一的样式系统：

1. globals.css：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply bg-gray-900 text-white font-sans antialiased;
  }
  
  * {
    @apply border-gray-700;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700;
  }
  
  .input-field {
    @apply bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .glass-effect {
    @apply bg-white/10 backdrop-blur-md border border-white/20;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}
```

2. 组件样式约定：
- 使用Tailwind CSS类名
- 深色主题为主
- 一致的间距系统（4px的倍数）
- 统一的圆角（rounded-lg, rounded-xl）
- 一致的阴影效果
- 渐变和玻璃态效果

3. 响应式断点：
- sm: 640px（手机横屏）
- md: 768px（平板）
- lg: 1024px（小桌面）
- xl: 1280px（大桌面）

4. 颜色系统：
- 主色：蓝色系（primary-*）
- 背景：灰色系（gray-800, gray-900）
- 文字：白色和灰色
- 状态色：绿色（成功）、红色（错误）、黄色（警告）

请按照这个样式系统实现所有组件。
```

## 🔧 开发工具配置提示词

```
请创建开发工具配置：

1. .eslintrc.js：
```javascript
module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

2. .prettierrc：
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

3. .env.example：
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=RAG Audit System
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

4. .gitignore：
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/build
/dist

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

请创建这些开发配置文件。
```

## 🚀 部署配置提示词

```
请创建部署相关配置：

1. Dockerfile：
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

2. nginx.conf：
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

3. docker-compose.yml：
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - rag-network

  backend:
    image: rag-audit-api:latest
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    networks:
      - rag-network

networks:
  rag-network:
    driver: bridge
```

请创建这些部署配置文件。
```
