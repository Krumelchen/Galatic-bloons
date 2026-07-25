import Foundation

// MARK: - Game State

/// Central mutable state for a single play session.
final class GameState {

    // MARK: - Resources
    var credits: Int
    var coreHP: Int
    let maxCoreHP: Int

    // MARK: - Progression
    var currentWave: Int        // 1-based
    var totalWaves: Int
    var isGameOver: Bool
    var isVictory: Bool

    // MARK: - Placed towers (model layer — nodes tracked separately in scene)
    var towers: [Tower]

    // MARK: - Callbacks (set by GameScene)
    var onCreditsChanged: ((Int) -> Void)?
    var onCoreHPChanged: ((Int) -> Void)?
    var onWaveChanged: ((Int, Int) -> Void)?
    var onGameOver: ((Bool) -> Void)?   // Bool = victory

    // MARK: - Init

    init(startingCredits: Int = 300, coreHP: Int = 100, totalWaves: Int = 5) {
        self.credits = startingCredits
        self.coreHP = coreHP
        self.maxCoreHP = coreHP
        self.totalWaves = totalWaves
        self.currentWave = 0
        self.isGameOver = false
        self.isVictory = false
        self.towers = []
    }

    // MARK: - Credits

    func canAfford(_ cost: Int) -> Bool { credits >= cost }

    /// Returns true if successful.
    @discardableResult
    func spend(_ amount: Int) -> Bool {
        guard credits >= amount else { return false }
        credits -= amount
        onCreditsChanged?(credits)
        return true
    }

    func earn(_ amount: Int) {
        credits += amount
        onCreditsChanged?(credits)
    }

    // MARK: - Core damage

    /// Damage the planet core. Triggers game-over when HP hits 0.
    func damageCore(by amount: Int) {
        coreHP = max(0, coreHP - amount)
        onCoreHPChanged?(coreHP)
        if coreHP <= 0 && !isGameOver {
            isGameOver = true
            isVictory = false
            onGameOver?(false)
        }
    }

    // MARK: - Wave tracking

    func advanceWave() {
        currentWave += 1
        onWaveChanged?(currentWave, totalWaves)
    }

    func markVictory() {
        guard !isGameOver else { return }
        isGameOver = true
        isVictory = true
        onGameOver?(true)
    }

    // MARK: - Tower management

    func addTower(_ tower: Tower) {
        towers.append(tower)
    }

    func removeTower(id: UUID) {
        towers.removeAll { $0.id == id }
    }

    func tower(at col: Int, row: Int) -> Tower? {
        towers.first { $0.gridCol == col && $0.gridRow == row }
    }
}
