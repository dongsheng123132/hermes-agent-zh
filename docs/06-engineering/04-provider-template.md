# 06-4 Provider 模板架构：UI"一键添加" 怎么做

> 这一章讲：怎么设计一个"用户点 logo → 预填 baseUrl/默认 model/申请 key 链接 → 用户只需粘贴 key 就能保存"的 Provider 模板系统。

---

## 问题

如果你做的产品支持 10+ 个 AI Provider（OpenAI / Anthropic / DeepSeek / 通义 / Kimi / ...），用户配置时很头大：

```
用户：我要加 DeepSeek，base URL 是什么？
你：https://api.deepseek.com/v1
用户：默认 model 选哪个？
你：deepseek-chat
用户：去哪申请 key？
你：https://platform.deepseek.com/api_keys
```

每个 Provider 都要回答这 3 个问题，**累。**

**解决**：写一份 Provider 模板，UI 自动展开。

---

## 模板数据结构

```javascript
// providers/templates.js
const PROVIDER_TEMPLATES = [
  // 国产云
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🐋',
    category: 'cn',                    // cn / oversea / local
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyFormat: 'sk-...',
    applyUrl: 'https://platform.deepseek.com/api_keys',
    docsUrl: 'https://platform.deepseek.com/',
    description: '国内直连，性价比之王',
  },
  {
    id: 'alibaba',
    name: '通义千问（阿里云）',
    icon: '☁️',
    category: 'cn',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    applyUrl: 'https://bailian.console.aliyun.com/?apiKey=1',
  },
  {
    id: 'moonshot',
    name: 'Kimi（Moonshot）',
    icon: '🌙',
    category: 'cn',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-auto',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    applyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  // ... 海外 / 本地，省略
];
```

---

## UI 实现

```jsx
// React 示例
function AddProviderModal() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [apiKey, setApiKey] = useState('');
  
  return (
    <div>
      <h2>选择 AI 服务商</h2>
      
      <div className="grid">
        {PROVIDER_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => setSelectedTemplate(t)}>
            <span>{t.icon}</span>
            <span>{t.name}</span>
            <small>{t.description}</small>
          </button>
        ))}
      </div>
      
      {selectedTemplate && (
        <div>
          <h3>配置 {selectedTemplate.name}</h3>
          <p>API Endpoint: {selectedTemplate.baseUrl}（已自动填好）</p>
          <p>默认模型: {selectedTemplate.defaultModel}（可后续切换）</p>
          
          <label>
            API Key
            <input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={selectedTemplate.keyFormat}
            />
          </label>
          
          <a href={selectedTemplate.applyUrl} target="_blank">
            没有 key？点这里申请 →
          </a>
          
          <button onClick={() => save(selectedTemplate, apiKey)}>
            保存
          </button>
        </div>
      )}
    </div>
  );
}
```

用户体验：点 logo → 输入 key → 完成。30 秒搞定一个 Provider。

---

## 服务端处理

```javascript
function save(template, apiKey) {
  // 转成 hermes config.yaml 格式
  const providerConfig = {
    type: 'openai_compatible',
    base_url: template.baseUrl,
    api_key: apiKey,                  // 直接存（或加密后存）
    models: template.models,
    default_model: template.defaultModel,
  };
  
  // 写到 hermes config
  writeYaml('~/.u-hermes/data/config.yaml', {
    providers: {
      ...existingProviders,
      [template.id]: providerConfig,
    },
  });
  
  // 测试连通性
  return testProvider(template.id);
}

async function testProvider(id) {
  const resp = await fetch('http://127.0.0.1:8642/test-provider', {
    method: 'POST',
    body: JSON.stringify({ provider: id, prompt: 'hello' }),
  });
  return resp.ok;
}
```

---

## 模板字段设计原则

| 字段 | 必需 | 用途 |
|---|---|---|
| `id` | ✅ | 唯一标识，用作 config.yaml 的 key |
| `name` | ✅ | UI 显示 |
| `icon` | ✅ | UI 显示（emoji 或图标 URL） |
| `category` | ✅ | 分组（cn/oversea/local） |
| `baseUrl` | ✅ | API 端点 |
| `defaultModel` | ✅ | 用户没选时用什么 |
| `models` | 推荐 | 模型下拉列表 |
| `applyUrl` | 推荐 | "去申请" 按钮链接 |
| `docsUrl` | 可选 | "查文档" 链接 |
| `keyFormat` | 可选 | placeholder 提示 |
| `description` | 可选 | UI 副标题 |
| `needsProxy` | 可选 | 标注"需要代理" |
| `transport` | 可选 | `openai_completions` / `anthropic_messages` 等 |

---

## 处理特殊 Provider

### Anthropic（不是 OpenAI 兼容）

