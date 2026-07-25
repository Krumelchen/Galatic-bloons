import UIKit
import SpriteKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let window = UIWindow(windowScene: windowScene)
        let vc = GameViewController()
        window.rootViewController = vc
        self.window = window
        window.makeKeyAndVisible()
    }
}

// MARK: - Game View Controller

final class GameViewController: UIViewController {

    override func loadView() {
        let skView = SKView()
        skView.ignoresSiblingOrder = true       // use zPosition for ordering
        skView.showsFPS = false
        skView.showsNodeCount = false
        #if DEBUG
        skView.showsFPS = true
        skView.showsNodeCount = true
        #endif
        self.view = skView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        presentMainMenu()
    }

    private func presentMainMenu() {
        guard let skView = view as? SKView else { return }
        let scene = MainMenuScene(size: skView.bounds.size)
        scene.scaleMode = .aspectFill
        skView.presentScene(scene)
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        .landscape
    }

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
}
