from fastapi import FastAPI, UploadFile, File, Request, Form
from fastapi.responses import JSONResponse
from insightface.app import FaceAnalysis
import os
import cv2
import json
import numpy as np
import io
from typing import List

app = FastAPI(title="Face Recognition Microservice")

face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=0, det_size=(640, 640))

CHILDREN_DIR = "faceRecognition/children"
PHOTOS_DIR = "faceRecognition/photos"
OUTPUT_DIR = "faceRecognition/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def load_child_embeddings():
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
        if embeddings:
            children[child_name] = embeddings
    return children

children_db = load_child_embeddings()

def to_list_floats(arr: np.ndarray):
    return [float(x) for x in arr.tolist()]

def to_numpy(arr: List[float]):
    return np.array(arr, dtype=np.float32)

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
            sim = max(cosine_similarity(emb, e) for e in child_emb_list)
            if sim > best_sim:
                best_sim = sim
                best_name = child_name
        results.append({
            "name": best_name if best_sim >= 0.4 else "UNKNOWN",
            "similarity": best_sim
        })
    return results

def blur_faces_in_image(image_path, detections):
    img = cv2.imread(image_path)
    if img is None:
        return None
    for det in detections:
        if det["name"] == "UNKNOWN":
            continue
        face = det["_face"]
        x1, y1, x2, y2 = face.bbox.astype(int)
        face_region = img[y1:y2, x1:x2]
        blurred = cv2.GaussianBlur(face_region, (51, 51), 30)
        img[y1:y2, x1:x2] = blurred
    output_path = os.path.join(OUTPUT_DIR, "blurred.jpg")
    cv2.imwrite(output_path, img)
    return output_path

@app.get("/recognize-test-blur")
def recognize_test_blur():
    test_photo = os.path.join(PHOTOS_DIR, "images.jpg")
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
        final_name = best_name if best_sim >= 0.3 else "UNKNOWN"
        detections.append({"name": final_name, "similarity": best_sim, "_face": face})

    output = blur_faces_in_image(test_photo, detections)
    return {
        "detections": [{"name": d["name"], "similarity": d["similarity"]} for d in detections],
        "blurred_image_path": output
    }

@app.get("/recognize-test")
def recognize_test():
    test_photo = os.path.join(PHOTOS_DIR, "testik.jpg")
    return recognize_faces_from_image(test_photo)

@app.post("/count_faces")
async def count_faces(photo: UploadFile = File(...)):
        contents = await photo.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image file"})

        faces = face_app.get(img)
        return {"faceCount": len(faces)}

@app.post("/extract_embedding")
async def extract_embedding(photo: UploadFile = File(...)):
    contents = await photo.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})

    faces = face_app.get(img)
    if len(faces) == 0:
        return JSONResponse(status_code=400, content={"error": "No face detected"})

    embedding = faces[0].embedding.tolist()
    return {"embedding": embedding}

@app.post("/recognize_faces")
async def recognize_faces(
        file: UploadFile = File(...),
        children: str = Form(...)
):
    if not children:
        return {"error": "Missing children data"}

    children_db: Dict[str, Dict] = json.loads(children)

    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    img = cv2.imread(temp_path)
    os.remove(temp_path)

    if img is None:
        return {"error": "Invalid image"}

    # 4. Získať face embeddings
    faces = face_app.get(img)  # face_app musí byť inicializovaný inde

    if len(faces) == 0:
        return {"faces": []}

    results = []

    # 5. Porovnať každé face embedding s databázou detí
    for face in faces:
        face_emb = face.embedding.astype(np.float32)

        best_child_id = None
        best_child_name = None
        best_sim = -1.0

        for child_id, child_data in children_db.items():
            embeddings = child_data.get("embeddings", [])
            sims = [cosine_similarity(face_emb, np.array(e, dtype=np.float32)) for e in embeddings]
            sim = max(sims) if sims else -1.0

            if sim > best_sim:
                best_sim = sim
                best_child_id = child_id
                best_child_name = child_data.get("name", "UNKNOWN")

        # Prah similarity
        if best_sim < 0.4:
            results.append({
                "id": None,
                "name": "UNKNOWN",
                "similarity": best_sim
            })
        else:
            results.append({
                "id": best_child_id,
                "name": best_child_name,
                "similarity": best_sim
            })

    return {"faces": results}