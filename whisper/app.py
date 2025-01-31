from flask import Flask, request, jsonify
import torch
import io
import torchaudio
import traceback
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from pydub import AudioSegment
import numpy as np

# Initialize the Flask app
app = Flask(__name__)

# Load Whisper model and processor
processor = WhisperProcessor.from_pretrained("openai/whisper-large")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large")

# Set up device (GPU or CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # try:
    #     data = request.get_json()
    #     print(f"Received data:", data)
        
    #     if 'audio' not in request.files:
    #         raise ValueError("Missing 'audio' key in request payload")
        
    #     # Read audio file
    #     audio_file = request.files['audio']
    #     audio_bytes = audio_file.read()
    #     audio_input = io.BytesIO(audio_bytes)

    #     # # Convert audio to tensor
    #     # waveform, sample_rate = torchaudio.load(audio_input)
    #     # inputs = processor(waveform, sampling_rate=sample_rate, return_tensors="pt")
    #     # inputs = inputs.to(device)
        
        
    #     # ✅ Resample to 16kHz (Whisper requirement)
    #     audio = audio.set_frame_rate(16000).set_channels(1)

    #     # ✅ Convert to NumPy array
    #     samples = np.array(audio.get_array_of_samples()).astype(np.float32) / 32768.0  # Normalize to [-1, 1]

    #     # ✅ Process for Whisper
    #     inputs = processor(samples, sampling_rate=16000, return_tensors="pt").to(device)


    #     # Run the model for transcription
    #     with torch.no_grad():
    #         predicted_ids = model.generate(inputs["input_values"])
        
    #     # Decode the transcribed text
    #     transcription = processor.decode(predicted_ids[0], skip_special_tokens=True)

    #     return jsonify({"text": transcription}), 200
    try:
        # ✅ Ensure file is present
        if "audio" not in request.files:
            raise ValueError("Missing 'audio' key in request payload")

        # ✅ Read audio file
        audio_file = request.files["audio"]
        audio_bytes = audio_file.read()
        
        # ✅ Use torchaudio to load and resample audio to 16kHz
        waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))

        # If the audio is not already at 16kHz, resample it
        if sample_rate != 16000:
            resample_transform = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resample_transform(waveform)

        # ✅ Convert waveform to the format Whisper requires
        waveform = waveform.squeeze().numpy()  # Remove extra dimensions and convert to numpy array

        # ✅ Process audio for Whisper
        inputs = processor(waveform, sampling_rate=16000, return_tensors="pt").to(device)

        with torch.no_grad():
            predicted_ids = model.generate(inputs["input_values"])

        # Decode transcription
        transcription = processor.decode(predicted_ids[0], skip_special_tokens=True)

        return jsonify({"text": transcription}), 200

    except Exception as e:
        print("Error during transcription:", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred while processing the audio."}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
