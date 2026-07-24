import AVFoundation
import MediaPlayer
import SwiftUI
import WatchKit

/// The voiced rosary on the wrist: pick up the AirPods route, then the whole
/// sequence flows on its own — screen, ring and clips advancing together.
struct AudioPlayView: View {
    @ObservedObject var session: RosarySession
    @StateObject private var player = RosaryAudioPlayer()

    var body: some View {
        Group {
            if player.finished {
                CompletedView()
            } else {
                playerView
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(session.sectionLabel)
        .onAppear { player.begin(session: session) }
        .onDisappear { player.stop() }
    }

    private var playerView: some View {
        ZStack {
            if let bead = session.step.bead {
                DecadeRing(current: bead.index, count: bead.count)
            }

            VStack(spacing: 6) {
                Text(session.step.title)
                    .font(.headline)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                if let bead = session.step.bead, bead.index > 0 {
                    Text("\(bead.index) de \(bead.count)")
                        .font(.system(.title3, design: .rounded).weight(.bold))
                        .foregroundStyle(Color.accentColor)
                }

                HStack(spacing: 10) {
                    Button {
                        player.skipBack()
                    } label: {
                        Image(systemName: "backward.fill")
                    }
                    .buttonStyle(.plain)

                    Button {
                        player.togglePlayback()
                    } label: {
                        Image(systemName: player.playing ? "pause.circle.fill" : "play.circle.fill")
                            .font(.system(size: 38))
                            .foregroundStyle(Color.accentColor)
                    }
                    .buttonStyle(.plain)

                    Button {
                        player.skipForward()
                    } label: {
                        Image(systemName: "forward.fill")
                    }
                    .buttonStyle(.plain)
                }

                Button("\(player.rate.formatted())x") {
                    player.cycleRate()
                }
                .font(.footnote.weight(.semibold))
                .buttonStyle(.bordered)
                .controlSize(.mini)
            }
            .padding(.horizontal, 24)
        }
    }
}

/// One AVPlayer walked manually through the step clips, so skipping works in
/// both directions and the playback rate survives every transition.
final class RosaryAudioPlayer: NSObject, ObservableObject {
    @Published var playing = false
    @Published var finished = false
    @Published var rate: Double = 1

    private let rates: [Double] = [1, 1.25, 1.5, 1.75, 2]
    private let player = AVPlayer()
    private var session: RosarySession?
    private var itemObserver: NSObjectProtocol?

    func begin(session: RosarySession) {
        guard self.session == nil else { return }
        self.session = session

        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setCategory(.playback, mode: .spokenAudio, policy: .longFormAudio)

        // watchOS requires the route picker (AirPods) before long-form playback.
        audioSession.activate(options: []) { [weak self] success, _ in
            DispatchQueue.main.async {
                if success {
                    self?.configureRemoteCommands()
                    self?.playCurrent()
                } else {
                    self?.finished = false
                }
            }
        }

        itemObserver = NotificationCenter.default.addObserver(
            forName: AVPlayerItem.didPlayToEndTimeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.advance()
        }
    }

    func stop() {
        player.pause()
        playing = false

        if let itemObserver {
            NotificationCenter.default.removeObserver(itemObserver)
        }
    }

    func togglePlayback() {
        if playing {
            player.pause()
            playing = false
        } else {
            player.rate = Float(rate)
            playing = true
        }
    }

    func skipForward() {
        advance()
    }

    func skipBack() {
        guard let session else { return }
        session.goBack()
        playCurrent()
    }

    func cycleRate() {
        rate = rates[((rates.firstIndex(of: rate) ?? 0) + 1) % rates.count]

        if playing {
            player.rate = Float(rate)
        }
    }

    private func advance() {
        guard let session else { return }

        if session.isLast {
            WKInterfaceDevice.current().play(.success)
            playing = false
            finished = true
            return
        }

        session.advance()
        WKInterfaceDevice.current().play(.click)
        playCurrent()
    }

    private func playCurrent() {
        guard let session,
              let url = RosaryLibrary.resourceURL(name: session.step.audio, ext: "mp3")
        else {
            return
        }

        player.replaceCurrentItem(with: AVPlayerItem(url: url))
        player.rate = Float(rate)
        playing = true
        updateNowPlaying()
    }

    private func configureRemoteCommands() {
        let center = MPRemoteCommandCenter.shared()

        center.playCommand.addTarget { [weak self] _ in
            self?.togglePlayback()
            return .success
        }
        center.pauseCommand.addTarget { [weak self] _ in
            self?.togglePlayback()
            return .success
        }
        center.nextTrackCommand.addTarget { [weak self] _ in
            self?.skipForward()
            return .success
        }
        center.previousTrackCommand.addTarget { [weak self] _ in
            self?.skipBack()
            return .success
        }
    }

    private func updateNowPlaying() {
        guard let session else { return }

        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: session.step.title,
            MPMediaItemPropertyArtist: "Santo Rosario · \(session.rosarySet.name)",
        ]
    }
}
