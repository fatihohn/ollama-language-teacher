import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel

# Load the Whisper model (you can change the model size)
model = WhisperModel("small")


def callback(indata, frames, time, status):
    if status:
        print(status)

    audio = np.squeeze(indata)  # Convert stereo to mono
    segments, _ = model.transcribe(audio, beam_size=5)

    for segment in segments:
        print(segment.text)


# Set up the microphone stream
with sd.InputStream(callback=callback, samplerate=16000, channels=1):
    print("Listening...")
    input()  # Keep running until user input
