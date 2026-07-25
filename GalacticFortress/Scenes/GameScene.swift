import SpriteKit

// MARK: - Game Scene

/// Main gameplay scene. Orchestrates the isometric map, towers, enemies, HUD, and wave management.

final class GameScene: SKScene {

    // MARK: - Dependencies

    private var levelData: LevelData!
    private var gameState: GameState!
    private var waveManager: WaveManager!
    private var screenPath: [CGPoint] = []

    // MARK: - Nodes

    private var mapNode: IsometricMapNode!
    private var hud: HUD!
    private var towerMenu: TowerMenu?
    private var towerNodes: [UUID: TowerNode] = [:]
    private var enemyNodes: [UUID: EnemyNode] = [:]
    private var cameraNode: SKCameraNode!

    // MARK: - Init / Setup

    override func didMove(to view: SKView) {
        backgroundColor = UIColor(red: 0.03, green: 0.04, blue: 0.1, alpha: 1)
        addStarfield()
        loadLevel()
        setupCamera()
        setupMap()
        setupHUD()
        setupGameState()
        setupWaveManager()
    }

    // MARK: - Level Loading

    private func loadLevel() {
        guard let data = LevelLoader.load(named: "level_01") else {
            fatalError("Failed to load level_01.json")
        }
        levelData = data
        screenPath = PathfindingManager.pathInScreenCoordinates(waypoints: data.path)
    }

    // MARK: - Setup

    private func setupCamera() {
        cameraNode = SKCameraNode()
        addChild(cameraNode)
        camera = cameraNode
    }

    private func setupMap() {
        mapNode = IsometricMapNode(levelData: levelData)
        mapNode.delegate = self

        // Center map in scene
        let offset = PathfindingManager.mapOffset(
            cols: levelData.gridSize.cols,
            rows: levelData.gridSize.rows,
            in: size)
        mapNode.position = offset
        addChild(mapNode)
    }

    private func setupHUD() {
        hud = HUD(sceneSize: size)
        hud.onStartWaveTapped = { [weak self] in self?.startNextWave() }
        cameraNode.addChild(hud)
    }

    private func setupGameState() {
        gameState = GameState(startingCredits: 300, coreHP: 100, totalWaves: levelData.waves.count)

        gameState.onCreditsChanged = { [weak self] credits in
            self?.hud.updateCredits(credits)
            self?.towerMenu?.removeFromParent()  // dismiss stale menu
        }
        gameState.onCoreHPChanged = { [weak self] hp in
            guard let self else { return }
            self.hud.updateCoreHP(hp, max: self.gameState.maxCoreHP)
        }
        gameState.onWaveChanged = { [weak self] current, total in
            self?.hud.updateWave(current: current, total: total)
        }
        gameState.onGameOver = { [weak self] victory in
            self?.showGameOver(victory: victory)
        }

        hud.updateCredits(gameState.credits)
        hud.updateCoreHP(gameState.coreHP, max: gameState.maxCoreHP)
        hud.updateWave(current: 0, total: gameState.totalWaves)
    }

    private func setupWaveManager() {
        waveManager = WaveManager(waves: levelData.waves)
        waveManager.delegate = self
        hud.setStartWaveEnabled(true)
        hud.setStartWaveTitle("▶ Wave 1")
    }

    // MARK: - Starfield Background

