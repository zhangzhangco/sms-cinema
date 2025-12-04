# 如何重命名 GitHub 仓库

## 推荐的新仓库名称

基于项目特点，建议使用以下名称之一：

1. **SMS-Cinema** - 简洁明了
2. **GPU-DCP-Player** - 突出GPU技术
3. **CinemaScreenManager** - 专业描述
4. **DCP-SMS** - 结合DCP和SMS
5. **NvDcpPlayer** - 强调NVIDIA技术

## 重命名步骤

### 在 GitHub 网页端操作

1. **进入仓库设置**
   - 访问: https://github.com/zhangzhangco/FreeDcpPlayer
   - 点击 "Settings" 标签

2. **重命名仓库**
   - 在 "Repository name" 输入框中输入新名称
   - 点击 "Rename" 按钮
   - GitHub 会自动设置重定向

3. **更新本地仓库**
   ```bash
   # 更新远程仓库URL（假设新名称为 SMS-Cinema）
   git remote set-url zh_fork https://github.com/zhangzhangco/SMS-Cinema.git
   
   # 验证更新
   git remote -v
   ```

4. **推送所有分支**
   ```bash
   # 推送当前分支
   git push zh_fork linux-cmake-sdl2ttf-asdcplib
   
   # 如果需要推送所有分支
   git push zh_fork --all
   ```

## 重命名后的注意事项

### 1. 更新项目文档
需要更新以下文件中的仓库链接：
- README.md
- PROJECT_INFO.md
- 其他包含仓库URL的文档

### 2. 更新克隆地址
如果有其他地方克隆了这个仓库，需要更新远程地址：
```bash
git remote set-url origin https://github.com/zhangzhangco/NEW-REPO-NAME.git
```

### 3. GitHub 自动重定向
- GitHub 会自动将旧URL重定向到新URL
- 但建议尽快更新所有引用

## 建议的完整工作流

```bash
# 1. 在 GitHub 网页端重命名仓库（假设改为 SMS-Cinema）

# 2. 更新本地远程地址
git remote set-url zh_fork https://github.com/zhangzhangco/SMS-Cinema.git

# 3. 验证
git remote -v

# 4. 拉取确认
git fetch zh_fork

# 5. 继续正常工作
git push zh_fork linux-cmake-sdl2ttf-asdcplib
```

## 推荐名称分析

| 名称 | 优点 | 缺点 |
|------|------|------|
| **SMS-Cinema** | 简洁、专业 | 可能不够技术化 |
| **GPU-DCP-Player** | 突出技术特点 | 较长 |
| **CinemaScreenManager** | 描述准确 | 较长 |
| **DCP-SMS** | 简短、专业 | 可能不够直观 |
| **NvDcpPlayer** | 强调NVIDIA | 可能限制技术栈印象 |

## 我的推荐

**首选: SMS-Cinema**
- 简洁易记
- 专业性强
- 适合未来扩展
- 不限制技术栈

**备选: GPU-DCP-Player**
- 技术特点明确
- SEO友好
- 吸引技术用户
