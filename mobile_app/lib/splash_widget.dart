import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'rohobot_app.dart';

/// A simple full‑screen splash that plays the bundled MP4 video.
/// When the video finishes (or is tapped), it replaces itself with the
/// actual application (`RohobotApp`).
class SplashWidget extends StatefulWidget {
  const SplashWidget({super.key});

  @override
  State<SplashWidget> createState() => _SplashWidgetState();
}

class _SplashWidgetState extends State<SplashWidget> {
  late final VideoPlayerController _controller;
  bool _videoFinished = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.asset('assets/download.mp4')
      ..initialize().then((_) {
        // Ensure the first frame is shown.
        setState(() {});
        _controller.play();
      });
    _controller.addListener(_checkCompletion);
  }

  void _checkCompletion() {
    if (_controller.value.isInitialized &&
        _controller.value.position >= _controller.value.duration) {
      // Video reached the end.
      _controller.removeListener(_checkCompletion);
      setState(() => _videoFinished = true);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_checkCompletion);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // When the video is done, display the real app.
    if (_videoFinished) {
      return const RohobotApp();
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: _controller.value.isInitialized
            ? AspectRatio(
                aspectRatio: _controller.value.aspectRatio,
                child: VideoPlayer(_controller),
              )
            : const CircularProgressIndicator(),
      ),
    );
  }
}
