import Foundation

// MARK: - Level JSON structure

struct GridSize: Codable {
    let cols: Int
    let rows: Int
}

struct EnemySpawnData: Codable {
    let type: String        // matches EnemyType.rawValue
    let count: Int
}

struct WaveData: Codable {
    let enemies: [EnemySpawnData]
    let spawnInterval: TimeInterval
}

struct LevelData: Codable {
    let id: String
    let name: String
    let planet: String
    let gridSize: GridSize
    let spawnPoint: [Int]           // [col, row]
    let corePoint: [Int]            // [col, row]
    let path: [[Int]]               // ordered [col, row] waypoints enemy follows
    let buildSpots: [[Int]]         // [col, row] positions where towers can be placed
    let waves: [WaveData]
}

// MARK: - Level Loader

enum LevelLoader {
    static func load(named filename: String) -> LevelData? {
        guard let url = Bundle.main.url(forResource: filename, withExtension: "json") else {
            print("LevelLoader: could not find \(filename).json in bundle")
            return nil
        }
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            return try decoder.decode(LevelData.self, from: data)
        } catch {
            print("LevelLoader: failed to decode \(filename).json — \(error)")
            return nil
        }
    }
}
