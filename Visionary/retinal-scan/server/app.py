from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"])



model = load_model('model/best_model_2_augmented.h5')



class_names = [
    'Normal',               # N
    'Diabetes',             # D
    'Glaucoma',             # G
    'Cataract',             # C
    'Age-related',          # A
    'Hypertension',         # H
    'Macular Degeneration', # M
    'Other'                 # O
]


@app.route('/predict', methods=['POST'])
def predict():
    print("called-----------------------------------------------")
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    
    
    img = Image.open(file.stream).convert("RGB")
    img = img.resize((448, 224)) 
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)


   
    predictions = model.predict(img_array)[0]  
    threshold = 0.3
    print(predictions)
   
    result = [
        {"label": class_names[i], "probability": float(predictions[i])}
        for i in range(len(predictions)) if predictions[i] >= threshold
    ]

    print(result)
    
    
    
    if not result:
        max_index = np.argmax(predictions)
        result = [{
            "label": class_names[max_index],
            "probability": float(predictions[max_index])
        }]

    return jsonify({"predictions": result})

if __name__ == '__main__':
    app.run(debug=True)