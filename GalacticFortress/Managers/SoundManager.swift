import SpriteKit
import AVFoundation

// MARK: - Sound Manager

/// Centralized audio manager for SFX and background music.
///
/// Phase 2: Uses placeholder silent .wav files for SFX and a background music loop.
/// Replace the audio files in Resources/Sounds/ with real assets for production.
///
/// SFX are played via SKAction (lightweight, frame-accurate).
/// Background music uses AVAudioPlayer for seamless looping.

final class SoundManager {

    static let shared = SoundManager()

    var isMuted: Bool = false {
        didSet { musicPlayer?.volume = isMuted ? 0 : musicVolume }
    }

    private var musicPlayer: AVAudioPlayer?
    private let musicVolume: Float = 0.4

    private init() {}

    // MARK: - Background Music

    func playMusic(named filename: String, ext: String = "mp3") {
        guard !isMuted else { return }
        guard let url = Bundle.main.url(forResource: filename, withExtension: ext) else {
            // Music file not found — silent in placeholder build
            return
        }
        do {
            musicPlayer = try AVAudioPlayer(contentsOf: url)
            musicPlayer?.numberOfLoops = -1   // loop forever
            musicPlayer?.volume = musicVolume
            musicPlayer?.play()
        } catch {
            print("SoundManager: failed to play music \(filename) — \(error)")
        }
    }

    func stopMusic() {
        musicPlayer?.stop()
        musicPlayer = nil
    }

    // MARK: - SFX (played on an SKNode via SKAction)

    /// Returns an SKAction that plays a sound file if it exists, otherwise returns a wait(0).
    static func sfxAction(named filename: String) -> SKAction {
        guard Bundle.main.url(forResource: filename, withExtension: "wav") != nil else {
            return SKAction.wait(forDuration: 0)   // no-op if file missing
        }
        return SKAction.playSoundFileNamed("\(filename).wav", waitForCompletion: false)
    }

    // MARK: - Convenience SFX names

    enum SFX {
        static let laserFire     = "sfx_laser"
        static let plasmaFire    = "sfx_plasma"
        static let missileFire   = "sfx_missile"
        static let empPulse      = "sfx_emp"
        static let enemyDie      = "sfx_enemy_die"
        static let bossDie       = "sfx_boss_die"
        static let coreDamage    = "sfx_core_hit"
        static let towerPlace    = "sfx_tower_place"
        static let towerUpgrade  = "sfx_upgrade"
        static let waveStart     = "sfx_wave_start"
        static let victory       = "sfx_victory"
        static let defeat        = "sfx_defeat"
    }
}
