# 疾跑三关（Godot 4）

玩法要点：
- 人物自动向前奔跑并自动射击。
- 怪物有血量，撞到怪物会损失该怪物当前剩余血量。
- 随机出现透明增益墙，穿过可获得：攻速 +1、攻击 +1、辅助射击 +1、暴击率 +20% 等。
- 三关难度递升，击败最终 Boss 通关。
- 无存档功能，中文界面。

## 运行
1. 用 Godot 4 打开 `d:\codex\runner-game\project.godot`。
2. 点击右上角运行，或按 F5。

## 操作
- `↑` / `↓`：上下移动
- `R`：重开本局

## 导出 EXE（给外部电脑直接运行）
1. 在 Godot 中打开项目。
2. 菜单 `Project > Export...`。
3. 点击 `Add`，选择 `Windows Desktop` 预设。
4. 设置导出路径，例如 `d:\codex\runner-game\build\runner-game.exe`。
5. 勾选 `Embed Pck`（可选，建议勾选）。
6. 点击 `Export Project`。

导出后会得到 `runner-game.exe`（若未嵌入会还有 `.pck` 文件）。将 `exe`（和 `.pck`）一起打包给外部电脑即可直接运行。