```javascript
{
  id: 'anthropic',
  name: 'Anthropic Claude',
  baseUrl: 'https://api.anthropic.com/v1',
  defaultModel: 'claude-sonnet-4-5',
  models: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
  transport: 'anthropic_messages',  // ← 特殊协议
  needsProxy: true,
}
```

服务端处理：

```javascript
function buildProviderConfig(template, apiKey) {
  if (template.transport === 'anthropic_messages') {
    return {
      type: 'anthropic',     // 用 anthropic 类型，不是 openai_compatible
      base_url: template.baseUrl,
      api_key: apiKey,
      models: template.models,
    };
  }
  // ... 默认 openai_compatible
}
```

### Ollama（本地）

```javascript
{
  id: 'ollama',
  name: 'Ollama（本地模型）',
  category: 'local',
  baseUrl: 'http://127.0.0.1:11434/v1',
  isLocal: true,
  defaultKey: 'ollama',     // 本地不需真 key
  // ...
}
```

UI 看 `isLocal: true` 时跳过 "API Key" 输入框，直接用 `defaultKey`。

### 需要代理

```javascript
{
  id: 'openai',
  name: 'OpenAI',
  needsProxy: true,
  // ...
}
```

UI 看 `needsProxy: true` 时显示提示："海外服务，需要代理才能访问"。

---

## 自定义 Provider（不在模板里）

总有用户想加模板里没有的 Provider。提供"自定义"选项：

```javascript
{
  id: 'custom',
  name: '自定义（OpenAI 兼容）',
  icon: '⚙️',
  category: 'custom',
  baseUrl: '',              // 用户填
  defaultModel: '',          // 用户填
  models: [],
}
```

UI 在用户选 "custom" 时把所有字段变成可输入。

---

## 兼容性测试

每个新加的模板都要跑：

```javascript
// tests/provider-templates.test.js
import { PROVIDER_TEMPLATES } from '../providers/templates.js';

describe.each(PROVIDER_TEMPLATES)('Provider: $name', (t) => {
  test('baseUrl 可访问', async () => {
    const resp = await fetch(t.baseUrl + '/models', {
      headers: { Authorization: `Bearer ${process.env[`${t.id.toUpperCase()}_KEY`]}` },
    });
    expect([200, 401]).toContain(resp.status);  // 200 或 401（key 不对但端点对）
  });
  
  test('default model 在 models 列表里', () => {
    expect(t.models).toContain(t.defaultModel);
  });
  
  test('applyUrl 是 https', () => {
    expect(t.applyUrl).toMatch(/^https:/);
  });
});
```

---

## i18n（多语言）

如果你的产品支持多语言：

```javascript
{
  id: 'deepseek',
  name: {
    zh: 'DeepSeek',
    en: 'DeepSeek',
    ja: 'DeepSeek',
  },
  description: {
    zh: '国内直连，性价比之王',
    en: 'Domestic access, best price/performance',
    ja: '国内アクセス、コスパ抜群',
  },
}
```

UI 根据当前语言显示对应文案。

---

## 模板的扩展性

随着新 Provider 上线，需要不断更新模板。两种维护方式：

### A. 硬编码（简单）

模板写死在代码里，发版本带模板。优点：可靠，不依赖网络。缺点：加新 Provider 必须发新版。

### B. 远程获取（灵活）

启动时从 GitHub raw 拉最新模板：

```javascript
async function loadTemplates() {
  try {
    const resp = await fetch('https://raw.githubusercontent.com/dongsheng123132/hermes-agent-zh/main/data/provider-templates.json');
    return await resp.json();
  } catch {
    return BUILTIN_TEMPLATES;   // 网络不通时回退
  }
}
```

优点：不发版也能更新。缺点：依赖网络 + 安全风险（远程篡改）。

**推荐**：硬编码内置 + 可选远程更新（用户手动点"刷新模板"）。

---

## 商业版的额外考量

我（作者）的 [U-Hermes Pro](https://u-hermes.org) 商业版还有：

- **预配置 provider**：开箱即装好"虾盘云"（不需要用户去注册任何 key）
- **付费 provider 通道**：用户买 hermes 马盘自带 ¥30 额度
- **白名单**：企业版可以禁用某些 provider（如海外服务）

这部分是商业秘密，不在本教程公开。但**模板架构本身是通用方法**，你可以基于本章设计任何"一键添加"的产品。

---

## 完整模板示例

完整的 16 个 Provider 模板（不含商业版独占 Provider）见：

- 本仓库 [examples/configs/provider-templates.json](https://github.com/dongsheng123132/hermes-agent-zh/tree/main/examples/configs/) （v1.5 发布）
- 开源参考 [u-hermes/website/](https://github.com/dongsheng123132/u-hermes)（U-Hermes 公开仓库的 Provider 列表）

---

**[← 06-3 Bundle Patches](./03-bundle-patches.md)** · **[完成 06 工程进阶 → 07 排错](../07-troubleshooting/)**