    private func addStarfield() {
        for _ in 0..<120 {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.5...2))
            star.fillColor = UIColor(white: CGFloat.random(in: 0.4...1.0), alpha: 1)
            star.strokeColor = .clear
            star.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2)
            )
            star.zPosition = -10
            cameraNode.addChild(star)
        }
    }

    // MARK: - Wave Control

    private func startNextWave() {
        guard !gameState.isGameOver else { return }
        hud.setStartWaveEnabled(false)
        hud.setStartWaveTitle("⚡ Wave active...")
        gameState.advanceWave()
        waveManager.startNextWave()
    }

    // MARK: - Tower Management

    private func placeTower(type: TowerType, col: Int, row: Int) {
        guard gameState.canAfford(type.baseCost) else { return }
        gameState.spend(type.baseCost)

        var tower = Tower(type: type, gridCol: col, gridRow: row)
        gameState.addTower(tower)

        // Create visual node
        let node = TowerNode(tower: tower)
        let screenPos = PathfindingManager.screenPosition(col: col, row: row)
        node.position = CGPoint(x: mapNode.position.x + screenPos.x,
                                y: mapNode.position.y + screenPos.y)
        node.zPosition = CGFloat(levelData.gridSize.cols + levelData.gridSize.rows - col - row) + 10
        node.onFireProjectile = { [weak self] from, targetNode, damage, towerType in
            self?.spawnProjectile(from: from, targetNode: targetNode, damage: damage, type: towerType)
        }
        addChild(node)
        towerNodes[tower.id] = node
        mapNode.markTowerPlaced(col: col, row: row)
    }

    private func upgradeTower(id: UUID) {
        guard var tower = gameState.towers.first(where: { $0.id == id }),
              tower.canUpgrade,
              gameState.canAfford(tower.upgradeCost) else { return }

        gameState.spend(tower.upgradeCost)
        tower.upgradeLevel += 1
        gameState.removeTower(id: id)
        gameState.addTower(tower)
        towerNodes[id]?.tower = tower
    }

    private func sellTower(id: UUID) {
        guard let tower = gameState.towers.first(where: { $0.id == id }) else { return }
        gameState.earn(tower.sellValue)
        gameState.removeTower(id: id)
        towerNodes[id]?.removeFromParent()
        towerNodes.removeValue(forKey: id)
        mapNode.markTowerRemoved(col: tower.gridCol, row: tower.gridRow)
    }

    // MARK: - Projectile Spawning

    private func spawnProjectile(from pos: CGPoint, targetNode: SKNode, damage: Double, type: TowerType) {
        let proj = ProjectileNode(from: pos, to: targetNode, type: type)
        addChild(proj)
        let dest = targetNode.position
        proj.onHit = { [weak targetNode, weak self] in
            guard let enemyNode = targetNode as? EnemyNode else { return }
            enemyNode.takeDamage(damage)
            // Plasma AoE: damage all enemies near target
            if type == .plasmaAoE {
                let aoeRadius: Double = 60
                self?.enemyNodes.values.filter {
                    !$0.isDead && $0.position.distance(to: dest) < aoeRadius
                }.forEach { $0.takeDamage(damage * 0.5) }
            }
        }
        proj.fire(to: dest)
    }

    // MARK: - Enemy Spawning (called by WaveManager)

    private func spawnEnemy(type: EnemyType) {
        let enemy = Enemy(type: type)
        let node = EnemyNode(enemy: enemy, screenPath: screenPath.map {
            // Convert map-local path to scene coordinates
            CGPoint(x: mapNode.position.x + $0.x, y: mapNode.position.y + $0.y)
        })
        node.zPosition = 20

        node.onReachedCore = { [weak self, weak node] in
            self?.enemyNodes.removeValue(forKey: enemy.id)
            self?.gameState.damageCore(by: enemy.type.coreDamage)
        }
        node.onDied = { [weak self] reward in
            self?.enemyNodes.removeValue(forKey: enemy.id)
            self?.gameState.earn(reward)
        }

        addChild(node)
        enemyNodes[enemy.id] = node
        node.startMoving()
    }

    // MARK: - Game Over

    private func showGameOver(victory: Bool) {
        waveManager.cancelAll()
        let scene = GameOverScene(size: size, victory: victory,
                                  wave: gameState.currentWave, credits: gameState.credits)
        scene.scaleMode = .aspectFill
        view?.presentScene(scene, transition: SKTransition.fade(withDuration: 1.0))
    }

    // MARK: - Update Loop

    override func update(_ currentTime: TimeInterval) {
        guard !gameState.isGameOver else { return }

        let enemies = Array(enemyNodes.values)

        // Update each tower's shooting logic
        towerNodes.values.forEach { $0.update(currentTime: currentTime, enemies: enemies) }

        // Isometric depth sorting: enemies closer to camera (higher scene-y) render in front
        // z-position based on y: higher y on screen = in front
        for node in enemies {
            node.zPosition = 20 - node.position.y / 100
        }
    }

    // MARK: - Touch (scene-level: dismiss menus on background tap)

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        // If there's an open menu and touch wasn't in it, dismiss
        if let menu = towerMenu, !menu.contains(touch.location(in: menu.parent!)) {
            menu.removeFromParent()
            towerMenu = nil
        }
    }
}

