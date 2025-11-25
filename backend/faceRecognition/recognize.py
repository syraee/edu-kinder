from fastapi import FastAPI
import os
import cv2
import numpy as np
from insightface.app import FaceAnalysis
import base64

app = FastAPI(title="Face Recognition Microservice")

# Init model
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=0, det_size=(640, 640))

CHILDREN_DIR = "faceRecognition/children"
PHOTOS_DIR = "faceRecognition/photos"
OUTPUT_DIR = "faceRecognition/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------- UTILITY FUNKCIE ----------

def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def load_child_embeddings():
    """
    Prečíta priečinky v children/
    Každý priečinok = jedno dieťa
    Každý obrázok = jeden embedding
    """
    children = {}

    for child_name in os.listdir(CHILDREN_DIR):
        child_path = os.path.join(CHILDREN_DIR, child_name)
        if not os.path.isdir(child_path):
            continue

        embeddings = []

        for img_file in os.listdir(child_path):
            img_path = os.path.join(child_path, img_file)
            img = cv2.imread(img_path)

            if img is None:
                continue

            faces = face_app.get(img)
            if len(faces) == 0:
                continue

            embeddings.append(faces[0].embedding)

        if len(embeddings) > 0:
            children[child_name] = embeddings

    return children


# DATABÁZA NAČÍTANÁ PRI ŠTARTE
children_db = load_child_embeddings()


def recognize_faces_from_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return []

    faces = face_app.get(img)
    if len(faces) == 0:
        return []

    results = []

    for face in faces:
        emb = face.embedding

        best_name = None
        best_sim = -999

        for child_name, child_emb_list in children_db.items():
            # ber max similarity zo všetkých embeddings dieťaťa
            sim = max(cosine_similarity(emb, e) for e in child_emb_list)

            if sim > best_sim:
                best_sim = sim
                best_name = child_name

        # threshold – typické pre insightface
        if best_sim >= 0.4:
            results.append({"name": best_name, "similarity": best_sim})
        else:
            results.append({"name": "UNKNOWN", "similarity": best_sim})

    return results

def blur_faces_in_image(image_path, detections):
    img = cv2.imread(image_path)
    if img is None:
        return None

    for det in detections:
        if det["name"] == "UNKNOWN":
            continue  # neblurujeme neznámych

        face = det["_face"]
        x1, y1, x2, y2 = face.bbox.astype(int)

        # Vyrezanie face regionu
        face_region = img[y1:y2, x1:x2]

        # Blurovanie
        blurred = cv2.GaussianBlur(face_region, (51, 51), 30)

        # Vloženie
        img[y1:y2, x1:x2] = blurred

    output_path = os.path.join(OUTPUT_DIR, "blurred.jpg")
    cv2.imwrite(output_path, img)

    return output_path

# ---------- ENDPOINT NA TEST ----------

@app.get("/recognize-test-blur")
def recognize_test_blur():
    test_photo = os.path.join(PHOTOS_DIR, "test.jpg")

    img = cv2.imread(test_photo)
    if img is None:
        return {"error": "Test photo not found"}

    faces = face_app.get(img)

    detections = []
    for face in faces:
        emb = face.embedding

        best_name = None
        best_sim = -999

        for child_name, child_emb_list in children_db.items():
            sim = max(cosine_similarity(emb, e) for e in child_emb_list)
            if sim > best_sim:
                best_sim = sim
                best_name = child_name

        final_name = best_name if best_sim >= 0.4 else "UNKNOWN"

        detections.append({
            "name": final_name,
            "similarity": best_sim,
            "_face": face
        })

    output = blur_faces_in_image(test_photo, detections)

    return {
        "detections": [
            {"name": d["name"], "similarity": d["similarity"]}
            for d in detections
        ],
        "blurred_image_path": output
    }

@app.get("/recognize-test")
def recognize_test():
    test_photo = os.path.join(PHOTOS_DIR, "test.jpg")
    return recognize_faces_from_image(test_photo)
