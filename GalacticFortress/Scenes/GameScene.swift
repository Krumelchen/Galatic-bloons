import SpriteKit

// MARK: - Game Scene

/// Main gameplay scene. Phase 2: supports all 8 tower types, all 6 enemies,
/// special effects (slow, stun, teleport, heal, solar income), and dynamic level loading.

final class GameScene: SKScene {

    // MARK: - Configuration

    /// Pass this before presenting the scene to load a specific level JSON.
    var levelName: String = "level_01"

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
        addRadialBackground()
        addStarfield()
        loadLevel()
        setupCamera()
        setupMap()
        setupHUD()
        setupGameState()
        setupWaveManager()
    }

    /// Adds a radial gradient background for 2.5D depth
    private func addRadialBackground() {
        let bgSize = CGSize(width: size.width * 1.5, height: size.height * 1.5)
        let bgNode = SKShapeNode(circleOfRadius: max(bgSize.width, bgSize.height) * 0.6)
        bgNode.fillColor = UIColor(red: 0.06, green: 0.08, blue: 0.18, alpha: 1)
        bgNode.strokeColor = .clear
        bgNode.position = CGPoint(x: size.width / 2, y: size.height / 2)
        bgNode.zPosition = -20
        cameraNode?.addChild(bgNode)

        // Subtle glow ring
        let glow = SKShapeNode(circleOfRadius: 180)
        glow.fillColor = UIColor(red: 0.1, green: 0.15, blue: 0.3, alpha: 0.3)
        glow.strokeColor = UIColor(red: 0.2, green: 0.3, blue: 0.5, alpha: 0.15)
        glow.lineWidth = 1
        glow.position = CGPoint(x: size.width / 2, y: size.height / 2)
        glow.zPosition = -19
        cameraNode?.addChild(glow)
    }

    // MARK: - Level Loading

    private func loadLevel() {
        guard let data = LevelLoader.load(named: levelName) else {
            fatalError("Failed to load \(levelName).json")
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
        run(SoundManager.sfxAction(named: SoundManager.SFX.waveStart))
        gameState.advanceWave()
        waveManager.startNextWave()
    }

    // MARK: - Tower Management

    private func placeTower(type: TowerType, col: Int, row: Int) {
        guard gameState.canAfford(type.baseCost) else { return }
        gameState.spend(type.baseCost)

        let tower = Tower(type: type, gridCol: col, gridRow: row)
        gameState.addTower(tower)

        let node = TowerNode(tower: tower)
        let screenPos = PathfindingManager.screenPosition(col: col, row: row)
        node.position = CGPoint(x: mapNode.position.x + screenPos.x,
                                y: mapNode.position.y + screenPos.y)
        node.zPosition = CGFloat(levelData.gridSize.cols + levelData.gridSize.rows - col - row) + 10

        node.onFireProjectile = { [weak self] from, target, damage, type in
            self?.spawnProjectile(from: from, target: target, damage: damage, type: type)
        }
        node.onSpecialEffect = { [weak self] type, target in
            self?.applySpecialEffect(type: type, to: target)
        }
        node.onGenerateCredits = { [weak self] amount in
            self?.gameState.earn(amount)
        }
        node.onHealCore = { [weak self] amount in
            guard let self else { return }
            let healed = min(amount, self.gameState.maxCoreHP - self.gameState.coreHP)
            if healed > 0 {
                self.gameState.coreHP += healed
                self.hud.updateCoreHP(self.gameState.coreHP, max: self.gameState.maxCoreHP)
            }
        }

        addChild(node)
        towerNodes[tower.id] = node
        mapNode.markTowerPlaced(col: col, row: row)
        run(SoundManager.sfxAction(named: SoundManager.SFX.towerPlace))
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

    private func spawnProjectile(from pos: CGPoint, target: EnemyNode, damage: Double, type: TowerType) {
        let proj = ProjectileNode(from: pos, to: target, type: type)
        addChild(proj)
        let dest = target.position
        proj.onHit = { [weak target, weak self] in
            guard let enemy = target, let self else { return }
            enemy.takeDamage(damage)
            // Plasma AoE: splash damage to nearby enemies
            if type == .plasmaAoE {
                self.enemyNodes.values
                    .filter { !$0.isDead && $0 !== enemy && $0.position.distance(to: dest) < 65 }
                    .forEach { $0.takeDamage(damage * 0.5) }
            }
        }
        proj.fire(to: dest)
    }

    // MARK: - Special Tower Effects

    private func applySpecialEffect(type: TowerType, to target: EnemyNode) {
        switch type {
        case .ionSlow:
            target.applySlowEffect(factor: 0.45, duration: 2.5)
        case .empPulse:
            // EMP stuns all enemies in the map area (handled in TowerNode.update → onSpecialEffect for each)
            target.applyStun(duration: 1.8)
        case .quantumDisruptor:
            // Only teleport if projectile makes it (fired via normal path)
            if !target.isDead {
                target.teleportToStart()
                // Half the quantum disruptor damage is wasted (teleport IS the penalty)
                target.takeDamage(0)
            }
        default:
            break  // other types don't have special effects beyond projectile damage
        }
    }

    // MARK: - Enemy Spawning

    private func spawnEnemy(type: EnemyType) {
        let enemy = Enemy(type: type)
        let sceneScreenPath = screenPath.map {
            CGPoint(x: mapNode.position.x + $0.x, y: mapNode.position.y + $0.y)
        }
        let node = EnemyNode(enemy: enemy, screenPath: sceneScreenPath)
        node.zPosition = 20

        node.onReachedCore = { [weak self] in
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
        towerNodes.values.forEach { $0.update(currentTime: currentTime, enemies: enemies) }
        // Isometric depth: enemies higher on screen (larger y in isometric) render in front
        enemies.forEach { $0.zPosition = 20.0 - $0.position.y / 100.0 }
    }

    // MARK: - Touch (dismiss menus on background tap)

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        if let menu = towerMenu, let parent = menu.parent,
           !menu.contains(touch.location(in: parent)) {
            dismissTowerMenu()
        }
    }
}

// MARK: - IsometricMapNodeDelegate

extension GameScene: IsometricMapNodeDelegate {
    func isometricMap(_ map: IsometricMapNode, didTapBuildSpot col: Int, row: Int) {
        dismissTowerMenu()
        let scenePos = tileScenePosition(col: col, row: row)
        let menu = TowerMenu()
        menu.delegate = self
        menu.showBuildMenu(at: col, row: row, credits: gameState.credits, scenePosition: scenePos)
        addChild(menu)
        towerMenu = menu
    }

    func isometricMap(_ map: IsometricMapNode, didTapTower col: Int, row: Int) {
        dismissTowerMenu()
        guard let tower = gameState.tower(at: col, row: row) else { return }
        let scenePos = tileScenePosition(col: col, row: row)
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

    private func tileScenePosition(col: Int, row: Int) -> CGPoint {
        let sp = PathfindingManager.screenPosition(col: col, row: row)
        return CGPoint(x: mapNode.position.x + sp.x, y: mapNode.position.y + sp.y)
    }
}

// MARK: - TowerMenuDelegate

extension GameScene: TowerMenuDelegate {
    func towerMenu(_ menu: TowerMenu, didSelectPlace type: TowerType, at col: Int, row: Int) {
        towerMenu = nil
        placeTower(type: type, col: col, row: row)
    }

    func towerMenu(_ menu: TowerMenu, didSelectUpgrade towerID: UUID) {
        towerMenu = nil
        upgradeTower(id: towerID)
    }

    func towerMenu(_ menu: TowerMenu, didSelectSell towerID: UUID) {
        towerMenu = nil
        sellTower(id: towerID)
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
        let nextWave = waveIndex + 2
        if nextWave <= gameState.totalWaves {
            hud.setStartWaveEnabled(true)
            hud.setStartWaveTitle("▶ Wave \(nextWave)")
        }
    }

    func waveManagerDidCompleteAllWaves(_ manager: WaveManager) {
        run(SKAction.repeatForever(SKAction.sequence([
            SKAction.wait(forDuration: 0.1),
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
        sqrt(Double((x - other.x) * (x - other.x) + (y - other.y) * (y - other.y)))
    }
}