// MARK: - IsometricMapNodeDelegate

extension GameScene: IsometricMapNodeDelegate {
    func isometricMap(_ map: IsometricMapNode, didTapBuildSpot col: Int, row: Int) {
        dismissTowerMenu()
        let screenPos = PathfindingManager.screenPosition(col: col, row: row)
        let scenePos  = CGPoint(x: mapNode.position.x + screenPos.x,
                                y: mapNode.position.y + screenPos.y)
        let menu = TowerMenu()
        menu.delegate = self
        menu.showBuildMenu(at: col, row: row, credits: gameState.credits, scenePosition: scenePos)
        addChild(menu)
        towerMenu = menu
    }

    func isometricMap(_ map: IsometricMapNode, didTapTower col: Int, row: Int) {
        dismissTowerMenu()
        guard let tower = gameState.tower(at: col, row: row) else { return }
        let screenPos = PathfindingManager.screenPosition(col: col, row: row)
        let scenePos  = CGPoint(x: mapNode.position.x + screenPos.x,
                                y: mapNode.position.y + screenPos.y)
        let menu = TowerMenu()
        menu.delegate = self
        menu.showTowerMenu(for: tower, credits: gameState.credits, scenePosition: scenePos)
        addChild(menu)
        towerMenu = menu
        towerNodes[tower.id]?.showRange()
    }

    private func dismissTowerMenu() {
        towerMenu?.removeFromParent()
        towerMenu = nil
        towerNodes.values.forEach { $0.hideRange() }
    }
}

// MARK: - TowerMenuDelegate

extension GameScene: TowerMenuDelegate {
    func towerMenu(_ menu: TowerMenu, didSelectPlace type: TowerType, at col: Int, row: Int) {
        placeTower(type: type, col: col, row: row)
        towerMenu = nil
    }

    func towerMenu(_ menu: TowerMenu, didSelectUpgrade towerID: UUID) {
        upgradeTower(id: towerID)
        towerMenu = nil
    }

    func towerMenu(_ menu: TowerMenu, didSelectSell towerID: UUID) {
        sellTower(id: towerID)
        towerMenu = nil
    }

    func towerMenuDidDismiss(_ menu: TowerMenu) {
        towerMenu = nil
        towerNodes.values.forEach { $0.hideRange() }
    }
}

// MARK: - WaveManagerDelegate

extension GameScene: WaveManagerDelegate {
    func waveManager(_ manager: WaveManager, didSpawnEnemy type: EnemyType) {
        spawnEnemy(type: type)
    }

    func waveManagerDidCompleteWave(_ manager: WaveManager, waveIndex: Int) {
        // Wave complete — if enemies all gone (or will die soon), allow next wave
        let nextWave = waveIndex + 2  // waveIndex is 0-based, display is 1-based
        if nextWave <= gameState.totalWaves {
            hud.setStartWaveEnabled(true)
            hud.setStartWaveTitle("▶ Wave \(nextWave)")
        }
    }

    func waveManagerDidCompleteAllWaves(_ manager: WaveManager) {
        // All waves spawned; wait for remaining enemies then declare victory
        let checkInterval = 1.0 / 10.0
        run(SKAction.repeatForever(SKAction.sequence([
            SKAction.wait(forDuration: checkInterval),
            SKAction.run { [weak self] in
                guard let self, !self.gameState.isGameOver else {
                    self?.removeAction(forKey: "victoryCheck")
                    return
                }
                if self.enemyNodes.isEmpty {
                    self.gameState.markVictory()
                    self.removeAction(forKey: "victoryCheck")
                }
            }
        ])), withKey: "victoryCheck")
    }
}

// MARK: - CGPoint distance helper

private extension CGPoint {
    func distance(to other: CGPoint) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return sqrt(Double(dx * dx + dy * dy))
    }
}
