# 🚀 Galactic Fortress

A native iOS sci-fi tower defense game built with **Swift + SpriteKit**.

Defend the last human colonies against the alien Xarr invasion — on an isometric 2.5D battlefield.

## Features (Phase 1 MVP)
- Isometric 2.5D map rendering
- Laser Cannon tower with 3 upgrade levels
- 2 enemy types: Xarr Scout & Xarr Tank
- 5-wave campaign level (Alpha Centauri)
- Economy system (credits, sell/upgrade towers)
- HUD with wave control, credits, core HP
- Main menu, campaign map, and game over screens

## Project Structure

```
GalacticFortress/
├── App/                  AppDelegate, SceneDelegate, GameViewController
├── Scenes/               MainMenuScene, CampaignMapScene, GameScene, GameOverScene
├── Nodes/                IsometricMapNode, TowerNode, EnemyNode, ProjectileNode
├── Models/               Tower, Enemy, Level, GameState
├── Managers/             WaveManager, PathfindingManager
└── Resources/Levels/     level_01.json
```

## Setup in Xcode

1. Open Xcode → **File → New → Project → Game** (iOS, SpriteKit)
2. Name it `GalacticFortress`, Bundle ID of your choice
3. Delete the default `GameScene.swift` and `GameScene.sks`
4. Drag the entire `GalacticFortress/` folder into Xcode (check "Copy items if needed")
5. Add `level_01.json` to the **Copy Bundle Resources** build phase
6. Update `Info.plist`:
   - Set `UISceneConfigurations` → `UIWindowSceneSessionRoleApplication` → `SceneDelegate` class
   - Set `UIRequiresFullScreen = YES`
   - Remove the default `Main.storyboard` entry
7. Build and run on iPhone or Simulator (landscape orientation)

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — MVP | ✅ | Core loop, 1 tower, 2 enemies, 1 level |
| 2 — Content | 🔜 | All 8 towers, 6 enemies, 20 levels, Blender art |
| 3 — Online | 🔜 | GameCenter multiplayer, leaderboard, achievements |
| 4 — Polish | 🔜 | StoreKit IAP, tutorial, App Store |

## Requirements
- iOS 16+
- Xcode 15+
- Swift 5.9+
