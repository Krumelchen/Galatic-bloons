import Foundation

// MARK: - Wave Manager Delegate

protocol WaveManagerDelegate: AnyObject {
    func waveManager(_ manager: WaveManager, didSpawnEnemy type: EnemyType)
    func waveManagerDidCompleteWave(_ manager: WaveManager, waveIndex: Int)
    func waveManagerDidCompleteAllWaves(_ manager: WaveManager)
}

// MARK: - Wave Manager

/// Spawns enemy waves in sequence using DispatchQueue timers.
/// Each wave spawns enemies at `spawnInterval` seconds apart.
final class WaveManager {

    weak var delegate: WaveManagerDelegate?

    private let waves: [WaveData]
    private var currentWaveIndex: Int = 0
    private var isRunning: Bool = false
    private var spawnWorkItems: [DispatchWorkItem] = []

    var totalWaves: Int { waves.count }
    var currentWave: Int { currentWaveIndex }

    init(waves: [WaveData]) {
        self.waves = waves
    }

    // MARK: - Control

    /// Starts spawning the next wave. Does nothing if all waves are done or a wave is in progress.
    func startNextWave() {
        guard !isRunning, currentWaveIndex < waves.count else { return }
        let wave = waves[currentWaveIndex]
        isRunning = true
        spawnWave(wave, waveIndex: currentWaveIndex)
    }

    func cancelAll() {
        spawnWorkItems.forEach { $0.cancel() }
        spawnWorkItems.removeAll()
        isRunning = false
    }

    // MARK: - Private

    private func spawnWave(_ wave: WaveData, waveIndex: Int) {
        // Flatten enemy list: e.g. [{xarrScout, 3}] → [.xarrScout, .xarrScout, .xarrScout]
        var enemyQueue: [EnemyType] = []
        for spawnData in wave.enemies {
            guard let type = EnemyType(rawValue: spawnData.type) else { continue }
            enemyQueue.append(contentsOf: Array(repeating: type, count: spawnData.count))
        }

        let interval = wave.spawnInterval
        for (index, enemyType) in enemyQueue.enumerated() {
            let delay = Double(index) * interval
            let item = DispatchWorkItem { [weak self] in
                guard let self else { return }
                self.delegate?.waveManager(self, didSpawnEnemy: enemyType)
            }
            spawnWorkItems.append(item)
            DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: item)
        }

        // Schedule wave-complete callback after all enemies have spawned
        let totalDelay = Double(enemyQueue.count) * interval + 0.1
        let completionItem = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.isRunning = false
            self.spawnWorkItems.removeAll()
            self.delegate?.waveManagerDidCompleteWave(self, waveIndex: waveIndex)
            self.currentWaveIndex += 1
            if self.currentWaveIndex >= self.waves.count {
                self.delegate?.waveManagerDidCompleteAllWaves(self)
            }
        }
        spawnWorkItems.append(completionItem)
        DispatchQueue.main.asyncAfter(deadline: .now() + totalDelay, execute: completionItem)
    }
}
